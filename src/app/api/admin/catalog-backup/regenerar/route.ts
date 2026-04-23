import { NextResponse } from "next/server";

import { regenerateCatalogSnapshot } from "@/lib/catalog-backup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Regenera el snapshot del catálogo a demanda (botón "Regenerar ahora"
 * en `/admin/catalogo-backup`). Protegido por el proxy admin — no se
 * necesita header extra acá.
 */
export async function POST() {
  try {
    const snapshot = await regenerateCatalogSnapshot();
    return NextResponse.json({ ok: true, snapshot });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
