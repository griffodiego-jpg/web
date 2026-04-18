import {
  getProductByCode,
  listCatalog,
} from "@/lib/api/specparts";
import { getDisplayApplication } from "@/lib/catalog/display";
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
/** Set de códigos que tienen override de tipo, para evitar `keys *` scan. */
const TIPO_INDEX_KEY = "novedades:tipo-index";
const HIDDEN_KEY = "novedades:hidden"; // set de códigos ocultos
/** Set de claves de vehículos marcados como "nuevos" por el admin. */
const NUEVOS_KEY_PREFIX = "novedades:nuevos:"; // código → set de "BRAND:MODEL"

/** Ventana de tiempo para considerar una novedad. */
const WINDOW_MONTHS = 12;

/**
 * Migración de datos — modelo viejo → modelo nuevo.
 *
 * El modelo anterior guardaba toda la novedad publicada (código + tipo +
 * overrides + fecha) en una lista Redis `novedades:publicadas`. El
 * modelo actual separa: `novedades:tipo:<code>` (solo el override de
 * tipo) + `novedades:hidden` (ocultas) + `novedades:nuevos:<code>`
 * (vehículos marcados como nuevos).
 *
 * Esta función lee la lista vieja, convierte cada entry al modelo
 * nuevo (básicamente: si tipo = "lanzamiento", escribe el override),
 * y elimina la key vieja. Es idempotente — si la key vieja no existe,
 * no hace nada.
 *
 * Caché en memoria del proceso para no repetir el LRANGE en cada render.
 */
const OLD_PUBLICADAS_KEY = "novedades:publicadas";
let migrationDone = false;

async function migrateLegacyIfNeeded(): Promise<void> {
  if (migrationDone) return;
  const redis = getRedis();
  if (!redis) return;
  try {
    // Paso 1: migrar la lista vieja si todavía existe.
    const raw = await redis.lrange(OLD_PUBLICADAS_KEY, 0, -1);
    if (!raw || raw.length === 0) {
      // No hay data vieja, pero igual reconciliamos el índice de tipo
      // por si hay tipo-keys que no están en el índice (pueden venir
      // de un deploy anterior al índice). Es un one-shot keys() — el
      // costo se paga 1 vez por ciclo del proceso.
      await reconcileTipoIndex(redis);
      migrationDone = true;
      return;
    }
    // Migración: escribimos tanto la key individual como el índice
    // (consistencia con el modelo nuevo). Pipeline para atomicidad.
    const pipe = redis.multi();
    let migrated = 0;
    for (const entry of raw) {
      try {
        const obj =
          typeof entry === "string"
            ? (JSON.parse(entry) as { code?: string; tipo?: TipoNovedad })
            : (entry as { code?: string; tipo?: TipoNovedad });
        if (obj?.code && obj?.tipo) {
          pipe.set(TIPO_KEY_PREFIX + obj.code, obj.tipo);
          pipe.sadd(TIPO_INDEX_KEY, obj.code);
          migrated++;
        }
      } catch {
        // entry mal formateado — skip
      }
    }
    pipe.del(OLD_PUBLICADAS_KEY);
    await pipe.exec();
    console.log(
      `[novedades] migración completa: ${migrated} overrides migrados del modelo viejo`
    );
    migrationDone = true;
  } catch (e) {
    console.error("[novedades] error en migración:", e);
    // No seteamos migrationDone para reintentar en la próxima request.
  }
}

/**
 * Reconcilia el set `novedades:tipo-index` con las keys reales en Redis.
 * Se usa una única vez por ciclo de proceso — si detectamos tipo-keys
 * sin su entrada en el index (venidas de antes de que existiera), las
 * sumamos. Si el index ya está poblado, es un no-op cheap.
 */
async function reconcileTipoIndex(redis: ReturnType<typeof getRedis>): Promise<void> {
  if (!redis) return;
  try {
    const existing = (await redis.smembers(TIPO_INDEX_KEY)) as
      | string[]
      | null;
    const existingSet = new Set(existing ?? []);
    // Si el index tiene entries, asumimos que está OK.
    if (existingSet.size > 0) return;
    const keys = await redis.keys(`${TIPO_KEY_PREFIX}*`);
    if (!keys || keys.length === 0) return;
    const codes = keys.map((k) => k.slice(TIPO_KEY_PREFIX.length));
    if (codes.length > 0) {
      await redis.sadd(TIPO_INDEX_KEY, codes[0], ...codes.slice(1));
      console.log(
        `[novedades] reconciliación de índice: ${codes.length} tipos sumados`
      );
    }
  } catch (e) {
    console.error("[novedades] error reconciliando índice:", e);
  }
}

