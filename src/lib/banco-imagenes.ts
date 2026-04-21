/**
 * Banco de imágenes: ZIP con todas las fotos de los productos del
 * catálogo (SpecParts). Diseñado para enviárselo a clientes que lo
 * piden — una URL estable que siempre apunta al último ZIP generado.
 *
 * Flujo:
 *   1. Admin aprieta "Regenerar" en /admin/banco-imagenes (o el cron
 *      semanal lo dispara automáticamente).
 *   2. Bajamos todas las fotos de SpecParts S3 (~370 productos ×
 *      varias fotos c/u), las empaquetamos en ZIP, y lo subimos al
 *      Blob público.
 *   3. Guardamos la URL del Blob + metadata en Redis hash
 *      `banco-imagenes:meta`.
 *   4. El endpoint público /api/descargas/banco-imagenes.zip redirige
 *      al Blob actual.
 *
 * Estructura del ZIP:
 *   banco-imagenes-YYYY-MM-DD/
 *     codigo-1/
 *       codigo-1-01.jpg
 *       codigo-1-02.jpg
 *     codigo-2/
 *       codigo-2-01.jpg
 *
 * Límite de productos: la generación es lenta (~30-60s para 500 fotos).
 * Corre en runtime nodejs con maxDuration configurado.
 */

import "server-only";

import { put, del } from "@vercel/blob";
import JSZip from "jszip";

import { listCatalog } from "@/lib/api/specparts";
import { getRedis } from "@/lib/kv";
import type { CatalogProduct } from "@/types/specparts";

const META_KEY = "banco-imagenes:meta";
const BLOB_PATHNAME = "banco-imagenes/griffo-banco-imagenes.zip";

export type BancoImagenesMeta = {
  /** URL pública del Blob (estable hasta la próxima regeneración). */
  blobUrl: string;
  /** ISO date-time de la última generación. */
  generatedAt: string;
  /** Cantidad de fotos incluidas en el ZIP. */
  imageCount: number;
  /** Cantidad de productos con al menos una foto. */
  productCount: number;
  /** Tamaño del ZIP en bytes. */
  byteSize: number;
  /** Productos cuyas fotos no pudieron bajarse — se saltean. */
  skippedCount: number;
};

export async function readMeta(): Promise<BancoImagenesMeta | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<BancoImagenesMeta | string>(META_KEY);
    if (!raw) return null;
    return typeof raw === "string" ? (JSON.parse(raw) as BancoImagenesMeta) : raw;
  } catch {
    return null;
  }
}

async function writeMeta(meta: BancoImagenesMeta): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  await redis.set(META_KEY, JSON.stringify(meta));
}

/**
 * Indica si probablemente falten productos nuevos en el ZIP. Comparamos
 * la cantidad de productos del catálogo actual contra los que se
 * zipearon la última vez. Un gap razonable (> 3) es señal de que
 * conviene regenerar.
 */
export async function hasPossibleUpdates(
  currentProductCount: number,
): Promise<{ hasNew: boolean; diff: number }> {
  const meta = await readMeta();
  if (!meta) return { hasNew: true, diff: currentProductCount };
  const diff = currentProductCount - meta.productCount;
  return { hasNew: diff > 3, diff };
}

/**
 * Extrae la extensión del URL de la foto. Default a .jpg si no hay.
 */
function guessExtension(url: string): string {
  const match = url.match(/\.(jpg|jpeg|png|webp|gif)(?:\?|$)/i);
  return match ? match[1].toLowerCase() : "jpg";
}

function sanitizeFolder(code: string): string {
  return code.replace(/[^A-Za-z0-9_\-.]/g, "_");
}

/**
 * Baja una imagen de SpecParts con timeout razonable. Devuelve el
 * buffer o null si falla (para no frenar el ZIP entero).
 */
async function fetchImage(url: string, timeoutMs = 15_000): Promise<ArrayBuffer | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Genera el ZIP con todas las fotos. Duración esperada: 30-60 segundos.
 * Los productos sin fotos se saltean. Las fotos que fallan al bajar se
 * saltean también (no abortan la generación).
 */
export async function regenerateBancoImagenes(): Promise<BancoImagenesMeta> {
  const products = await listCatalog();
  const productsWithImages = products.filter(
    (p) => (p.pictures ?? []).length > 0,
  );

  const zip = new JSZip();
  const today = new Date().toISOString().slice(0, 10);
  const root = zip.folder(`griffo-banco-imagenes-${today}`)!;

  let imageCount = 0;
  let productCount = 0;
  let skippedCount = 0;

  const concurrency = 8;
  let idx = 0;

  async function worker() {
    while (idx < productsWithImages.length) {
      const current = idx++;
      const product = productsWithImages[current];
      const folderName = sanitizeFolder(product.code);
      const folder = root.folder(folderName)!;
      const pics = (product.pictures ?? []).slice().sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      let addedForProduct = 0;
      for (let i = 0; i < pics.length; i++) {
        const ext = guessExtension(pics[i].image_url);
        const buf = await fetchImage(pics[i].image_url);
        if (!buf) continue;
        const pad = String(i + 1).padStart(2, "0");
        folder.file(`${folderName}-${pad}.${ext}`, buf);
        addedForProduct++;
        imageCount++;
      }
      if (addedForProduct > 0) productCount++;
      else skippedCount++;
    }
  }

  await Promise.all(
    Array.from({ length: concurrency }, () => worker()),
  );

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  // Borramos el blob anterior para no acumular basura. Si falla (no
  // existía), seguimos — no es crítico.
  const previous = await readMeta();
  if (previous?.blobUrl) {
    try {
      await del(previous.blobUrl);
    } catch {
      /* ignore */
    }
  }

  const blob = await put(BLOB_PATHNAME, buffer, {
    access: "public",
    contentType: "application/zip",
    addRandomSuffix: true,
    allowOverwrite: true,
  });

  const meta: BancoImagenesMeta = {
    blobUrl: blob.url,
    generatedAt: new Date().toISOString(),
    imageCount,
    productCount,
    byteSize: buffer.byteLength,
    skippedCount,
  };
  await writeMeta(meta);
  return meta;
}

/** Cuenta cuántos productos del catálogo tienen fotos hoy. */
export async function countProductsWithImages(): Promise<number> {
  const products = await listCatalog();
  return products.filter((p: CatalogProduct) => (p.pictures ?? []).length > 0).length;
}
