import {
  getProductByCode,
  listCatalog,
} from "@/lib/api/specparts";
import { getRedis } from "@/lib/kv";
import type { CatalogProduct } from "@/types/specparts";

/**
 * Novedades (lanzamientos / nuevas aplicaciones).
 *
 * Fuente de verdad: lista en Redis bajo la key `novedades:publicadas`.
 * Guardamos SOLO el código SKU + tipo + metadata mínima — los datos
 * del producto (vehículos, imagen, descripción) los leemos de SpecParts
 * al momento de renderizar. Así la novedad se mantiene sincronizada
 * con el catálogo sin duplicar data.
 *
 * Claves:
 *   - Lista `novedades:publicadas` con JSON de NovedadPublicada.
 *     LPUSH al publicar (más reciente primero).
 */

const REDIS_KEY = "novedades:publicadas";

export type TipoNovedad = "lanzamiento" | "aplicacion";

/** Lo que se guarda en Redis — mínima metadata sobre el código SKU. */
export type NovedadPublicada = {
  code: string;                  // SKU de SpecParts, ej. "238-32"
  tipo: TipoNovedad;
  publishedAt: number;           // timestamp ms
  /** Override opcional del título (sino se usa `product.product` de SpecParts). */
  tituloOverride?: string;
  /** Override opcional de la descripción (sino se usa `product.description`). */
  descripcionOverride?: string;
  /** Override opcional de la fecha visible (sino usa publishedAt). */
  fechaVisibleOverride?: string; // ISO date (YYYY-MM-DD)
};

/** Novedad enriquecida con datos reales de SpecParts — lo que renderiza la página. */
export type Novedad = {
  code: string;
  tipo: TipoNovedad;
  titulo: string;
  descripcion: string;
  fecha: Date;                   // para mostrar
  linea: string | null;          // product.category
  imagen: string | null;
  vehiculos: VehiculoNovedad[];
  /** Slug del producto destacado si corresponde (para linkear a /productos), sino null. */
  destacadoSlug: string | null;
  /** Slug del producto en el catálogo — para linkear a /catalogo/[slug]. */
  catalogoSlug: string;
};

export type VehiculoNovedad = {
  brand: string;
  master_model: string;
  model: string;
  version: string;
  sold_from_year?: number;
  sold_until_year?: number;
};

/** Lee la lista completa de novedades publicadas desde Redis. */
export async function readPublicadas(): Promise<NovedadPublicada[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const raw = await redis.lrange(REDIS_KEY, 0, -1);
    return raw
      .map((entry) => {
        if (typeof entry === "string") {
          try {
            return JSON.parse(entry) as NovedadPublicada;
          } catch {
            return null;
          }
        }
        return entry as NovedadPublicada;
      })
      .filter((x): x is NovedadPublicada => x !== null);
  } catch (e) {
    console.error("[novedades] error leyendo Redis:", e);
    return [];
  }
}

/** Publica una novedad (LPUSH, más reciente arriba). Si ya existe ese código, la reemplaza. */
export async function publicarNovedad(n: NovedadPublicada): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  const existing = await readPublicadas();
  const filtered = existing.filter((x) => x.code !== n.code);
  // Reescribimos la lista entera (más simple que multi-commands).
  await redis.del(REDIS_KEY);
  const all = [n, ...filtered];
  if (all.length > 0) {
    await redis.rpush(
      REDIS_KEY,
      ...all.map((x) => JSON.stringify(x))
    );
  }
}

/** Despublica una novedad por código. No-op si no existe. */
export async function despublicarNovedad(code: string): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  const existing = await readPublicadas();
  const filtered = existing.filter((x) => x.code !== code);
  await redis.del(REDIS_KEY);
  if (filtered.length > 0) {
    await redis.rpush(
      REDIS_KEY,
      ...filtered.map((x) => JSON.stringify(x))
    );
  }
}

/**
 * Enriquece una NovedadPublicada con datos reales de SpecParts.
 * Si el producto no existe en el catálogo actual, devuelve null
 * (probablemente código mal o producto discontinuado).
 */
async function enrichOne(
  publicada: NovedadPublicada,
  getSlug: (code: string) => string | null
): Promise<Novedad | null> {
  const product = await getProductByCode(publicada.code);
  if (!product) return null;

  const fecha = publicada.fechaVisibleOverride
    ? new Date(publicada.fechaVisibleOverride)
    : new Date(publicada.publishedAt);

  return {
    code: product.code,
    tipo: publicada.tipo,
    titulo:
      publicada.tituloOverride?.trim() ||
      product.product ||
      product.description ||
      product.code,
    descripcion:
      publicada.descripcionOverride?.trim() ||
      product.description ||
      "",
    fecha,
    linea: product.category ?? null,
    imagen: firstPictureUrl(product),
    vehiculos: product.vehicles.map((v) => ({
      brand: v.brand,
      master_model: v.master_model,
      model: v.model,
      version: v.version,
      sold_from_year: v.sold_from_year,
      sold_until_year: v.sold_until_year,
    })),
    destacadoSlug: getSlug(product.code),
    catalogoSlug: product.slug,
  };
}

function firstPictureUrl(p: CatalogProduct): string | null {
  const ordered = p.pictures.slice().sort((a, b) => a.sort_order - b.sort_order);
  const nonBlueprint = ordered.find((x) => !x.is_blueprint);
  return nonBlueprint?.image_url ?? ordered[0]?.image_url ?? null;
}

/**
 * Lee novedades publicadas y las enriquece con datos del catálogo.
 * Ordena por fecha descendente.
 */
export async function listNovedades(): Promise<Novedad[]> {
  const publicadas = await readPublicadas();
  if (publicadas.length === 0) return [];

  const { getFeaturedSlug } = await import("@/data/featured-products");

  const enriched = await Promise.all(
    publicadas.map((p) => enrichOne(p, getFeaturedSlug))
  );
  const valid = enriched.filter((x): x is Novedad => x !== null);
  return valid.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

/** Por código individual (para página de detalle). */
export async function getNovedad(code: string): Promise<Novedad | null> {
  const novedades = await listNovedades();
  return (
    novedades.find(
      (n) =>
        n.code.toUpperCase().replace(/\s+/g, "") ===
        code.toUpperCase().replace(/\s+/g, "")
    ) ?? null
  );
}

/**
 * Lista los últimos N productos actualizados en SpecParts, ordenados
 * por `updated_at` desc. Se usa en /admin/novedades como "feed de
 * candidatos" para publicar con un click.
 */
export async function listCandidatosRecientes(limit = 20): Promise<CatalogProduct[]> {
  const products = await listCatalog();
  return products
    .filter((p) => p.enabled && !p.discontinued && p.updated_at)
    .slice()
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, limit);
}
