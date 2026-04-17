/**
 * Generador determinístico de precios de compra para demo del catálogo B2B.
 * Cuando Bejerman esté activo, se reemplaza por POST /ERP/prices con los
 * códigos visibles en pantalla.
 *
 * Reglas:
 * - Mismo código → mismo precio siempre (idempotente, no cambia entre
 *   renders ni recargas).
 * - Rango visualmente creíble: entre $8.000 y $180.000 ARS.
 * - Redondeo a múltiplos de $100 para que no aparezcan "$87.342,17".
 */

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h);
}

/** Precio de compra neto (sin IVA) para el producto `code`. */
export function getMockCompraPrice(code: string): number {
  const h = hashCode(code);
  const raw = 8000 + (h % 172000);
  return Math.round(raw / 100) * 100;
}

/** Formatea un número como "$12.345,00" sin sufijo. */
export function formatARS(value: number): string {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Formatea con sufijo "+ IVA" (neto). */
export function formatARSNeto(value: number): string {
  return `${formatARS(value)} + IVA`;
}
