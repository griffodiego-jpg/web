import { NextResponse } from "next/server";
import { cancelPedido, getPedido } from "@/lib/pedidos";

/**
 * `POST /api/admin/pedidos/{id}/cancelar`
 *
 * Admin rechaza/cancela un pedido en estado `procesando`. Body opcional
 * `{ reason }` para guardar el motivo. Protegido por el proxy admin.
 */

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let reason: string | undefined;
  try {
    const body = (await req.json()) as { reason?: unknown };
    if (typeof body?.reason === "string" && body.reason.trim()) {
      reason = body.reason.trim().slice(0, 500);
    }
  } catch {
    /* body opcional */
  }

  const current = await getPedido(id);
  if (!current) {
    return NextResponse.json({ error: "Pedido no existe" }, { status: 404 });
  }

  try {
    const updated = await cancelPedido(id, reason);
    return NextResponse.json({ ok: true, pedido: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al cancelar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
