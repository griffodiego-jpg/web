import { NextResponse } from "next/server";

import { regenerateBancoImagenes } from "@/lib/banco-imagenes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Cron semanal que regenera el banco de imágenes. Se engancha via
 * `vercel.json` (schedule `0 4 * * 1` → todos los lunes a las 4 AM UTC).
 *
 * Vercel Cron invoca este endpoint con el header `Authorization:
 * Bearer <CRON_SECRET>`. Validamos que matchee — sin eso, cualquiera
 * con conocimiento del path podría disparar regeneraciones caras.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // Fail-closed: sin CRON_SECRET, no se acepta ningún disparo. La
  // regeneración baja ~500 fotos y zipea — DoS trivial si quedaba
  // abierto.
  if (!secret) {
    console.error("[cron/banco-imagenes] CRON_SECRET no configurado");
    return NextResponse.json(
      { error: "CRON_SECRET no configurado" },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const meta = await regenerateBancoImagenes();
    return NextResponse.json({ ok: true, meta });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
