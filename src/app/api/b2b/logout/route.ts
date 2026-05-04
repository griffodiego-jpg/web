import { NextResponse } from "next/server";
import { clearB2BSession } from "@/lib/b2b/session-cookie";

export const runtime = "nodejs";

/**
 * Cierra la sesión B2B server-side borrando la cookie httpOnly. El
 * componente cliente (`useMockSession.logout`) tiene que llamar este
 * endpoint además de limpiar localStorage; sino la cookie persiste y
 * el server seguiría considerando al usuario logueado para descargas
 * y demás endpoints protegidos.
 */
export async function POST() {
  await clearB2BSession();
  return NextResponse.json({ ok: true });
}
