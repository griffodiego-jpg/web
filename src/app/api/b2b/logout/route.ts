import { NextResponse } from "next/server";

import { destroyB2bSession } from "@/lib/b2b/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Logout del portal B2B. Borra la entry de Redis + clearea la cookie.
 * El frontend además limpia localStorage para que el header refleje
 * el estado deslogueado al toque.
 */
export async function POST() {
  await destroyB2bSession();
  return NextResponse.json({ ok: true });
}
