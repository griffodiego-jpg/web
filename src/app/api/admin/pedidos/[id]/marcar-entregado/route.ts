import { NextResponse } from "next/server";
import { markEntregado, getPedido } from "@/lib/pedidos";
import { sendPedidoEntregado } from "@/lib/emails/pedidos";

/**
 * `POST /api/admin/pedidos/{id}/marcar-entregado`
 *
 * Pasa el pedido de `en_preparacion` a `entregado`. Pide los datos de
 * la factura (comp, compLetra, puntoVenta, compNro) para linkear al
 * comprobante en Bejerman.
 *
 * Manda mail al cliente avisando + linkeando a la factura.
 */

export const dynamic = "force-dynamic";

interface Body {
  invoiceComp?: unknown;
  invoiceCompLetra?: unknown;
  invoicePuntoVenta?: unknown;
  invoiceCompNro?: unknown;
  invoiceEmissionDate?: unknown;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const invoiceComp = String(body.invoiceComp ?? "").trim();
  const invoiceCompLetra = String(body.invoiceCompLetra ?? "").trim();
  const invoicePuntoVenta = String(body.invoicePuntoVenta ?? "").trim();
  const invoiceCompNro = String(body.invoiceCompNro ?? "").trim();

  if (!invoiceComp || !invoicePuntoVenta || !invoiceCompNro) {
    return NextResponse.json(
      {
        error:
          "Faltan datos de factura (comp, puntoVenta y compNro son obligatorios)",
      },
      { status: 400 },
    );
  }

  const current = await getPedido(id);
  if (!current) {
    return NextResponse.json({ error: "Pedido no existe" }, { status: 404 });
  }
  if (current.status !== "en_preparacion") {
    return NextResponse.json(
      {
        error: `El pedido está en "${current.status}". Solo se puede marcar entregado si está en "en_preparacion".`,
      },
      { status: 400 },
    );
  }

  try {
    const updated = await markEntregado(id, {
      invoiceComp,
      invoiceCompLetra,
      invoicePuntoVenta,
      invoiceCompNro,
      invoiceEmissionDate: parseSafeDate(body.invoiceEmissionDate),
    });
    await sendPedidoEntregado(updated);
    return NextResponse.json({ ok: true, pedido: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Parsea un date string opcional. Si la fecha no es válida (ej. el
 * operador escribió mal), devuelve undefined en vez de explotar al
 * llamar `.toISOString()` sobre Invalid Date.
 */
function parseSafeDate(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}
