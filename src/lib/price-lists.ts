import { getRedis } from "@/lib/kv";
import type { PriceList } from "@/types/price-list";

/**
 * Storage de listas de precios B2B en Redis.
 *
 *   pricelist:<code>          → JSON con el PriceList actual.
 *   pricelists:codes          → Set con todos los códigos cargados.
 *   pricelist:seen:<clientId> → ISO string de la última vez que el
 *                                cliente abrió /cuenta/listas.
 *
 * El `code` se usa tal cual viene del ERP (ej. "LISTA3"). Si el cliente
 * tiene `priceListCode` = "LISTA3", ve la lista guardada en
 * `pricelist:LISTA3`. Si no hay asignada, ve "DEFAULT" (si existe).
 */

const KEY_PREFIX = "pricelist:";
const KEY_CODES_SET = "pricelists:codes";
const KEY_SEEN_PREFIX = "pricelist:seen:";

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function keyOf(code: string): string {
  return KEY_PREFIX + normalizeCode(code);
}

export async function savePriceList(list: PriceList): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  const code = normalizeCode(list.code);
  const payload: PriceList = { ...list, code };
  await Promise.all([
    redis.set(keyOf(code), JSON.stringify(payload)),
    redis.sadd(KEY_CODES_SET, code),
  ]);
}

export async function getPriceList(code: string): Promise<PriceList | null> {
  const redis = getRedis();
  if (!redis) return null;
  const raw = await redis.get<string | PriceList | null>(keyOf(code));
  if (!raw) return null;
  return typeof raw === "string" ? (JSON.parse(raw) as PriceList) : raw;
}

export async function listAllPriceLists(): Promise<PriceList[]> {
  const redis = getRedis();
  if (!redis) return [];
  const codes = await redis.smembers(KEY_CODES_SET);
  if (!codes || codes.length === 0) return [];
  const raws = await Promise.all(
    codes.map((c) => redis.get<string | PriceList | null>(keyOf(c))),
  );
  return raws
    .map((r) =>
      r == null ? null : typeof r === "string" ? (JSON.parse(r) as PriceList) : r,
    )
    .filter((x): x is PriceList => x !== null)
    .sort((a, b) => a.code.localeCompare(b.code));
}

export async function deletePriceList(code: string): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  const c = normalizeCode(code);
  await Promise.all([redis.del(keyOf(c)), redis.srem(KEY_CODES_SET, c)]);
}

/**
 * Devuelve la lista asignada al cliente. Si el cliente no tiene
 * `priceListCode` o no hay lista cargada con ese code, intenta el
 * fallback a "DEFAULT" (si existe). Si tampoco, devuelve null.
 */
export async function getPriceListForClient(
  priceListCode?: string | null,
): Promise<PriceList | null> {
  if (priceListCode && priceListCode.trim()) {
    const own = await getPriceList(priceListCode);
    if (own) return own;
  }
  return getPriceList("DEFAULT");
}

/* -------------------------------------------------------------------- */
/* "Nueva lista" tracking por cliente                                   */
/* -------------------------------------------------------------------- */

export async function markPriceListSeen(clientId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(KEY_SEEN_PREFIX + clientId, new Date().toISOString());
}

export async function getLastSeenAt(clientId: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  return await redis.get<string>(KEY_SEEN_PREFIX + clientId);
}

/**
 * Decide si hay una lista nueva no vista por el cliente. True si la
 * lista más reciente asignada tiene `uploadedAt > lastSeenAt`.
 */
export async function hasUnseenPriceList(
  clientId: string,
  priceListCode?: string | null,
): Promise<{ hasNew: boolean; list: PriceList | null }> {
  const list = await getPriceListForClient(priceListCode);
  if (!list) return { hasNew: false, list: null };
  const lastSeen = await getLastSeenAt(clientId);
  if (!lastSeen) return { hasNew: true, list };
  return {
    hasNew: new Date(list.uploadedAt) > new Date(lastSeen),
    list,
  };
}
