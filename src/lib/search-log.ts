import { getRedis } from "@/lib/kv";

/**
 * Log de búsquedas con CERO resultados en el catálogo.
 *
 * Solo guardamos las búsquedas vacías porque son las que importan
 * para decisiones de catálogo: "qué pidieron y no encontraron".
 * Las búsquedas exitosas las miramos en GA4 (eventos `search` y
 * `view_search_results` — gratis e infinitos).
 *
 * Modelo Redis:
 * - ZSET `search-log:zero` — score = count, member = normalizedQuery.
 *   Ordenado por frecuencia para sacar el top fácil con ZREVRANGE.
 * - HASH `search-log:zero:<normalizedQuery>` — metadata por query:
 *   { firstSeen, lastSeen, originalQuery, tabBreakdown (JSON), resolved }.
 * - SET `search-log:resolved` — queries marcadas como cubiertas (las
 *   ocultamos del ranking principal pero quedan archivadas).
 *
 * Cap: top 1000 queries (LRU manual cuando se llena).
 *
 * Privacidad: no guardamos IP, userAgent ni nada que identifique al
 * usuario. Solo el texto buscado y el conteo.
 */

const ZSET = "search-log:zero";
const META_PREFIX = "search-log:zero:";
const RESOLVED_SET = "search-log:resolved";
const MAX_ENTRIES = 1000;
const MAX_QUERY_LEN = 200;

export type SearchTab = "palabra" | "patente" | "vehiculo" | "codigo" | "medidas";

export type ZeroResultMeta = {
  /** Query normalizada (lowercase, trim, sin diacríticos) — clave del registro. */
  query: string;
  /** Texto original tal cual lo tipeó el usuario la última vez. */
  originalQuery: string;
  /** Cuántas veces se buscó. */
  count: number;
  /** Primera vez (epoch ms). */
  firstSeen: number;
  /** Última vez (epoch ms). */
  lastSeen: number;
  /** Distribución por tab del catálogo. */
  tabBreakdown: Partial<Record<SearchTab, number>>;
  /** Si fue marcada como resuelta por el admin. */
  resolved: boolean;
};

/** Normaliza el texto de búsqueda para deduplicar variantes. */
export function normalizeQuery(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, MAX_QUERY_LEN);
}

/**
 * Loguea una búsqueda sin resultados. Idempotente / acumulativa:
 * si la query ya existe, incrementa el contador y actualiza lastSeen.
 *
 * Tolerante a fallos: si Redis no está, no rompe nada.
 */
export async function logZeroResultSearch(params: {
  query: string;
  tab: SearchTab;
}): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const normalized = normalizeQuery(params.query);
  if (!normalized || normalized.length < 2) return;

  const original = params.query.trim().slice(0, MAX_QUERY_LEN);
  const now = Date.now();
  const metaKey = `${META_PREFIX}${normalized}`;

  try {
    const existing = await redis.hgetall<Record<string, string>>(metaKey);

    let tabBreakdown: Partial<Record<SearchTab, number>> = {};
    if (existing?.tabBreakdown) {
      try {
        tabBreakdown = JSON.parse(existing.tabBreakdown) as Partial<
          Record<SearchTab, number>
        >;
      } catch {
        tabBreakdown = {};
      }
    }
    tabBreakdown[params.tab] = (tabBreakdown[params.tab] ?? 0) + 1;

    const firstSeen = existing?.firstSeen
      ? Number(existing.firstSeen)
      : now;

    await redis.hset(metaKey, {
      originalQuery: original,
      firstSeen: String(firstSeen),
      lastSeen: String(now),
      tabBreakdown: JSON.stringify(tabBreakdown),
    });
    await redis.zincrby(ZSET, 1, normalized);

    // LRU manual: si el zset crece mucho, sacamos los menos frecuentes.
    const size = await redis.zcard(ZSET);
    if (size > MAX_ENTRIES) {
      const toRemove = await redis.zrange<string[]>(
        ZSET,
        0,
        size - MAX_ENTRIES - 1,
      );
      if (toRemove && toRemove.length > 0) {
        await redis.zrem(ZSET, ...toRemove);
        for (const q of toRemove) {
          await redis.del(`${META_PREFIX}${q}`);
        }
      }
    }
  } catch {
    // Swallow.
  }
}

/**
 * Lee el top N queries con cero resultados, ordenadas por frecuencia desc.
 * `includeResolved=false` (default) oculta las que el admin ya marcó como
 * cubiertas.
 */
export async function getZeroResultStats(
  limit = 100,
  includeResolved = false,
): Promise<ZeroResultMeta[]> {
  const redis = getRedis();
  if (!redis) return [];

  try {
    const top = await redis.zrange<string[]>(ZSET, 0, limit - 1, {
      rev: true,
      withScores: true,
    });
    if (!top || top.length === 0) return [];

    // Upstash devuelve [member, score, member, score, ...] en formato plano.
    const pairs: Array<{ query: string; count: number }> = [];
    for (let i = 0; i < top.length; i += 2) {
      pairs.push({
        query: String(top[i]),
        count: Number(top[i + 1]),
      });
    }

    const resolved = (await redis.smembers(RESOLVED_SET)) ?? [];
    const resolvedSet = new Set(resolved.map(String));

    const out: ZeroResultMeta[] = [];
    for (const { query, count } of pairs) {
      const isResolved = resolvedSet.has(query);
      if (isResolved && !includeResolved) continue;

      const meta = await redis.hgetall<Record<string, string>>(
        `${META_PREFIX}${query}`,
      );

      let tabBreakdown: Partial<Record<SearchTab, number>> = {};
      if (meta?.tabBreakdown) {
        try {
          tabBreakdown = JSON.parse(meta.tabBreakdown) as Partial<
            Record<SearchTab, number>
          >;
        } catch {
          tabBreakdown = {};
        }
      }

      out.push({
        query,
        originalQuery: meta?.originalQuery ?? query,
        count,
        firstSeen: Number(meta?.firstSeen ?? 0),
        lastSeen: Number(meta?.lastSeen ?? 0),
        tabBreakdown,
        resolved: isResolved,
      });
    }
    return out;
  } catch {
    return [];
  }
}

export async function markResolved(query: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const normalized = normalizeQuery(query);
  if (!normalized) return;
  try {
    await redis.sadd(RESOLVED_SET, normalized);
  } catch {
    // ignore
  }
}

export async function unmarkResolved(query: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const normalized = normalizeQuery(query);
  if (!normalized) return;
  try {
    await redis.srem(RESOLVED_SET, normalized);
  } catch {
    // ignore
  }
}

export async function deleteZeroResultEntry(query: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const normalized = normalizeQuery(query);
  if (!normalized) return;
  try {
    await redis.zrem(ZSET, normalized);
    await redis.del(`${META_PREFIX}${normalized}`);
    await redis.srem(RESOLVED_SET, normalized);
  } catch {
    // ignore
  }
}
