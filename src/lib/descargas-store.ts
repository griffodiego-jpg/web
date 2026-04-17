import { headers } from "next/headers";
import { getRedis } from "@/lib/kv";
import {
  catalogoGeneralPdf,
  materialPorProducto,
  recursosGated,
  type MaterialProducto,
  type RecursoGated,
} from "@/data/descargas";

/**
 * Storage de URLs de descarga en Upstash Redis.
 *
 * El admin sube archivos a Vercel Blob → las URLs se guardan en un
 * hash Redis con una clave por slot. El sitio público lee de Redis
 * y cae al path estático de `src/data/descargas.ts` si no hay
 * override.
 *
 * Claves del hash `downloads:urls`:
 *   - "catalogo-general"
 *   - "material:<slug>:flyer"
 *   - "material:<slug>:videoRrss"
 *   - "gated:<recursoId>"
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
 * Devuelve el URL efectivo para un slot: override de Redis si existe,
 * fallback al default de src/data/descargas.ts.
 */
export function resolveSlotUrl(
  slot: DescargaSlot,
  overrides: Record<string, string>
): string | undefined {
  const override = overrides[slotKey(slot)];
  if (override) return override;
  switch (slot.kind) {
    case "catalogo-general":
      return catalogoGeneralPdf;
    case "material": {
      const m = materialPorProducto.find((x) => x.slug === slot.slug);
      return slot.type === "flyer" ? m?.flyer : m?.videoRrss;
    }
    case "gated": {
      const r = recursosGated.find((x) => x.id === slot.id);
      return r?.fileUrl;
    }
  }
}

/**
 * Chequea que un URL sea servible.
 *
 * - Absolutos (https://... de Vercel Blob): asumimos OK (si el admin
 *   subió, Blob lo tiene).
 * - Relativos (/foo.pdf): HEAD request contra el origen de la request
 *   actual. Esto funciona tanto en dev (serve local) como en Vercel
 *   (los archivos en /public se sirven vía CDN). No podemos usar
 *   fs.access porque el serverless function no incluye /public.
 */
async function urlIsServable(url: string | undefined): Promise<boolean> {
  if (!url) return false;
  if (/^https?:\/\//.test(url)) return true;
  try {
    const h = await headers();
    const host = h.get("host");
    if (!host) return false;
    const proto =
      h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    const full = `${proto}://${host}${url}`;
    const res = await fetch(full, {
      method: "HEAD",
      // Evitamos cache para que la página refresque cuando suben
      // un archivo nuevo vía GitHub + redeploy.
      cache: "no-store",
    });
    return res.ok;
  } catch (e) {
    console.error("[descargas-store] HEAD check falló:", e);
    return false;
  }
}

/**
 * Resuelve las estructuras completas del descargas.ts con overrides
 * aplicados. Esto es lo que usa la página /catalogo/download.
 *
 * URLs que no existen físicamente (ni subidos a Blob, ni presentes en
 * /public) se devuelven como undefined para que la página no renderice
 * download links rotos.
 */
export async function resolveDescargas(): Promise<{
  catalogoGeneralPdf: string | undefined;
  materialPorProducto: (MaterialProducto & { available: boolean })[];
  recursosGated: (RecursoGated & { available: boolean })[];
}> {
  const overrides = await readOverrides();

  const rawCatalogo =
    resolveSlotUrl({ kind: "catalogo-general" }, overrides) ??
    catalogoGeneralPdf;
  const catalogoAvailable = await urlIsServable(rawCatalogo);

  const material = await Promise.all(
    materialPorProducto.map(async (m) => {
      const flyer = resolveSlotUrl(
        { kind: "material", slug: m.slug, type: "flyer" },
        overrides
      );
      const videoRrss = resolveSlotUrl(
        { kind: "material", slug: m.slug, type: "videoRrss" },
        overrides
      );
      const [flyerOk, videoOk] = await Promise.all([
        urlIsServable(flyer),
        urlIsServable(videoRrss),
      ]);
      return {
        slug: m.slug,
        flyer: flyerOk ? flyer : undefined,
        videoRrss: videoOk ? videoRrss : undefined,
        available: flyerOk || videoOk,
      };
    })
  );

  const gated = await Promise.all(
    recursosGated.map(async (r) => {
      const url = resolveSlotUrl({ kind: "gated", id: r.id }, overrides);
      const available = await urlIsServable(url);
      return { ...r, fileUrl: url ?? r.fileUrl, available };
    })
  );

  return {
    catalogoGeneralPdf: catalogoAvailable ? rawCatalogo : undefined,
    materialPorProducto: material,
    recursosGated: gated,
  };
}
