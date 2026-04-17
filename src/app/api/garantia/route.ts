import { NextResponse } from "next/server";
import { saveLead } from "@/lib/leads";
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

    await saveLead({
      kind: "garantia",
      ts: Date.now(),
      serial: String(body.serial),
      buyingDate: String(body.buying_date),
      buyingPlace: String(body.buying_place),
      nombre: String(body.name),
      empresa: String(body.company),
      domicilio: String(body.place),
      pais: String(body.country),
      provincia: String(body.province),
      ciudad: String(body.city),
      email,
      telefono: String(body.phone),
      subscribe: !!body.subscribe,
    });

    try {
      await getResend().emails.send({
        from: "Griffo Web <onboarding@resend.dev>",
        // contacto@ es la única dirección verificada del tenant de Resend
        // mientras no se verifique el dominio griffo.com.ar. Antes iba a
        // garantia@ y fallaba silenciosamente.
        to: "contacto@griffo.com.ar",
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
    } catch (e) {
      // Si Resend falla, el lead ya quedó en Redis — devolvemos OK igual.
      console.error("[garantia] error enviando email:", e);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[garantia] error:", e);
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}
