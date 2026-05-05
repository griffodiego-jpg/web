import { NextResponse } from "next/server";

import { saveLead, type ReporteErrorLead } from "@/lib/leads";

export const runtime = "nodejs";

/**
 * Recibe reportes de error sobre un producto del catálogo. Disparado
 * desde el botón "¿Ves un error? Reportar" en `/catalogo/[slug]` y
 * `/productos/[slug]`.
 *
 * Body JSON:
 *   { productoCode, productoSlug?, productoUrl?, tipoError, detalle,
 *     email?, celular? }
 *
 * Persiste en Redis (lista `leads:reporte_error`). No manda email
 * para no inundar — se revisa en lote desde `/admin/leads → Reportes`.
 */

const VALID_TIPOS: ReporteErrorLead["tipoError"][] = [
  "foto",
  "vehiculos",
  "medidas",
  "descripcion",
  "otro",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const productoCode =
      typeof body.productoCode === "string" ? body.productoCode.trim() : "";
    const tipoErrorRaw =
      typeof body.tipoError === "string" ? body.tipoError : "";
    const detalle = typeof body.detalle === "string" ? body.detalle.trim() : "";

    if (!productoCode) {
      return NextResponse.json(
        { error: "Falta el código del producto" },
        { status: 400 },
      );
    }
    if (!detalle || detalle.length < 5) {
      return NextResponse.json(
        { error: "Contanos brevemente qué está mal (mínimo 5 caracteres)." },
        { status: 400 },
      );
    }
    if (detalle.length > 1500) {
      return NextResponse.json(
        { error: "El mensaje es muy largo (máx 1500 caracteres)." },
        { status: 400 },
      );
    }

    const tipoError = (
      VALID_TIPOS.includes(tipoErrorRaw as ReporteErrorLead["tipoError"])
        ? tipoErrorRaw
        : "otro"
    ) as ReporteErrorLead["tipoError"];

    const lead: ReporteErrorLead = {
      kind: "reporte_error",
      ts: Date.now(),
      productoCode: productoCode.slice(0, 100),
      productoSlug:
        typeof body.productoSlug === "string"
          ? body.productoSlug.slice(0, 200)
          : undefined,
      productoUrl:
        typeof body.productoUrl === "string"
          ? body.productoUrl.slice(0, 500)
          : undefined,
      tipoError,
      detalle,
      email:
        typeof body.email === "string" && body.email.trim()
          ? body.email.trim().slice(0, 200)
          : undefined,
      celular:
        typeof body.celular === "string" && body.celular.trim()
          ? body.celular.trim().slice(0, 50)
          : undefined,
    };

    await saveLead(lead);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 },
    );
  }
}
