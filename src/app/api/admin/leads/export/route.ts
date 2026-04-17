import { NextResponse } from "next/server";
import {
  listLeads,
  type ContactoLead,
  type DescargaLead,
  type Lead,
  type LeadKind,
  type NewsletterLead,
} from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const kindParam = url.searchParams.get("kind") as LeadKind | null;
  const kind: LeadKind =
    kindParam === "contacto" || kindParam === "newsletter" ? kindParam : "descarga";

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
    const n = l as NewsletterLead;
    return [fecha, n.email];
  });

  const escape = (val: string) => {
    if (/[",\n\r]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
    return val;
  };

  const body = [header, ...rows]
    .map((row) => row.map((v) => escape(String(v))).join(","))
    .join("\n");

  // BOM para que Excel abra con encoding UTF-8 correcto
  return "\ufeff" + body;
}
