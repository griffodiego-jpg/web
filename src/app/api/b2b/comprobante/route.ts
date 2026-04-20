import { NextResponse } from "next/server";
import { getComprobantePdf } from "@/lib/api/bejerman";
import { mockCurrentClient } from "@/data/mock-b2b";

/**
 * `GET /api/b2b/comprobante`
 *
 * Proxy autenticado hacia `GET /ERP/GetComprobante`. Streamea el PDF
 * al browser. Query params iguales a los de Bejerman:
 *
 *   ?Comp=FC&CompLetra=A&PuntoVenta=0001&CompNro=00017176&CodCliente=000042
 *
 * Validaciones:
 * - Requiere que el CodCliente sea el del usuario logueado. Hoy usamos
 *   `mockCurrentClient`; cuando haya Firebase Auth, leer del token.
 * - Si Bejerman devuelve 404, devolvemos 404 con un mensaje humano.
 *
 * Se puede llamar directo desde un `<a href>` — el browser descarga.
 */

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const comp = (url.searchParams.get("Comp") ?? "").trim();
  const compLetra = (url.searchParams.get("CompLetra") ?? "").trim();
  const puntoVenta = (url.searchParams.get("PuntoVenta") ?? "").trim();
  const compNro = (url.searchParams.get("CompNro") ?? "").trim();
  const codCliente = (url.searchParams.get("CodCliente") ?? "").trim();

  if (!comp || !puntoVenta || !compNro || !codCliente) {
    return NextResponse.json(
      { error: "Faltan parámetros (Comp, PuntoVenta, CompNro, CodCliente)" },
      { status: 400 },
    );
  }

  // Ownership: que el cliente sólo baje sus propios comprobantes.
  if (codCliente !== mockCurrentClient.client_id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { buffer, contentType } = await getComprobantePdf({
      Comp: comp,
      CompLetra: compLetra || undefined,
      PuntoVenta: puntoVenta,
      CompNro: compNro,
      CodCliente: codCliente,
    });
    const filename = `${comp}${compLetra}${puntoVenta}-${compNro}-${codCliente}.pdf`;
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
        { error: "El PDF no está disponible." },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
