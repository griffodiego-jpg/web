import { NextResponse } from "next/server";

/**
 * Stub del endpoint de contacto.
 * TODO: conectar con el backend real (envío de email, guardado en DB o CRM).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      nombre?: string;
      email?: string;
      telefono?: string;
      mensaje?: string;
    };

    if (!body.nombre || !body.email || !body.mensaje) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    console.log("[contacto] nueva consulta:", body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
