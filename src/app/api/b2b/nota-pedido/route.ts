import { NextResponse } from "next/server";
import { getComprobantePdf } from "@/lib/api/bejerman";
import { getCurrentClient } from "@/lib/b2b/current-client";

/**
 * `GET /api/b2b/nota-pedido?erpOrderId=XXX`
 *
 * Descarga el PDF de una Nota de Pedido (NP) del ERP. Intenta con el
 * mismo endpoint `GET /ERP/GetComprobante` que usamos para facturas,
 * pasando `Comp=NP` y el número del pedido.
 *
 * Si el técnico expone el PDF de la NP con otro endpoint, acá hay que
 * cambiar la estrategia — la UI del cliente queda igual.
 *
 * Valida ownership: el CodCliente va a ser el del usuario logueado
 * (o el que impersona el admin).
 */

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const erpOrderId = (url.searchParams.get("erpOrderId") ?? "").trim();

  if (!erpOrderId) {
    return NextResponse.json(
      { error: "Falta erpOrderId" },
      { status: 400 },
    );
  }

  const client = await getCurrentClient();

  try {
    // La API valida CompLetra como [Required] y rechaza string vacío.
    // Probamos con 'X' como placeholder (convención interna de
    // comprobantes no fiscales tipo recibo). Si el endpoint no
    // soporta NP en absoluto, esto va a fallar con un 404 distinto
    // y sabemos que hay que pedirle al técnico el endpoint correcto.
    const { buffer, contentType } = await getComprobantePdf({
      Comp: "NP",
      CompLetra: "X",
      PuntoVenta: "0001",
      CompNro: erpOrderId,
      CodCliente: client.client_id,
    });
    const filename = `NP-${erpOrderId}-${client.client_id}.pdf`;
    const body = new Uint8Array(buffer);
    return new Response(body as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    const is404 = /→ 404/.test(msg) || /no existe/i.test(msg);
    if (is404) {
      return NextResponse.json(
        {
          error:
            "El PDF de la nota de pedido no está disponible. Puede que el endpoint GetComprobante no acepte Comp=NP — confirmar con el técnico del ERP.",
        },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
