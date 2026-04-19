import { NextResponse } from "next/server";
import { escapeCsvCell } from "@/lib/escape";
import {
  listLeads,
  type ContactoLead,
  type DescargaLead,
  type GarantiaLead,
  type Lead,
  type LeadKind,
  type NewsletterLead,
} from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_KINDS: LeadKind[] = ["descarga", "contacto", "newsletter", "garantia"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const kindParam = url.searchParams.get("kind") as LeadKind | null;
  const kind: LeadKind =
    kindParam && VALID_KINDS.includes(kindParam) ? kindParam : "descarga";

  const leads = await listLeads(kind);
  const csv = toCsv(kind, leads);
  const filename = `leads-${kind}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function toCsv(kind: LeadKind, leads: Lead[]): string {
  const header =
    kind === "descarga"
      ? ["Fecha", "Recurso", "Nombre", "Empresa", "Email", "Teléfono", "Compra a"]
      : kind === "contacto"
        ? ["Fecha", "Nombre", "Email", "Teléfono", "Mensaje"]
        : kind === "garantia"
          ? [
              "Fecha",
              "N° serie",
              "Fecha compra",
              "Lugar compra",
              "Nombre",
              "Empresa",
              "Email",
              "Teléfono",
              "Domicilio",
              "Ciudad",
              "Provincia",
              "País",
              "Newsletter",
            ]
          : ["Fecha", "Email"];

  const rows = leads.map((l) => {
    const fecha = new Date(l.ts).toLocaleString("es-AR");
    if (kind === "descarga") {
      const d = l as DescargaLead;
      return [fecha, d.recurso, d.nombre, d.empresa, d.email, d.telefono, d.compraA];
    }
    if (kind === "contacto") {
      const c = l as ContactoLead;
      return [fecha, c.nombre, c.email, c.telefono ?? "", c.mensaje];
    }
    if (kind === "garantia") {
      const g = l as GarantiaLead;
      return [
        fecha,
        g.serial,
        g.buyingDate,
        g.buyingPlace,
        g.nombre,
        g.empresa,
        g.email,
        g.telefono,
        g.domicilio,
        g.ciudad,
        g.provincia,
        g.pais,
        g.subscribe ? "Sí" : "No",
      ];
    }
    const n = l as NewsletterLead;
    return [fecha, n.email];
  });

  // escapeCsvCell previene tanto el quoting para caracteres especiales
  // de CSV como la inyección de fórmula (prefija `=+-@\t\r` con `'`).
  const body = [header, ...rows]
    .map((row) => row.map((v) => escapeCsvCell(v)).join(","))
    .join("\n");

  // BOM para que Excel abra con encoding UTF-8 correcto
  return "\ufeff" + body;
}
