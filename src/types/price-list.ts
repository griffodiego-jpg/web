/**
 * Listas de precios subidas por el admin para el portal B2B.
 *
 * Modelo: una lista por `code` (ej. "LISTA3", "MAYORISTA"). El código
 * matchea con el campo `priceListCode` del `BejermanClient`. Cuando un
 * cliente entra a `/cuenta/listas`, ve la lista cuyo `code` coincide
 * con el suyo. Reemplazar una lista (subir otro archivo con el mismo
 * code) actualiza la versión visible.
 */

export interface PriceList {
  /** Slug interno (ej. "lista3-2026-05"). Sirve de clave Redis. */
  id: string;
  /** Código del ERP al que está asociada (ej. "LISTA3", "MAYORISTA"). */
  code: string;
  /** Nombre humano para mostrar en la UI. */
  name: string;
  /** URL pública del archivo (Vercel Blob). */
  fileUrl: string;
  filename: string;
  /** Tamaño en bytes — para mostrar en la tabla del admin. */
  sizeBytes: number;
  /** ISO date-time de la última subida. */
  uploadedAt: string;
  /** Nota opcional sobre la lista (ej. "Descuentos especiales abril"). */
  note?: string;
}
