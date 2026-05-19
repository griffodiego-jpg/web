"use server";

import { getMercadoLibreUrl } from "@/lib/catalog/utils";
import { getLinkForCodigo } from "@/lib/mercadolibre-links-store";
import { getProductByCode } from "@/lib/api/specparts";

/** Devuelve el link de ML para un código, siempre fresco (sin ISR). */
export async function fetchMlLink(code: string): Promise<string | null> {
  const fromRedis = await getLinkForCodigo(code).catch(() => null);
  if (fromRedis) return fromRedis;
  const product = await getProductByCode(code).catch(() => null);
  return product ? getMercadoLibreUrl(product) : null;
}
