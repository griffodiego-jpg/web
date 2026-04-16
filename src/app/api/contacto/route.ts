import { NextResponse } from "next/server";
import { getResend } from "@/lib/resend";

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

    await getResend().emails.send({
      from: "Griffo Web <onboarding@resend.dev>",
      to: "contacto@griffo.com.ar",
      replyTo: body.email,
      subject: `Consulta web de ${body.nombre}`,
      html: `
        <h2>Nueva consulta desde la web</h2>
        <p><strong>Nombre:</strong> ${body.nombre}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Teléfono:</strong> ${body.telefono || "No proporcionado"}</p>
        <hr />
        <p><strong>Mensaje:</strong></p>
        <p>${body.mensaje.replace(/\n/g, "<br>")}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[contacto] error:", e);
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}
