import { NextResponse } from "next/server";

/**
 * Stub de suscripción a newsletter.
 * TODO: conectar con el backend / servicio de mailing real
 * (ej. Mailchimp, Brevo, o endpoint propio).
 */
export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }
    // Acá va la integración real con el proveedor de mailing.
    console.log("[newsletter] nueva suscripción:", email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
