import { NextResponse } from "next/server";
import { logAdminError } from "@/lib/admin-log";
import { escapeHtml } from "@/lib/escape";
import { saveLead } from "@/lib/leads";
import { getResend } from "@/lib/resend";
import { isValidEmail } from "@/lib/validate";

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    await saveLead({ kind: "newsletter", ts: Date.now(), email });

    try {
      await getResend().emails.send({
        from: "Griffo Web <onboarding@resend.dev>",
        to: "contacto@griffo.com.ar",
        subject: `Nueva suscripción al newsletter: ${email}`,
        html: `
          <h2>Nueva suscripción al newsletter</h2>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p>El usuario solicitó recibir información sobre productos, lanzamientos y promociones.</p>
        `,
      });
    } catch (e) {
      console.error("[newsletter] error enviando email:", e);
      await logAdminError("resend", e);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[newsletter] error:", e);
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}
