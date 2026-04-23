import type { BejermanAccountStatusItem } from "@/types/bejerman";

/**
 * Clasificación de tipos de comprobantes de cuenta corriente por
 * categoría funcional. Cada ERP maneja códigos distintos — la API
 * del técnico usa al menos FC, ND, NC, RE, pero puede haber otros.
 * Este helper mapea lo que conocemos; lo no matcheado cae en "otro".
 */

export type MovementCategory =
  | "factura"
  | "nota_debito"
  | "nota_credito"
  | "pago"
  | "otro";

const PATTERNS: Record<MovementCategory, RegExp[]> = {
  factura: [/^FC/i, /^FA/i, /^FACT/i, /^INV/i],
  nota_debito: [/^ND/i, /^DB/i],
  nota_credito: [/^NC/i, /^CR/i, /^CRED/i],
  pago: [/^RE/i, /^RB/i, /^RC/i, /^COB/i, /^PA(?!C)/i, /^CBR/i, /^CX/i, /^REC/i],
  otro: [],
};

export function classifyComp(comp: string): MovementCategory {
  const s = (comp ?? "").trim();
  if (!s) return "otro";
  for (const [cat, patterns] of Object.entries(PATTERNS) as Array<
    [MovementCategory, RegExp[]]
  >) {
    if (patterns.some((p) => p.test(s))) return cat;
  }
  return "otro";
}

/**
 * Heurística extra: si el comp no matchea patrones pero el item tiene
 * haber > 0 y debe == 0, lo tratamos como pago. Cubre casos donde el
 * técnico usa un código raro que no reconocemos.
 */
export function isLikelyPago(item: BejermanAccountStatusItem): boolean {
  const cat = classifyComp(item.comp);
  if (cat === "pago") return true;
  if (cat === "otro" && item.haber > 0 && item.debe === 0) return true;
  return false;
}

export function categorizeAccountItems(
  items: BejermanAccountStatusItem[],
): Record<MovementCategory, BejermanAccountStatusItem[]> {
  const out: Record<MovementCategory, BejermanAccountStatusItem[]> = {
    factura: [],
    nota_debito: [],
    nota_credito: [],
    pago: [],
    otro: [],
  };
  for (const it of items) {
    if (isLikelyPago(it)) {
      out.pago.push(it);
      continue;
    }
    out[classifyComp(it.comp)].push(it);
  }
  return out;
}

/** Cuenta códigos únicos — útil para diagnóstico. */
export function countCompCodes(
  items: BejermanAccountStatusItem[],
): Array<{ comp: string; count: number; debe: number; haber: number }> {
  const map = new Map<
    string,
    { comp: string; count: number; debe: number; haber: number }
  >();
  for (const it of items) {
    const c = (it.comp ?? "").trim() || "(vacío)";
    const row = map.get(c) ?? { comp: c, count: 0, debe: 0, haber: 0 };
    row.count += 1;
    row.debe += it.debe;
    row.haber += it.haber;
    map.set(c, row);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

/**
 * Normaliza `debe`/`haber` de un item a la convención contable estándar
 * (debe: cargas positivas, haber: abonos positivos).
 *
 * El middleware del ERP Griffo usa varias convenciones mezcladas:
 *  - Facturas (FC/ND): `debe: positivo, haber: 0` ✓ correcto.
 *  - Recibos (RC): `debe: 0, haber: negativo` ← el signo negativo
 *    representa la rebaja de deuda. Hay que flipear.
 *  - Notas de crédito (NC): varían (vimos casos con `haber < 0`).
 *
 * Reglas por categoría:
 *
 * Pagos y NCs (deben reducir deuda):
 *  - `haber < 0` → `haber = |haber|` (es la convención del ERP).
 *  - `debe < 0` → mover su valor absoluto a `haber`.
 *  - `debe > 0, haber = 0` → mover el importe a `haber`.
 *
 * Resto (facturas, ND, otros — deben aumentar deuda):
 *  - `debe < 0` → mover a `haber` (es crédito, no débito).
 *  - `haber < 0` → mover a `debe`.
 *
 * Devuelve valores normalizados — no modifica el objeto original.
 */
export function normalizeAmounts(item: BejermanAccountStatusItem): {
  debe: number;
  haber: number;
} {
  let debe = item.debe ?? 0;
  let haber = item.haber ?? 0;
  const cat = classifyComp(item.comp);

  if (cat === "pago" || cat === "nota_credito") {
    // El ERP usa signo negativo en haber para representar la rebaja.
    if (haber < 0) haber = -haber;
    // Débito negativo: es un crédito disfrazado.
    if (debe < 0) {
      haber += -debe;
      debe = 0;
    }
    // El importe quedó en la columna incorrecta (debe en vez de haber).
    if (debe > 0 && haber === 0) {
      haber = debe;
      debe = 0;
    }
  } else {
    // Facturas/ND: signo flipped es un crédito oculto.
    if (debe < 0) {
      haber += -debe;
      debe = 0;
    }
    if (haber < 0) {
      debe += -haber;
      haber = 0;
    }
  }

  return { debe, haber };
}

/**
 * Computa saldo total aplicando la normalización item-a-item. Resultado
 * siempre consistente con la convención: saldo = Σdebe − Σhaber.
 */
export function computeNormalizedSaldo(
  items: BejermanAccountStatusItem[],
): { debe: number; haber: number; saldo: number } {
  let debe = 0;
  let haber = 0;
  for (const it of items) {
    const n = normalizeAmounts(it);
    debe += n.debe;
    haber += n.haber;
  }
  return { debe, haber, saldo: debe - haber };
}
