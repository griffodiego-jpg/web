import { NextResponse } from "next/server";
import { saveLead } from "@/lib/leads";
import { getResend } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    await saveLead({ kind: "newsletter", ts: Date.now(), email });

    await getResend().emails.send({
      from: "Griffo Web <onboarding@resend.dev>",
      to: "contacto@griffo.com.ar",
      subject: `Nueva suscripción al newsletter: ${email}`,
      html: `
        <h2>Nueva suscripción al newsletter</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p>El usuario solicitó recibir información sobre productos, lanzamientos y promociones.</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[newsletter] error:", e);
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}
