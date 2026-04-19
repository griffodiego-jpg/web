import { NextResponse } from "next/server";
import { markEnPreparacion, getPedido } from "@/lib/pedidos";
import { sendPedidoEnPreparacion } from "@/lib/emails/pedidos";

/**
 * `POST /api/admin/pedidos/{id}/marcar-cargado`
 *
 * Pasa el pedido de `procesando` a `en_preparacion`. Requiere
 * `erpOrderNumber`, acepta opcional `estimatedDispatchDate` (ISO date).
 *
 * Manda mail al cliente avisando.
 *
 * Protegido por el proxy de admin.
 */

export const dynamic = "force-dynamic";

interface Body {
  erpOrderNumber?: unknown;
  estimatedDispatchDate?: unknown;
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

  const erpOrderNumber = String(body.erpOrderNumber ?? "").trim();
  if (!erpOrderNumber) {
    return NextResponse.json(
      { error: "Falta el nº de nota de pedido (erpOrderNumber)" },
      { status: 400 },
    );
  }
  const estimatedDispatchDate =
    typeof body.estimatedDispatchDate === "string" && body.estimatedDispatchDate.trim()
      ? new Date(body.estimatedDispatchDate).toISOString()
      : undefined;

  const current = await getPedido(id);
  if (!current) {
    return NextResponse.json({ error: "Pedido no existe" }, { status: 404 });
  }
  if (current.status !== "procesando") {
    return NextResponse.json(
      {
        error: `El pedido está en "${current.status}". Solo se puede marcar como cargado si está en "procesando".`,
      },
      { status: 400 },
    );
  }

  try {
    const updated = await markEnPreparacion(id, {
      erpOrderNumber,
      estimatedDispatchDate,
    });
    await sendPedidoEnPreparacion(updated);
    return NextResponse.json({ ok: true, pedido: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