/**
 * Normaliza un vehículo a una clave única por marca+modelo (ignora
 * versión y años). Se usa tanto para marcar como nuevo desde el admin
 * como para renderizar el badge en el público.
 */
export function vehicleKey(v: {
  brand: string;
  master_model: string;
  model: string;
}): string {
  const brand = (v.brand || "").toUpperCase().trim();
  const modelo = (v.master_model || v.model || "").toUpperCase().trim();
  return `${brand}:${modelo}`;
}

export type TipoNovedad = "lanzamiento" | "aplicacion";

/** Novedad enriquecida con datos reales de SpecParts — lo que renderiza la página. */
export type Novedad = {
  code: string;
  tipo: TipoNovedad;
  /**
   * Si el admin publicó explícitamente esta novedad (marcándola como
   * Lanzamiento o Nueva aplicación). Solo las publicadas aparecen en
   * /novedades. El admin ve todas las candidatas (con published=false).
   */
  published: boolean;
  titulo: string;
  descripcion: string;
  fecha: Date; // fecha de actualización en SpecParts (es lo único que expone la API)
  linea: string | null; // product.category
  imagen: string | null;
  vehiculos: VehiculoNovedad[];
  /** Ubicaciones aplicando reglas por línea (ej. LADO RUEDA, DELANTERO). */
  ubicaciones: string[];
  /** Lados aplicando reglas por línea. */
  lados: string[];
  /** Claves (BRAND:MODELO) de vehículos marcados como "nuevos" por el admin. */
  nuevosVehiculos: string[];
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

/**
 * Lee los overrides de tipo: mapa de código → "lanzamiento" / "aplicacion".
 *
 * Antes usaba `redis.keys('novedades:tipo:*')` que hace un SCAN completo —
 * O(N) sobre el keyspace total. Ahora mantenemos un set paralelo
 * `novedades:tipo-index` con los códigos publicados. Una sola lectura
 * al set + mget por los valores = 2 roundtrips, sin escaneo.
 */
async function readTipoOverrides(): Promise<Map<string, TipoNovedad>> {
  const redis = getRedis();
  if (!redis) return new Map();
  try {
    const codes = (await redis.smembers(TIPO_INDEX_KEY)) as string[] | null;
    if (!codes || codes.length === 0) return new Map();
    const keys = codes.map((c) => TIPO_KEY_PREFIX + c);
    const values = await redis.mget<(TipoNovedad | null)[]>(...keys);
    const map = new Map<string, TipoNovedad>();
    codes.forEach((code, i) => {
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

/** Override manual del tipo de una novedad. Mantiene el index al día. */
export async function setTipo(code: string, tipo: TipoNovedad): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  // Atomicidad via pipeline: si algo falla en la transacción, ninguna
  // escritura queda aplicada (Redis `multi` garantiza all-or-nothing).
  const pipe = redis.multi();
  pipe.set(TIPO_KEY_PREFIX + code, tipo);
  pipe.sadd(TIPO_INDEX_KEY, code);
  await pipe.exec();
}

/** Borra el override de tipo (vuelve al default "aplicacion"). */
export async function clearTipoOverride(code: string): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  const pipe = redis.multi();
  pipe.del(TIPO_KEY_PREFIX + code);
  pipe.srem(TIPO_INDEX_KEY, code);
  await pipe.exec();
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

/** Lee las claves de vehículos marcados como "nuevos" para un código. */
async function readNuevosVehiculos(code: string): Promise<string[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const raw = (await redis.smembers(NUEVOS_KEY_PREFIX + code)) as
      | string[]
      | null;
    return raw ?? [];
  } catch (e) {
    console.error("[novedades] error leyendo nuevos:", e);
    return [];
  }
}

/**
 * Batch: lee los sets de múltiples códigos en un solo pipeline.
 * Devuelve un Map code → string[] solo con los que tienen valores.
 */
async function readNuevosVehiculosBatch(
  codes: string[]
): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();
  if (codes.length === 0) return result;
  const redis = getRedis();
  if (!redis) return result;
  try {
    const pipe = redis.multi();
    for (const code of codes) {
      pipe.smembers(NUEVOS_KEY_PREFIX + code);
    }
    const out = (await pipe.exec()) as (string[] | null)[];
    codes.forEach((code, i) => {
      const list = out[i];
      if (Array.isArray(list) && list.length > 0) {
        result.set(code, list);
      }
    });
    return result;
  } catch (e) {
    console.error("[novedades] error en batch nuevos:", e);
    return result;
  }
}

/**
 * Reemplaza atómicamente el set de vehículos "nuevos" para un código.
 * Antes eran dos calls separados (del + sadd) — si dos requests concurrentes
 * llegaban entre medio, una perdía sus cambios. Ahora usa pipeline.
 */
export async function setNuevosVehiculos(
  code: string,
  keys: string[]
): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  const setKey = NUEVOS_KEY_PREFIX + code;
  const pipe = redis.multi();
  pipe.del(setKey);
  if (keys.length > 0) {
    pipe.sadd(setKey, keys[0], ...keys.slice(1));
  }
  await pipe.exec();
}

function firstPictureUrl(p: CatalogProduct): string | null {
  const ordered = p.pictures.slice().sort((a, b) => a.sort_order - b.sort_order);
  const nonBlueprint = ordered.find((x) => !x.is_blueprint);
  return nonBlueprint?.image_url ?? ordered[0]?.image_url ?? null;
}

function enrichProduct(
  product: CatalogProduct,
  tipo: TipoNovedad,
  published: boolean,
  hidden: boolean,
  nuevosVehiculos: string[],
  getSlug: (code: string) => string | null
): Novedad {
  const display = getDisplayApplication(product);
  return {
    code: product.code,
    tipo,
    published,
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
    ubicaciones: display.ubicaciones,
    lados: display.lados,
    nuevosVehiculos,
    destacadoSlug: getSlug(product.code),
    catalogoSlug: product.slug,
    hidden,
  };
}

/**
 * Lista las novedades visibles en /novedades: SOLO las que el admin
 * publicó explícitamente (marcó como Lanzamiento o Nueva aplicación)
 * y que no estén ocultas. Ordenado por fecha descendente.
 */
export async function listNovedades(): Promise<Novedad[]> {
  const all = await listNovedadesIncludingHidden();
  return all.filter((n) => n.published && !n.hidden);
}

/** Igual que listNovedades pero incluye las ocultas — para el admin. */
export async function listNovedadesIncludingHidden(): Promise<Novedad[]> {
  // Migramos datos del modelo viejo si todavía hay (idempotente).
  await migrateLegacyIfNeeded();

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

  // Batch de los sets de "nuevos vehículos" en un solo pipeline de
  // Redis. Antes hacíamos N roundtrips (uno por candidato) = ~300 ms
  // en el dashboard con 50 candidatos. Con pipeline: 1 roundtrip.
  const nuevosPorCodigo = await readNuevosVehiculosBatch(
    candidates.map((p) => p.code)
  );

  const enriched = candidates.map((p) => {
    const override = tipoOverrides.get(p.code);
    return enrichProduct(
      p,
      override ?? "aplicacion",
      override !== undefined, // published = tiene override
      hiddenSet.has(p.code),
      nuevosPorCodigo.get(p.code) ?? [],
      getFeaturedSlug
    );
  });

  return enriched.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

/** Por código individual (para página de detalle pública). */
export async function getNovedad(code: string): Promise<Novedad | null> {
  await migrateLegacyIfNeeded();
  const product = await getProductByCode(code);
  if (!product) return null;

  // Verificar que esté en la ventana de 12 meses y enabled.
  if (!product.enabled || product.discontinued) return null;
  const updated = new Date(product.updated_at).getTime();
  if (updated < windowStart().getTime()) return null;

  const [tipoOverrides, hiddenSet, nuevos, { getFeaturedSlug }] =
    await Promise.all([
      readTipoOverrides(),
      readHidden(),
      readNuevosVehiculos(product.code),
      import("@/data/featured-products"),
    ]);

  // Si está oculta o no está publicada, no la mostramos en la página pública.
  if (hiddenSet.has(product.code)) return null;
  const override = tipoOverrides.get(product.code);
  if (override === undefined) return null; // no publicada → 404

  return enrichProduct(
    product,
    override,
    true,
    false,
    nuevos,
    getFeaturedSlug
  );
}
