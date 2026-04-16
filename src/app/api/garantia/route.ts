import { NextResponse } from "next/server";
import { getResend } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const required = [
      "serial", "buying_date", "buying_place", "name", "company",
      "place", "country", "province", "city", "email", "phone",
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

    await getResend().emails.send({
      from: "Griffo Web <onboarding@resend.dev>",
      to: "garantia@griffo.com.ar",
      replyTo: email,
      subject: `Registro de garantía — ${body.name} (S/N: ${body.serial})`,
      html: `
        <h2>Nuevo registro de garantía de máquina montadora</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:5px;font-weight:bold">Número de serie</td><td style="padding:5px">${body.serial}</td></tr>
          <tr><td style="padding:5px;font-weight:bold">Fecha de compra</td><td style="padding:5px">${body.buying_date}</td></tr>
          <tr><td style="padding:5px;font-weight:bold">Lugar de compra</td><td style="padding:5px">${body.buying_place}</td></tr>
          <tr><td style="padding:5px;font-weight:bold">Nombre</td><td style="padding:5px">${body.name}</td></tr>
          <tr><td style="padding:5px;font-weight:bold">Empresa</td><td style="padding:5px">${body.company}</td></tr>
          <tr><td style="padding:5px;font-weight:bold">Domicilio</td><td style="padding:5px">${body.place}</td></tr>
          <tr><td style="padding:5px;font-weight:bold">País</td><td style="padding:5px">${body.country}</td></tr>
          <tr><td style="padding:5px;font-weight:bold">Provincia</td><td style="padding:5px">${body.province}</td></tr>
          <tr><td style="padding:5px;font-weight:bold">Ciudad</td><td style="padding:5px">${body.city}</td></tr>
          <tr><td style="padding:5px;font-weight:bold">Email</td><td style="padding:5px">${body.email}</td></tr>
          <tr><td style="padding:5px;font-weight:bold">Teléfono</td><td style="padding:5px">${body.phone}</td></tr>
          <tr><td style="padding:5px;font-weight:bold">Newsletter</td><td style="padding:5px">${body.subscribe ? "Sí" : "No"}</td></tr>
        </table>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[garantia] error:", e);
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}
