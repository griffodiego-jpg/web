import { NextResponse } from "next/server";

import { getPriceList } from "@/lib/price-lists";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * `GET /api/admin/listas-precios/download?code=LISTA3` — descarga la
 * lista cargada bajo ese código. Útil para que el admin verifique
 * desde la web qué archivo está sirviéndose hoy. Protegido por el
 * proxy de admin (no expone el URL del Blob).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = (url.searchParams.get("code") ?? "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "Falta el código" }, { status: 400 });
  }

  const list = await getPriceList(code);
  if (!list) {
    return NextResponse.json(
      { error: `No hay lista cargada con el código ${code}.` },
      { status: 404 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(list.fileUrl, { cache: "no-store" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error de red";
    return NextResponse.json({ error: message }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: `El archivo no está disponible (status ${upstream.status}).` },
      { status: 502 },
    );
  }

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
