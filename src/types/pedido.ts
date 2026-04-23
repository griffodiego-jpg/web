/**
 * Pedidos B2B armados desde la web.
 *
 * Ciclo de vida:
 *
 *   procesando ──► en_preparacion ──► entregado
 *        └─► cancelado
 *
 * - `procesando`: el cliente confirmó el pedido desde el carrito. Espera
 *   que un operador de Griffo lo cargue manualmente en Bejerman.
 * - `en_preparacion`: el operador lo cargó al ERP y pegó el número de
 *   nota de pedido generado por Bejerman. Desde ese momento, el sistema
 *   puede consultar `GET /ERP/orders/{erpOrderNumber}` para traer la
 *   fecha estimada de despacho.
 * - `entregado`: el sistema detectó la factura asociada vía
 *   `GET /ERP/ClientAccountStatus` (polling) o el operador la cargó
 *   manualmente.
 * - `cancelado`: el cliente canceló mientras estaba en `procesando`, o
 *   el operador rechazó el pedido.
 */

export type PedidoStatus =
  | "procesando"
  | "en_preparacion"
  | "entregado"
  | "cancelado";

export interface PedidoItem {
  productCode: string;
  slug: string;
  name: string;
  quantity: number;
  /** Precio de compra neto al momento de confirmar el pedido. Se congela
   *  acá para que, si cambia la lista de precios, el cliente siga viendo
   *  lo que aceptó. El precio final lo define Griffo al facturar. */
  unitPrice: number;
  /** unitPrice * quantity, neto. */
  subtotal: number;
  image?: string;
}

export interface Pedido {
  /** ID generado por la web: `web-YYYYMMDD-NNNN`. */
  id: string;
  /** `client_id` del ERP Griffo (de `/ERP/Clients`). */
  clientId: string;
  clientName: string;
  clientEmail: string;
  /** `warehouse_id` del depósito/sucursal elegido al confirmar. Si el
   *  cliente tiene un solo depósito, se setea automáticamente. */
  warehouseId: string;
  /** Nombre legible (ej. "Depósito Central") — cacheado para mostrar
   *  sin re-query a Bejerman. */
  warehouseDescription: string;
  items: PedidoItem[];
  /** Suma de subtotales, neto sin IVA. */
  total: number;
  status: PedidoStatus;

  /** Status crudo del ERP (`Pendiente` / `Facturado`). Lo mantenemos
   *  para debugging y para que las otras sesiones puedan verlo al
   *  consultar el detalle admin. El status del flujo web es el de
   *  arriba — son dos conceptos distintos. */
  erpStatus?: string;

  /** Número de nota de pedido que devuelve Bejerman al cargarlo manual.
   *  Se llena cuando el operador pasa el pedido a `en_preparacion`. */
  erpOrderNumber?: string;
  /** Fecha estimada de despacho (ISO). Viene de `/ERP/orders/{id}` o la
   *  carga el operador a mano mientras ese endpoint no la devuelva. */
  estimatedDispatchDate?: string;
  /** Fecha real de despacho (ISO). Opcional, viene del ERP. */
  dispatchedAt?: string;

  /** Referencia a la factura asociada en Bejerman. */
  invoice?: {
    comp: string;
    compLetra: string;
    puntoVenta: string;
    compNro: string;
    /** Tag humano ya formateado (ej. "FC A0001-00017176"). */
    label: string;
    emissionDate: string;
  };

  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancelReason?: string;
}
