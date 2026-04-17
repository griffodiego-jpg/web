import {
  getProductByCode,
  listCatalog,
} from "@/lib/api/specparts";
import { getRedis } from "@/lib/kv";
import type { CatalogProduct } from "@/types/specparts";

/**
 * Novedades — auto-detectadas desde SpecParts por `updated_at`.
 *
 * Modelo:
 *   - La "fuente de verdad" es SpecParts: cualquier producto con
 *     `updated_at` en los últimos 12 meses aparece como novedad.
 *   - Por defecto, todas se clasifican como "Nueva aplicación" (es lo
 *     que mejor aproxima el caso común: sumar vehículos a un producto
 *     existente).
 *   - El admin puede overridear por código:
 *       - Cambiar el tipo a "Lanzamiento" (key: `novedades:tipo:<code>`)
 *       - Ocultar del feed público (key: `novedades:hidden`, set)
 *   - Si no hay Redis, se muestra todo como "aplicación" sin overrides.
 *
 * Ventaja: la cliente no tiene que publicar nada. Cuando se actualiza
 * el catálogo en SpecParts, la novedad aparece sola en /novedades.
 */

const TIPO_KEY_PREFIX = "novedades:tipo:"; // código → "lanzamiento" (si override)
const HIDDEN_KEY = "novedades:hidden"; // set de códigos ocultos

/** Ventana de tiempo para considerar una novedad. */
const WINDOW_MONTHS = 12;

export type TipoNovedad = "lanzamiento" | "aplicacion";

/** Novedad enriquecida con datos reales de SpecParts — lo que renderiza la página. */
export type Novedad = {
  code: string;
  tipo: TipoNovedad;
  titulo: string;
  descripcion: string;
  fecha: Date; // fecha de actualización en SpecParts
  linea: string | null; // product.category
  imagen: string | null;
  vehiculos: VehiculoNovedad[];
  /** Slug del producto destacado si corresponde (para linkear a /productos), sino null. */
  destacadoSlug: string | null;
  /** Slug del producto en el catálogo — para linkear a /catalogo/[slug]. */
  catalogoSlug: string;
  /** Si el admin ocultó esta novedad del feed público (solo visible en admin). */
  hidden: boolean;
};

export type VehiculoNovedad = {
  brand: string;
  master_model: string;
  model: string;
  version: string;
  sold_from_year?: number;
  sold_until_year?: number;
};

function windowStart(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - WINDOW_MONTHS);
  return d;
}

/** Lee los overrides de tipo: mapa de código → "lanzamiento". */
async function readTipoOverrides(): Promise<Map<string, TipoNovedad>> {
  const redis = getRedis();
  if (!redis) return new Map();
  try {
    // Usamos un scan de keys con prefijo — más simple que mantener
    // un índice paralelo. Como son pocos overrides (decenas max), es
    // barato.
    const keys = await redis.keys(`${TIPO_KEY_PREFIX}*`);
    if (keys.length === 0) return new Map();
    const values = await redis.mget<(TipoNovedad | null)[]>(...keys);
    const map = new Map<string, TipoNovedad>();
    keys.forEach((k, i) => {
      const code = k.slice(TIPO_KEY_PREFIX.length);
      const v = values[i];
      if (v === "lanzamiento" || v === "aplicacion") map.set(code, v);
    });
    return map;
  } catch (e) {
    console.error("[novedades] error leyendo overrides:", e);
    return new Map();
  }
}

/** Lee el set de códigos ocultos. */
async function readHidden(): Promise<Set<string>> {
  const redis = getRedis();
  if (!redis) return new Set();
  try {
    const raw = (await redis.smembers(HIDDEN_KEY)) as string[] | null;
    return new Set(raw ?? []);
  } catch (e) {
    console.error("[novedades] error leyendo hidden:", e);
    return new Set();
  }
}

/** Override manual del tipo de una novedad. */
export async function setTipo(code: string, tipo: TipoNovedad): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  await redis.set(TIPO_KEY_PREFIX + code, tipo);
}

/** Borra el override de tipo (vuelve al default "aplicacion"). */
export async function clearTipoOverride(code: string): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  await redis.del(TIPO_KEY_PREFIX + code);
}

/** Oculta una novedad del feed público. */
export async function hideNovedad(code: string): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  await redis.sadd(HIDDEN_KEY, code);
}

/** Restaura una novedad al feed público. */
export async function unhideNovedad(code: string): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  await redis.srem(HIDDEN_KEY, code);
}

function firstPictureUrl(p: CatalogProduct): string | null {
  const ordered = p.pictures.slice().sort((a, b) => a.sort_order - b.sort_order);
  const nonBlueprint = ordered.find((x) => !x.is_blueprint);
  return nonBlueprint?.image_url ?? ordered[0]?.image_url ?? null;
}

function enrichProduct(
  product: CatalogProduct,
  tipo: TipoNovedad,
  hidden: boolean,
  getSlug: (code: string) => string | null
): Novedad {
  return {
    code: product.code,
    tipo,
    titulo: product.product || product.description || product.code,
    descripcion: product.description || "",
    fecha: new Date(product.updated_at),
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
    hidden,
  };
}

/**
 * Lista las novedades visibles en /novedades: productos de SpecParts
 * con `updated_at` en los últimos 12 meses, excluyendo los que el
 * admin haya ocultado. Ordenado por fecha descendente.
 */
export async function listNovedades(): Promise<Novedad[]> {
  const all = await listNovedadesIncludingHidden();
  return all.filter((n) => !n.hidden);
}

/** Igual que listNovedades pero incluye las ocultas — para el admin. */
export async function listNovedadesIncludingHidden(): Promise<Novedad[]> {
  let products: CatalogProduct[];
  try {
    products = await listCatalog();
  } catch {
    return [];
  }

  const cutoff = windowStart().getTime();
  const candidates = products.filter((p) => {
    if (!p.enabled || p.discontinued) return false;
    if (!p.updated_at) return false;
    return new Date(p.updated_at).getTime() >= cutoff;
  });

  const [tipoOverrides, hiddenSet, { getFeaturedSlug }] = await Promise.all([
    readTipoOverrides(),
    readHidden(),
    import("@/data/featured-products"),
  ]);

  const enriched = candidates.map((p) =>
    enrichProduct(
      p,
      tipoOverrides.get(p.code) ?? "aplicacion",
      hiddenSet.has(p.code),
      getFeaturedSlug
    )
  );

  return enriched.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

/** Por código individual (para página de detalle pública). */
export async function getNovedad(code: string): Promise<Novedad | null> {
  const product = await getProductByCode(code);
  if (!product) return null;

  // Verificar que esté en la ventana de 12 meses y enabled.
  if (!product.enabled || product.discontinued) return null;
  const updated = new Date(product.updated_at).getTime();
  if (updated < windowStart().getTime()) return null;

  const [tipoOverrides, hiddenSet, { getFeaturedSlug }] = await Promise.all([
    readTipoOverrides(),
    readHidden(),
    import("@/data/featured-products"),
  ]);

  // Si está oculta, no la mostramos en la página pública.
  if (hiddenSet.has(product.code)) return null;

  return enrichProduct(
    product,
    tipoOverrides.get(product.code) ?? "aplicacion",
    false,
    getFeaturedSlug
  );
}
