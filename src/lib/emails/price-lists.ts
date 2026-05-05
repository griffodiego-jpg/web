import { escapeHtml } from "@/lib/escape";
import { sendEmail } from "@/lib/resend";
import { SITE_URL } from "@/lib/site-url";
import type { PriceList } from "@/types/price-list";
import type { BejermanClient } from "@/types/bejerman";

const SENDER = "Griffo <contacto@griffo.com.ar>";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Manda un email a cada cliente con `priceListCode === list.code`
 * avisando que hay nueva lista. Tolerante a fallo — un mail que
 * explote no corta el resto.
 */
export async function sendNewPriceListEmails(
  list: PriceList,
  clients: BejermanClient[],
): Promise<{ sent: number; failed: number }> {
  const targets = clients.filter(
    (c) =>
      c.priceListCode &&
      c.priceListCode.toUpperCase() === list.code.toUpperCase() &&
      c.email,
  );
  let sent = 0;
  let failed = 0;

  for (const client of targets) {
    try {
      await sendEmail({
        from: SENDER,
        to: client.email,
        subject: `Nueva lista de precios disponible — ${list.name}`,
        html: `
          <div style="font-family:Arial,sans-serif;color:#0a2b3d;max-width:600px;margin:0 auto;">
            <h1 style="color:#00549F;">Nueva lista de precios</h1>
            <p>Hola ${escapeHtml(client.name)},</p>
            <p>Publicamos una <strong>nueva versión</strong> de tu lista de precios: <strong>${escapeHtml(list.name)}</strong>.</p>
            <p style="color:#6b7280;font-size:13px;">Fecha de publicación: ${formatDate(list.uploadedAt)}.</p>
            ${list.note ? `<p style="background:#eff6ff;border-left:3px solid #00ADD0;padding:10px 14px;">${escapeHtml(list.note)}</p>` : ""}
            <p>
              <a href="${SITE_URL}/cuenta/listas" style="display:inline-block;background:#00549F;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">Ver mi lista</a>
            </p>
            <p style="color:#6b7280;font-size:13px;margin-top:24px;">Si tenés dudas sobre los precios, escribinos a ventas@griffo.com.ar.</p>
          </div>`,
      });
      sent++;
    } catch (e) {
      console.error(`[email] sendNewPriceList fallo para ${client.email}:`, e);
      failed++;
    }
  }
  return { sent, failed };
}
