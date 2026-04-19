import { NextResponse } from "next/server";
import { cancelPedido, getPedido } from "@/lib/pedidos";
import { mockCurrentClient } from "@/data/mock-b2b";

/**
 * `POST /api/b2b/pedidos/{id}/cancelar` — cancela un pedido en estado
 * `procesando`. Sólo el dueño del pedido puede cancelarlo.
 *
 * Hoy el dueño se determina contra `mockCurrentClient`. Cuando Firebase
 * Auth esté activo, usar el token para validar.
 */

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const pedido = await getPedido(id);
  if (!pedido) {
    return NextResponse.json({ error: "Pedido no existe" }, { status: 404 });
  }
  if (pedido.clientId !== mockCurrentClient.client_id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let reason: string | undefined;
  try {
    const body = (await req.json()) as { reason?: unknown };
    if (typeof body?.reason === "string" && body.reason.trim()) {
      reason = body.reason.trim().slice(0, 500);
    }
  } catch {
    /* body opcional */
  }

  try {
    const updated = await cancelPedido(id, reason);
    return NextResponse.json({ ok: true, pedido: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al cancelar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
