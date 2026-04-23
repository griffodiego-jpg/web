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
 * El middleware del ERP Griffo usa una convención no estándar: muchos
 * tipos de comprobante (RC, NC, CG, CIB, etc.) traen el monto en
 * `haber` con SIGNO NEGATIVO para representar la rebaja de deuda.
 *
 * Reglas (uniformes para todas las categorías — no depende del comp):
 *  - `haber < 0` → `haber = |haber|` (todo negativo en haber es abono).
 *  - `debe < 0`  → mover su valor absoluto a `haber` (un débito
 *    negativo es un crédito).
 *  - Para pagos/NCs explícitos, si por error el monto vino en `debe`
 *    positivo y `haber == 0`, lo movemos a haber.
 *
 * Devuelve valores normalizados — no modifica el objeto original.
 */
export function normalizeAmounts(item: BejermanAccountStatusItem): {
  debe: number;
  haber: number;
} {
  let debe = item.debe ?? 0;
  let haber = item.haber ?? 0;

  // Cualquier valor negativo en cualquier columna → es un crédito.
  if (haber < 0) haber = -haber;
  if (debe < 0) {
    haber += -debe;
    debe = 0;
  }

  // Pagos/NCs que vinieron con monto en debe en vez de haber.
  const cat = classifyComp(item.comp);
  if ((cat === "pago" || cat === "nota_credito") && debe > 0 && haber === 0) {
    haber = debe;
    debe = 0;
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
