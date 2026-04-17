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
 * Resuelve las estructuras completas del descargas.ts con overrides
 * aplicados. Esto es lo que usa la página /catalogo/download.
 */
export async function resolveDescargas(): Promise<{
  catalogoGeneralPdf: string;
  materialPorProducto: MaterialProducto[];
  recursosGated: RecursoGated[];
}> {
  const overrides = await readOverrides();

  const catalogo =
    resolveSlotUrl({ kind: "catalogo-general" }, overrides) ??
    catalogoGeneralPdf;

  const material = materialPorProducto.map((m) => ({
    slug: m.slug,
    flyer: resolveSlotUrl(
      { kind: "material", slug: m.slug, type: "flyer" },
      overrides
    ),
    videoRrss: resolveSlotUrl(
      { kind: "material", slug: m.slug, type: "videoRrss" },
      overrides
    ),
  }));

  const gated = recursosGated.map((r) => ({
    ...r,
    fileUrl: resolveSlotUrl({ kind: "gated", id: r.id }, overrides) ?? r.fileUrl,
  }));

  return {
    catalogoGeneralPdf: catalogo,
    materialPorProducto: material,
    recursosGated: gated,
  };
}
