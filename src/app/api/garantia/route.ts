import { NextResponse } from "next/server";

/**
 * Stub del endpoint de registro de garantía de la máquina montadora.
 * TODO: conectar con el backend real (envío de email al equipo de
 * atención al cliente, guardado en CRM/DB).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Validación mínima de campos obligatorios
    const required = [
      "serial",
      "buying_date",
      "buying_place",
      "name",
      "company",
      "place",
      "country",
      "province",
      "city",
      "email",
      "phone",
    ];
    for (const k of required) {
      if (!body[k] || typeof body[k] !== "string" || !(body[k] as string).trim()) {
        return NextResponse.json(
          { error: `Campo obligatorio faltante: ${k}` },
          { status: 400 }
        );
      }
    }

    const email = String(body.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    console.log("[garantia] nuevo registro:", body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
