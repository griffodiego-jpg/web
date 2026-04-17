import { NextResponse } from "next/server";
import { saveLead } from "@/lib/leads";
import { getResend } from "@/lib/resend";

/**
 * Registro para descarga de recursos gated (banco de imágenes, base de
 * datos). Notifica a contacto@griffo.com.ar con los datos del lead.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      nombre?: string;
      empresa?: string;
      email?: string;
      telefono?: string;
      compraA?: string;
      recursoId?: string;
      recursoTitulo?: string;
    };

    if (
      !body.nombre ||
      !body.empresa ||
      !body.email ||
      !body.telefono ||
      !body.compraA ||
      !body.recursoId
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    await saveLead({
      kind: "descarga",
      ts: Date.now(),
      nombre: body.nombre,
      empresa: body.empresa,
      email: body.email,
      telefono: body.telefono,
      compraA: body.compraA,
      recurso: body.recursoTitulo ?? body.recursoId,
    });

    await getResend().emails.send({
      from: "Griffo Web <onboarding@resend.dev>",
      to: "contacto@griffo.com.ar",
      replyTo: body.email,
      subject: `Descarga registrada: ${body.recursoTitulo ?? body.recursoId}`,
      html: `
        <h2>Nuevo registro para descarga</h2>
        <p>Recurso solicitado: <strong>${body.recursoTitulo ?? body.recursoId}</strong></p>
        <table style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td style="padding:6px;font-weight:bold;border-bottom:1px solid #eee">Nombre</td><td style="padding:6px;border-bottom:1px solid #eee">${body.nombre}</td></tr>
          <tr><td style="padding:6px;font-weight:bold;border-bottom:1px solid #eee">Empresa</td><td style="padding:6px;border-bottom:1px solid #eee">${body.empresa}</td></tr>
          <tr><td style="padding:6px;font-weight:bold;border-bottom:1px solid #eee">Email</td><td style="padding:6px;border-bottom:1px solid #eee">${body.email}</td></tr>
          <tr><td style="padding:6px;font-weight:bold;border-bottom:1px solid #eee">Teléfono</td><td style="padding:6px;border-bottom:1px solid #eee">${body.telefono}</td></tr>
          <tr><td style="padding:6px;font-weight:bold;border-bottom:1px solid #eee">Compra Griffo a</td><td style="padding:6px;border-bottom:1px solid #eee">${body.compraA}</td></tr>
        </table>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[descargas/registro] error:", e);
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}
