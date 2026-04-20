/**
 * Datos mock para el portal B2B (/cuenta/*) mientras la integración con
 * el ERP (Bejerman) no está activa end-to-end. Reemplazar por llamadas a
 * src/lib/api/bejerman.ts cuando haya credenciales válidas y Firebase
 * Auth activo.
 *
 * El shape imita lo que devuelve la API real para que el swap sea
 * directo (mismos nombres de campos, mismos tipos).
 */

import type {
  BejermanAccountStatusItem,
  BejermanClient,
} from "@/types/bejerman";

export type MockOrder = {
  erpOrderId: string;
  platformOrderId: string;
  createdAt: string;
  status: string;
  itemCount: number;
  total: number;
};

export type MockPriceListDownload = {
  label: string;
  format: "PDF" | "XLSX";
  /** Fecha de generación más reciente — ISO. */
  generatedAt: string;
};

export const mockCurrentClient: BejermanClient = {
  client_id: "000042",
  email: "juan@distribuidora-martinez.com.ar",
  name: "Distribuidora Martínez S.R.L.",
  warehouses: [
    { warehouse_id: "001", description: "Depósito Central" },
    { warehouse_id: "002", description: "Sucursal Córdoba" },
  ],
};

export const mockAccountStatus: BejermanAccountStatusItem[] = [
  {
    cliCod: "000042",
    razonSocial: "Distribuidora Martínez S.R.L.",
    emision: "2026-04-10T00:00:00.000Z",
    comp: "FC",
    compLetra: "A",
    puntoVenta: "0001",
    compNro: "00018432",
    vencimiento: "2026-05-10T00:00:00.000Z",
    debe: 284_350.75,
    haber: 0,
  },
  {
    cliCod: "000042",
    razonSocial: "Distribuidora Martínez S.R.L.",
    emision: "2026-04-03T00:00:00.000Z",
    comp: "FC",
    compLetra: "A",
    puntoVenta: "0001",
    compNro: "00018421",
    vencimiento: "2026-05-03T00:00:00.000Z",
    debe: 156_800.0,
    haber: 0,
  },
  {
    cliCod: "000042",
    razonSocial: "Distribuidora Martínez S.R.L.",
    emision: "2026-03-28T00:00:00.000Z",
    comp: "RE",
    compLetra: "X",
    puntoVenta: "0001",
    compNro: "00004532",
    vencimiento: "2026-03-28T00:00:00.000Z",
    debe: 0,
    haber: 200_000.0,
    // Este recibo es interno y no tiene PDF — sirve para probar el
    // caso de "row sin botón de descarga".
    hasPdf: false,
  },
  {
    cliCod: "000042",
    razonSocial: "Distribuidora Martínez S.R.L.",
    emision: "2026-03-20T00:00:00.000Z",
    comp: "FC",
    compLetra: "A",
    puntoVenta: "0001",
    compNro: "00018398",
    vencimiento: "2026-04-19T00:00:00.000Z",
    debe: 98_450.3,
    haber: 0,
  },
  {
    cliCod: "000042",
    razonSocial: "Distribuidora Martínez S.R.L.",
    emision: "2026-03-15T00:00:00.000Z",
    comp: "NC",
    compLetra: "A",
    puntoVenta: "0001",
    compNro: "00000892",
    vencimiento: "2026-03-15T00:00:00.000Z",
    debe: 0,
    haber: 35_200.0,
  },
  {
    cliCod: "000042",
    razonSocial: "Distribuidora Martínez S.R.L.",
    emision: "2026-02-12T00:00:00.000Z",
    comp: "FC",
    compLetra: "A",
    puntoVenta: "0001",
    compNro: "00018234",
    vencimiento: "2026-03-14T00:00:00.000Z",
    debe: 412_000.0,
    haber: 0,
  },
  {
    cliCod: "000042",
    razonSocial: "Distribuidora Martínez S.R.L.",
    emision: "2026-02-05T00:00:00.000Z",
    comp: "RE",
    compLetra: "X",
    puntoVenta: "0001",
    compNro: "00004488",
    vencimiento: "2026-02-05T00:00:00.000Z",
    debe: 0,
    haber: 412_000.0,
    hasPdf: false,
  },
];

export const mockOrders: MockOrder[] = [
  {
    erpOrderId: "PED-0023819",
    platformOrderId: "web-2026041401",
    createdAt: "2026-04-14T14:22:00.000Z",
    status: "En preparación",
    itemCount: 18,
    total: 284_350.75,
  },
  {
    erpOrderId: "PED-0023791",
    platformOrderId: "web-2026040802",
    createdAt: "2026-04-08T10:15:00.000Z",
    status: "Despachado",
    itemCount: 32,
    total: 512_800.0,
  },
  {
    erpOrderId: "PED-0023755",
    platformOrderId: "web-2026040301",
    createdAt: "2026-04-03T16:45:00.000Z",
    status: "Entregado",
    itemCount: 12,
    total: 156_800.0,
  },
  {
    erpOrderId: "PED-0023702",
    platformOrderId: "web-2026032801",
    createdAt: "2026-03-28T09:30:00.000Z",
    status: "Entregado",
    itemCount: 8,
    total: 98_450.3,
  },
  {
    erpOrderId: "—",
    platformOrderId: "web-2026041602",
    createdAt: "2026-04-16T11:05:00.000Z",
    status: "Pendiente de aprobación",
    itemCount: 5,
    total: 47_200.0,
  },
];

export const mockPriceLists: MockPriceListDownload[] = [
  { label: "Lista de precios", format: "PDF", generatedAt: "2026-04-15T08:00:00.000Z" },
  { label: "Lista de precios", format: "XLSX", generatedAt: "2026-04-15T08:00:00.000Z" },
];

/** Saldo = suma debe - suma haber. */
export function computeSaldo(items: BejermanAccountStatusItem[]): number {
  return items.reduce((acc, it) => acc + it.debe - it.haber, 0);
}

export function formatARS(value: number): string {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
