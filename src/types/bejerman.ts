/**
 * Tipos de la API del ERP Griffo (middleware sobre Bejerman).
 * Fuente: reference/bejerman/README.md.
 */

export interface BejermanWarehouse {
  warehouse_id: string;
  description: string;
}

export interface BejermanClient {
  client_id: string;
  email: string;
  name: string;
  warehouses: BejermanWarehouse[];
}

export interface BejermanPriceRequest {
  clientId: string;
  warehouseId: string;
  items: Array<{ productCode: string; quantityRequested: number }>;
}

export interface BejermanPriceItem {
  productCode: string;
  price: number;
  discountedPrice: number;
  discountApplied: number;
  stock: number;
}

export interface BejermanOrderRequest {
  clientId: string;
  products: Array<{ productId: string; quantity: number; unitPrice: number }>;
  /** ID generado por la web para trackear el pedido cruzando ambos lados. */
  platformOrderId: string;
  orderStatus: string;
}

export interface BejermanOrderResponse {
  erpOrderId: string;
  success: boolean;
  message: string;
}

export interface BejermanOrderStatus {
  ErpOrderId: string;
  Status: string;
}

/**
 * Item de la cuenta corriente: una línea por comprobante (FC, ND, NC, etc.).
 * Se filtra por `comp === "FC"` para listar facturas.
 */
export interface BejermanAccountStatusItem {
  cliCod: string;
  razonSocial: string;
  /** ISO date-time — fecha de emisión. */
  emision: string;
  /** Tipo de comprobante: FC (factura), ND (nota de débito), NC (nota de crédito), etc. */
  comp: string;
  /** Letra: A, B, C, ... */
  compLetra: string;
  /** Punto de venta con padding, ej. "0001". */
  puntoVenta: string;
  /** Número del comprobante, ej. "00017176". */
  compNro: string;
  /** ISO date-time — fecha de vencimiento. */
  vencimiento: string;
  debe: number;
  haber: number;
}

export interface BejermanComprobanteQuery {
  Comp: string;
  CompLetra?: string;
  PuntoVenta: string;
  CompNro: string;
  CodCliente: string;
}
