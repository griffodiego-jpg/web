import { NextResponse } from "next/server";

import { getAuthenticatedClient } from "@/lib/b2b/current-client";
import {
  getPriceListForClient,
  markPriceListSeen,
} from "@/lib/price-lists";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * `GET /api/b2b/lista-precios` — descarga la lista de precios asignada
 * al cliente logueado.
 *
 * Seguridad:
 *  - Requiere cookie de sesión B2B (o impersonación de admin). Sin eso
 *    devuelve 401 — los URLs de Vercel Blob NUNCA se exponen al cliente,
 *    así nadie con el link puede bajar la lista de otro.
 *  - Sólo se sirve la lista cuyo `code` matchee el `priceListCode` del
 *    cliente. Si pidiera otra distinta, también 403.
 *
 * Streamea el contenido del Blob al usuario; no redirige al URL público
 * porque eso anularía la protección.
 */
export async function GET() {
  const client = await getAuthenticatedClient();
  if (!client) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión para descargar tu lista." },
      { status: 401 },
    );
  }

  const list = await getPriceListForClient(client.priceListCode);
  if (!list) {
    return NextResponse.json(
      {
        error:
          "Tu cuenta no tiene lista de precios asignada todavía. Escribinos a ventas@griffo.com.ar.",
      },
      { status: 404 },
    );
  }

  // Fetch del Blob server-side. El cliente nunca ve la URL pública.
  let upstream: Response;
  try {
    upstream = await fetch(list.fileUrl, { cache: "no-store" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error de red";
    return NextResponse.json(
      { error: `No se pudo descargar la lista: ${message}` },
      { status: 502 },
    );
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: `El archivo no está disponible (status ${upstream.status}).` },
      { status: 502 },
    );
  }

  // Marca como vista para que la alerta "lista nueva" desaparezca del
  // resumen del cliente.
  await markPriceListSeen(client.client_id).catch(() => {});

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";
  const contentLength = upstream.headers.get("content-length");
  const safeFilename = list.filename.replace(/[^\w.\-]+/g, "_");

  const headers: HeadersInit = {
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${safeFilename}"`,
    "Cache-Control": "private, no-store",
  };
  if (contentLength) headers["Content-Length"] = contentLength;

  return new NextResponse(upstream.body, { status: 200, headers });
}
