import { NextResponse } from "next/server";

import { regenerateCatalogSnapshot } from "@/lib/catalog-backup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron diario que genera el snapshot del catálogo. Schedule en
 * `vercel.json` → `0 4 * * *` (todos los días a las 4 AM UTC = 1 AM AR).
 *
 * Vercel Cron invoca este endpoint con el header `Authorization:
 * Bearer <CRON_SECRET>`. Validamos que matchee — sin eso, cualquiera
 * con conocimiento del path podría forzar regeneraciones.
 *
 * Si SpecParts falla, la regeneración lanza y Vercel loguea el error.
 * No corremos fallback acá: preferimos ver el error antes que
 * sobreescribir un snapshot bueno con uno basado en data vieja.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }
  try {
    const snapshot = await regenerateCatalogSnapshot();
    return NextResponse.json({ ok: true, snapshot });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
