import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getPedido, markEntregado, persistErpStatus } from "@/lib/pedidos";
import { sendPedidoEntregado } from "@/lib/emails/pedidos";

/**
 * Webhook receptor de eventos del ERP Griffo (middleware de Promotive).
 *
 * El técnico dispara POST a este endpoint cuando detecta cambios en un
 * pedido. Eventos posibles:
 *
 *   order.invoiced        → se emitió una factura asociada al pedido.
 *                          Web marca el pedido como "entregado" y
 *                          guarda la referencia a la factura.
 *   order.status_changed  → cambio de status en el ERP (Pendiente →
 *                          Facturado, etc.). Hoy no se usa para flujo
 *                          — order.invoiced ya cubre la transición
 *                          importante. Lo logueamos por si el técnico
 *                          suma más estados después.
 *
 * Payload:
 *   {
 *     event: "order.invoiced" | "order.status_changed",
 *     occurredAt: "2026-04-22T10:00:00Z",
 *     order: {
 *       ErpOrderId: "PED-23900",
 *       Status: "Facturado",
 *       invoice?: { comp, compLetra, puntoVenta, compNro, emissionDate },
 *       ...otros campos posibles
 *     }
 *   }
 *
 * Autenticación: el técnico manda un header (configurable, default
 * X-Bejerman-Webhook-Secret) con un valor secreto compartido.
 * Comparamos con timingSafeEqual para evitar side-channel attacks.
 *
 * El endpoint vive en `/api/webhooks/*` que está fuera del matcher
 * del proxy admin — la auth es puramente por el secret header.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_HEADER = "x-bejerman-webhook-secret";

function verifySecret(req: Request): boolean {
  const expected = process.env.BEJERMAN_WEBHOOK_SECRET;
  if (!expected) {
    console.warn("[webhook/bejerman] BEJERMAN_WEBHOOK_SECRET no configurado");
    return false;
  }
  const headerName = (
    process.env.BEJERMAN_WEBHOOK_HEADER_NAME ?? DEFAULT_HEADER
  ).toLowerCase();
  const received = req.headers.get(headerName);
  if (!received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

interface InvoicePayload {
  comp?: string;
  compLetra?: string;
  puntoVenta?: string;
  compNro?: string;
  emissionDate?: string;
}

interface OrderPayload {
  ErpOrderId?: string;
  erpOrderId?: string;
  Status?: string;
  status?: string;
  invoice?: InvoicePayload;
}

interface WebhookPayload {
  event?: string;
  occurredAt?: string;
  order?: OrderPayload;
}

export async function POST(req: Request) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: WebhookPayload;
  try {
    body = (await req.json()) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const event = (body.event ?? "").trim();
  const order = body.order ?? {};
  const erpOrderId = (order.ErpOrderId ?? order.erpOrderId ?? "").trim();

  if (!event) {
    return NextResponse.json({ error: "Falta event" }, { status: 400 });
  }
  if (!erpOrderId) {
    return NextResponse.json(
      { error: "Falta order.ErpOrderId" },
      { status: 400 },
    );
  }

  // Buscamos el pedido local por erpOrderNumber.
  const pedido = await findPedidoByErpOrderId(erpOrderId);
  if (!pedido) {
    // Pedido cargado directo en Bejerman, no en la web. Por ahora sólo
    // lo logueamos — cuando el endpoint `GET /ERP/clientes/{code}/pedidos`
    // esté listo, podremos mostrarlo igual en el portal del cliente.
    console.log(
      `[webhook/bejerman] Pedido ${erpOrderId} no encontrado local — ignorado (evento ${event}).`,
    );
    return NextResponse.json({ ok: true, matched: false });
  }

  if (event === "order.invoiced") {
    const inv = order.invoice ?? {};
    try {
      const updated = await markEntregado(pedido.id, {
        invoiceComp: inv.comp,
        invoiceCompLetra: inv.compLetra,
        invoicePuntoVenta: inv.puntoVenta,
        invoiceCompNro: inv.compNro,
        invoiceEmissionDate: inv.emissionDate,
      });
      await sendPedidoEntregado(updated);
      return NextResponse.json({ ok: true, matched: true, id: updated.id });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      console.error(`[webhook/bejerman] markEntregado falló:`, e);
      // Tolerante: 200 igual para que Bejerman no reintente infinito
      // si, p. ej., el pedido ya estaba en "entregado".
      return NextResponse.json({ ok: true, matched: true, error: msg });
    }
  }

  if (event === "order.status_changed") {
    const status = (order.Status ?? order.status ?? "").trim();
    try {
      await persistErpStatus(pedido.id, status);
    } catch (e) {
      console.error("[webhook/bejerman] persistErpStatus falló:", e);
    }
    return NextResponse.json({ ok: true, matched: true });
  }

  // Evento no reconocido — respondemos 200 para que Bejerman no
  // reintente, pero lo logueamos por si el técnico sumó eventos.
  console.log(`[webhook/bejerman] Evento desconocido: ${event}`);
  return NextResponse.json({ ok: true, ignored: true });
}

async function findPedidoByErpOrderId(erpOrderId: string) {
  // TODO: índice dedicado erpOrderNumber → id para evitar el full-scan
  // cuando haya muchos pedidos. Por ahora iteramos la lista reciente —
  // suficiente para volúmenes razonables.
  const { listPedidosAll } = await import("@/lib/pedidos");
  const all = await listPedidosAll(1000);
  return all.find((p) => p.erpOrderNumber === erpOrderId) ?? null;
}
