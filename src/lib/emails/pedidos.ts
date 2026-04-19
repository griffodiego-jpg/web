import { getResend } from "@/lib/resend";
import { SITE_URL } from "@/lib/site-url";
import { getPedidosNotificationEmail } from "@/lib/b2b-config";
import type { Pedido } from "@/types/pedido";

/**
 * Emails transaccionales del módulo de pedidos B2B. Todos son tolerantes
 * a fallo: si Resend no está configurado o la API tira error, logueamos
 * y seguimos — el pedido ya quedó en Redis y el admin lo ve igual.
 *
 * Cuando se verifique `griffo.com.ar` en Resend, cambiar el sender.
 *
 * El destinatario del mail "nuevo pedido" sale de `b2b-config`
 * (editable desde /admin/pedidos). Default: ventas@griffo.com.ar.
 */

const SENDER = "Griffo <onboarding@resend.dev>";

function formatARS(value: number): string {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function pedidoItemsHtml(pedido: Pedido): string {
  return pedido.items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-weight:bold;color:#00549F;">${it.productCode}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${it.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${it.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatARS(it.unitPrice)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:bold;">${formatARS(it.subtotal)}</td>
      </tr>`,
    )
    .join("");
}

function pedidoTablaHtml(pedido: Pedido): string {
  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
      <thead>
        <tr style="background:#f3f4f6;text-align:left;">
          <th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Código</th>
          <th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Producto</th>
          <th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;text-align:right;">Cantidad</th>
          <th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;text-align:right;">Unitario</th>
          <th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${pedidoItemsHtml(pedido)}</tbody>
      <tfoot>
        <tr style="background:#f9fafb;">
          <td colspan="4" style="padding:12px;text-align:right;font-weight:bold;">Total (+ IVA)</td>
          <td style="padding:12px;text-align:right;font-weight:bold;color:#0a2b3d;font-size:16px;">${formatARS(pedido.total)}</td>
        </tr>
      </tfoot>
    </table>`;
}

/* -------------------------------------------------------------------------- */
/* Emails                                                                     */
/* -------------------------------------------------------------------------- */

export async function sendPedidoCreadoAlCliente(pedido: Pedido): Promise<void> {
  try {
    await getResend().emails.send({
      from: SENDER,
      to: pedido.clientEmail,
      subject: `Recibimos tu pedido ${pedido.id}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#0a2b3d;max-width:600px;margin:0 auto;">
          <h1 style="color:#00549F;">Recibimos tu pedido</h1>
          <p>Hola ${pedido.clientName},</p>
          <p>Recibimos tu pedido <strong>${pedido.id}</strong>. Ya lo estamos procesando. Te vamos a avisar por mail cuando pase a preparación y cuando se despache.</p>
          ${pedidoTablaHtml(pedido)}
          <p style="color:#6b7280;font-size:13px;">Los precios son referenciales; el total definitivo lo confirma Griffo al facturar.</p>
          <p><a href="${SITE_URL}/cuenta/pedidos/${pedido.id}" style="display:inline-block;background:#00549F;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">Ver mi pedido</a></p>
          <p style="color:#6b7280;font-size:12px;margin-top:32px;">Griffo SA · Mariquita Thompson 443, La Tablada</p>
        </div>`,
    });
  } catch (e) {
    console.error("[email] sendPedidoCreadoAlCliente falló:", e);
  }
}

export async function sendPedidoCreadoAGriffo(pedido: Pedido): Promise<void> {
  try {
    const to = await getPedidosNotificationEmail();
    await getResend().emails.send({
      from: SENDER,
      to,
      subject: `🆕 Nuevo pedido ${pedido.id} · ${pedido.clientName}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#0a2b3d;max-width:700px;margin:0 auto;">
          <h1 style="color:#00549F;">Nuevo pedido B2B</h1>
          <p><strong>${pedido.clientName}</strong> (código ${pedido.clientId}) armó un pedido desde la web.</p>
          ${pedidoTablaHtml(pedido)}
          <p><a href="${SITE_URL}/admin/pedidos/${pedido.id}" style="display:inline-block;background:#00549F;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">Abrir en admin</a></p>
          <p style="color:#6b7280;font-size:13px;margin-top:16px;">Desde admin podés bajar el Excel, cargarlo en Bejerman, y marcar el pedido como "En preparación" con el nº de nota.</p>
        </div>`,
    });
  } catch (e) {
    console.error("[email] sendPedidoCreadoAGriffo falló:", e);
  }
}

export async function sendPedidoEnPreparacion(pedido: Pedido): Promise<void> {
  try {
    const fecha = pedido.estimatedDispatchDate
      ? `Fecha estimada de despacho: <strong>${formatDate(pedido.estimatedDispatchDate)}</strong>.`
      : "Te avisamos cuando tengamos la fecha de despacho.";
    await getResend().emails.send({
      from: SENDER,
      to: pedido.clientEmail,
      subject: `Tu pedido ${pedido.id} está en preparación`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#0a2b3d;max-width:600px;margin:0 auto;">
          <h1 style="color:#00549F;">Tu pedido está en preparación</h1>
          <p>Hola ${pedido.clientName},</p>
          <p>Tu pedido <strong>${pedido.id}</strong> ya se cargó en nuestro sistema interno con el nº de nota <strong>${pedido.erpOrderNumber}</strong>. ${fecha}</p>
          <p><a href="${SITE_URL}/cuenta/pedidos/${pedido.id}" style="display:inline-block;background:#00549F;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">Ver detalle</a></p>
        </div>`,
    });
  } catch (e) {
    console.error("[email] sendPedidoEnPreparacion falló:", e);
  }
}

export async function sendPedidoEntregado(pedido: Pedido): Promise<void> {
  try {
    const facturaLinea = pedido.invoice
      ? `Se emitió la factura <strong>${pedido.invoice.label}</strong>. La podés descargar desde el portal.`
      : "";
    await getResend().emails.send({
      from: SENDER,
      to: pedido.clientEmail,
      subject: `Tu pedido ${pedido.id} fue entregado`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#0a2b3d;max-width:600px;margin:0 auto;">
          <h1 style="color:#00549F;">¡Pedido entregado!</h1>
          <p>Hola ${pedido.clientName},</p>
          <p>Tu pedido <strong>${pedido.id}</strong> fue entregado. ${facturaLinea}</p>
          <p><a href="${SITE_URL}/cuenta/pedidos/${pedido.id}" style="display:inline-block;background:#00549F;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">Ver detalle</a></p>
          <p style="color:#6b7280;font-size:13px;margin-top:16px;">¡Gracias por tu compra!</p>
        </div>`,
    });
  } catch (e) {
    console.error("[email] sendPedidoEntregado falló:", e);
  }
}
