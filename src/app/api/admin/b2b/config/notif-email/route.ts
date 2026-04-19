import { NextResponse } from "next/server";
import { setPedidosNotificationEmail } from "@/lib/b2b-config";

/**
 * `POST /api/admin/b2b/config/notif-email`
 *
 * Actualiza el email al que se avisan los pedidos B2B nuevos. Body:
 * `{ email: string }`. Protegido por el proxy de admin.
 */

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: unknown };
  try {
    body = (await req.json()) as { email?: unknown };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim();
  if (!email || !email.includes("@") || email.length > 255) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }
  try {
    await setPedidosNotificationEmail(email);
    return NextResponse.json({ ok: true, email });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
