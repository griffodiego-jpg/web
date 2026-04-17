import { NextResponse } from "next/server";
import { getResend } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const nombre = formData.get("nombre") as string;
    const empresa = formData.get("empresa") as string;
    const email = formData.get("email") as string;
    const telefono = (formData.get("telefono") as string) || "No proporcionado";
    const industria = formData.get("industria") as string;
    const cantidad = (formData.get("cantidad") as string) || "No especificada";
    const descripcion = formData.get("descripcion") as string;
    const archivo = formData.get("archivo") as File | null;

    if (!nombre || !empresa || !email || !industria || !descripcion) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Preparar adjunto si hay archivo
    const attachments: Array<{
      filename: string;
      content: Buffer;
    }> = [];

    if (archivo && archivo.size > 0) {
      if (archivo.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "El archivo no puede superar 5 MB" },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await archivo.arrayBuffer());
      attachments.push({
        filename: archivo.name,
        content: buffer,
      });
    }

    await getResend().emails.send({
      from: "Griffo Web <onboarding@resend.dev>",
      to: "contacto@griffo.com.ar",
      replyTo: email,
      subject: `Consulta desarrollo a medida — ${empresa}`,
      attachments,
      html: `
        <h2>Nueva consulta de desarrollo a medida</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px;font-weight:bold;border-bottom:1px solid #eee">Nombre</td><td style="padding:6px;border-bottom:1px solid #eee">${nombre}</td></tr>
          <tr><td style="padding:6px;font-weight:bold;border-bottom:1px solid #eee">Empresa</td><td style="padding:6px;border-bottom:1px solid #eee">${empresa}</td></tr>
          <tr><td style="padding:6px;font-weight:bold;border-bottom:1px solid #eee">Email</td><td style="padding:6px;border-bottom:1px solid #eee">${email}</td></tr>
          <tr><td style="padding:6px;font-weight:bold;border-bottom:1px solid #eee">Teléfono</td><td style="padding:6px;border-bottom:1px solid #eee">${telefono}</td></tr>
          <tr><td style="padding:6px;font-weight:bold;border-bottom:1px solid #eee">Industria</td><td style="padding:6px;border-bottom:1px solid #eee">${industria}</td></tr>
          <tr><td style="padding:6px;font-weight:bold;border-bottom:1px solid #eee">Cantidad estimada</td><td style="padding:6px;border-bottom:1px solid #eee">${cantidad}</td></tr>
        </table>
        <h3 style="margin-top:20px">Descripción de la pieza</h3>
        <p>${descripcion.replace(/\n/g, "<br>")}</p>
        ${attachments.length > 0 ? `<p style="margin-top:15px;color:#666">📎 Archivo adjunto: ${archivo!.name}</p>` : ""}
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[desarrollo] error:", e);
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}
