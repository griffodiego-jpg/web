import { NextResponse } from "next/server";
import { clearAdminErrors } from "@/lib/admin-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Limpia el log de errores del dashboard admin. */
export async function POST() {
  await clearAdminErrors();
  return NextResponse.json({ ok: true });
}
