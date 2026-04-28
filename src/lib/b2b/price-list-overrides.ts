import "server-only";

import { getRedis } from "@/lib/kv";

/**
 * Mapeo cliente → código de lista de precios. Override manual desde
 * el admin, porque el ERP actual no expone `priceListCode` por
 * cliente. Cuando el técnico habilite el campo en `/ERP/Clients`,
 * lo usamos como source of truth y este override queda como manual
 * (prevalece el override si existe).
 *
 * Layout en Redis:
 *
 *   b2b:client-pricelist  → Hash { <client_code>: <PRICE_LIST_CODE> }
 *
 * Códigos de lista normalizados a UPPERCASE para matchear con la
 * convención del store de listas (`pricelist:<CODE>`).
 */

const KEY = "b2b:client-pricelist";

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export async function getPriceListOverrides(): Promise<Record<string, string>> {
  const redis = getRedis();
  if (!redis) return {};
  const raw = await redis.hgetall<Record<string, string>>(KEY);
  return raw ?? {};
}

export async function getPriceListOverride(
  clientCode: string,
): Promise<string | null> {
  const all = await getPriceListOverrides();
  return all[clientCode] ?? null;
}

export async function setPriceListOverride(
  clientCode: string,
  priceListCode: string,
): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  const code = normalizeCode(priceListCode);
  if (!code) {
    await redis.hdel(KEY, clientCode);
    return;
  }
  await redis.hset(KEY, { [clientCode]: code });
}

export async function clearPriceListOverride(clientCode: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.hdel(KEY, clientCode);
}
