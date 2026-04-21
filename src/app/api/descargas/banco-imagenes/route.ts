import { NextResponse } from "next/server";

import { readMeta } from "@/lib/banco-imagenes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET — redirige al ZIP actual. URL estable para compartir con clientes:
 * `<SITE_URL>/api/descargas/banco-imagenes.zip`.
 *
 * Si nunca se generó, devuelve 503 con mensaje explicando que el
 * admin tiene que regenerarlo primero.
 */
export async function GET() {
  const meta = await readMeta();
  if (!meta?.blobUrl) {
    return NextResponse.json(
      {
        error:
          "El banco de imágenes todavía no se generó. Escribinos a contacto@griffo.com.ar y te lo enviamos.",
      },
      { status: 503 },
    );
  }
  return NextResponse.redirect(meta.blobUrl, 302);
}
