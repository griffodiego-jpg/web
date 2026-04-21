import { NextResponse } from "next/server";

import { regenerateBancoImagenes } from "@/lib/banco-imagenes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/**
 * Generar el ZIP es lento: fetchear ~500-1000 fotos de S3 + zipearlas.
 * Levantamos el límite al máximo del Hobby/Pro. Si la generación no
 * entra en 60s, tendríamos que pasar a background jobs (Vercel Queues).
 */
export const maxDuration = 300;

/**
 * POST — dispara una regeneración. Responde cuando termina con la
 * metadata nueva. Protegido por el proxy admin.
 */
export async function POST() {
  try {
    const meta = await regenerateBancoImagenes();
    return NextResponse.json({ ok: true, meta });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
