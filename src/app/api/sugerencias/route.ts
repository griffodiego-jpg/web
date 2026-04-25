import { NextResponse } from "next/server";

import { saveLead, type SugerenciaLead } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recibe sugerencias de productos desde el banner del catálogo (cuando
 * el usuario no encuentra lo que busca). Persiste en Redis con kind
 * `sugerencia`. No manda email para no inundar la casilla — se revisan
 * en lote desde /admin/leads → tab Sugerencias.
 *
 * Validación mínima: requiere `producto` no vacío y de longitud
 * razonable. El resto es opcional.
 */
export async function POST(request: Request) {
  let body: Partial<SugerenciaLead> & {
    producto?: string;
    marcaVehiculo?: string;
    modeloVehiculo?: string;
    anioVehiculo?: string;
    perfil?: string;
    contacto?: string;
    busqueda?: string;
    tab?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const producto = (body.producto ?? "").trim();
  if (producto.length < 3) {
    return NextResponse.json(
      { error: "Decinos qué producto buscás (mínimo 3 caracteres)." },
      { status: 400 },
    );
  }
  if (producto.length > 1000) {
    return NextResponse.json(
      { error: "El mensaje es muy largo (máx 1000 caracteres)." },
      { status: 400 },
    );
  }

  const VALID_PROFILES = ["mecanico", "taller", "particular", "distribuidor"];
  const perfil =
    body.perfil && VALID_PROFILES.includes(body.perfil)
      ? (body.perfil as SugerenciaLead["perfil"])
      : undefined;

  const lead: SugerenciaLead = {
    kind: "sugerencia",
    ts: Date.now(),
    producto,
    marcaVehiculo: body.marcaVehiculo?.trim() || undefined,
    modeloVehiculo: body.modeloVehiculo?.trim() || undefined,
    anioVehiculo: body.anioVehiculo?.trim() || undefined,
    perfil,
    contacto: body.contacto?.trim() || undefined,
    busqueda: body.busqueda?.trim() || undefined,
    tab: body.tab?.trim() || undefined,
  };

  await saveLead(lead);
  return NextResponse.json({ ok: true });
}
