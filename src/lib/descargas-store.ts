import { readdirSync } from "fs";
import path from "path";
import { getRedis } from "@/lib/kv";
import {
  materialPorProducto as materialConfig,
  recursosGated as recursosConfig,
  type MaterialProducto,
  type RecursoGated,
} from "@/data/descargas";

/**
 * Storage de URLs de descarga.
 *
 * Fuentes de verdad (en orden de precedencia):
 *   1. Override en Redis (hash `downloads:urls`) — subidos por el admin
 *      a Vercel Blob.
 *   2. Archivo físico en /public/downloads o /public/pdfs — subidos
 *      directo al repo vía GitHub web UI. Escaneamos el directorio con
 *      fs.readdirSync para encontrar el archivo sin importar el nombre
 *      (ej. "Folleto Montadora Azul.pdf" sirve igual que "flyer.pdf").
 *
 * Para que fs.readdirSync funcione en runtime de Vercel, next.config.ts
 * incluye explícitamente `public/downloads` y `public/pdfs` en el
 * bundle (outputFileTracingIncludes).
 */

const HASH_KEY = "downloads:urls";

export type DescargaSlot =
  | { kind: "catalogo-general" }
  | { kind: "material"; slug: string; type: "flyer" | "videoRrss" }
  | { kind: "gated"; id: "banco-imagenes" | "base-datos-productos" };

export function slotKey(slot: DescargaSlot): string {
  switch (slot.kind) {
    case "catalogo-general":
      return "catalogo-general";
    case "material":
      return `material:${slot.slug}:${slot.type}`;
    case "gated":
      return `gated:${slot.id}`;
  }
}

/** Lee todos los overrides del hash. */
export async function readOverrides(): Promise<Record<string, string>> {
  const redis = getRedis();
  if (!redis) return {};
  try {
    const data = (await redis.hgetall(HASH_KEY)) as Record<
      string,
      string
    > | null;
    return data ?? {};
  } catch (e) {
    console.error("[descargas-store] error leyendo:", e);
    return {};
  }
}

/** Setea el URL para un slot. */
export async function setOverride(
  slot: DescargaSlot,
  url: string
): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  await redis.hset(HASH_KEY, { [slotKey(slot)]: url });
}

/** Elimina el URL para un slot (vuelve al default del código). */
export async function clearOverride(slot: DescargaSlot): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  await redis.hdel(HASH_KEY, slotKey(slot));
}

/**
 * Lista archivos dentro de un directorio de /public que matchean una
 * extensión. Devuelve los nombres ordenados alfabéticamente y excluye
 * archivos ocultos (.gitkeep, .DS_Store).
 */
function listFiles(publicSubdir: string, extensions: string[]): string[] {
  try {
    const dir = path.join(process.cwd(), "public", publicSubdir);
    const entries = readdirSync(dir);
    return entries
      .filter((e) => !e.startsWith("."))
      .filter((e) =>
        extensions.some((ext) => e.toLowerCase().endsWith(ext.toLowerCase()))
      )
      .sort();
  } catch {
    return [];
  }
}

/** Convierte "downloads/productos/slug" + "archivo.pdf" → URL absoluta path. */
function toPublicUrl(publicSubdir: string, filename: string): string {
  // URL-encode partes individuales pero mantener los slashes del path
  const parts = publicSubdir.split("/").filter(Boolean).map(encodeURIComponent);
  return "/" + parts.join("/") + "/" + encodeURIComponent(filename);
}

/** Primer PDF en un subdir de public, URL-encoded. */
function findPdf(publicSubdir: string): string | undefined {
  const file = listFiles(publicSubdir, [".pdf"])[0];
  return file ? toPublicUrl(publicSubdir, file) : undefined;
}

/** Primer MP4/WebM en un subdir de public, URL-encoded. */
function findVideo(publicSubdir: string): string | undefined {
  const file = listFiles(publicSubdir, [".mp4", ".webm", ".mov"])[0];
  return file ? toPublicUrl(publicSubdir, file) : undefined;
}

/**
 * Resuelve el URL efectivo para un slot:
 *   1. Override de Redis (Blob) si existe.
 *   2. Archivo físico en /public/ si existe.
 *   3. undefined (no se muestra el link).
 */
export function resolveSlotUrl(
  slot: DescargaSlot,
  overrides: Record<string, string>
): string | undefined {
  const override = overrides[slotKey(slot)];
  if (override) return override;

  switch (slot.kind) {
    case "catalogo-general": {
      // En /public/pdfs/ hay garantia.pdf (usado en otra página).
      // El catálogo general es cualquier otro PDF en esa carpeta.
      const pdfs = listFiles("pdfs", [".pdf"]).filter(
        (f) => f.toLowerCase() !== "garantia.pdf"
      );
      return pdfs[0] ? toPublicUrl("pdfs", pdfs[0]) : undefined;
    }
    case "material": {
      const dir = `downloads/productos/${slot.slug}`;
      return slot.type === "flyer" ? findPdf(dir) : findVideo(dir);
    }
    case "gated": {
      const ext = slot.id === "banco-imagenes" ? [".zip"] : [".xlsx", ".xls"];
      const file = listFiles("downloads", ext)[0];
      return file ? toPublicUrl("downloads", file) : undefined;
    }
  }
}

/**
 * Resuelve las estructuras completas del descargas.ts con overrides
 * y escaneo de /public aplicados. Usado por /catalogo/download.
 */
export async function resolveDescargas(): Promise<{
  catalogoGeneralPdf: string | undefined;
  materialPorProducto: (MaterialProducto & { available: boolean })[];
  recursosGated: (RecursoGated & { available: boolean })[];
}> {
  const overrides = await readOverrides();

  const catalogoGeneralPdf = resolveSlotUrl(
    { kind: "catalogo-general" },
    overrides
  );

  const material = materialConfig.map((m) => {
    const flyer = resolveSlotUrl(
      { kind: "material", slug: m.slug, type: "flyer" },
      overrides
    );
    const videoRrss = resolveSlotUrl(
      { kind: "material", slug: m.slug, type: "videoRrss" },
      overrides
    );
    return {
      slug: m.slug,
      flyer,
      videoRrss,
      available: !!(flyer || videoRrss),
    };
  });

  const gated = recursosConfig.map((r) => {
    const url = resolveSlotUrl({ kind: "gated", id: r.id }, overrides);
    return { ...r, fileUrl: url ?? r.fileUrl, available: !!url };
  });

  return {
    catalogoGeneralPdf,
    materialPorProducto: material,
    recursosGated: gated,
  };
}
