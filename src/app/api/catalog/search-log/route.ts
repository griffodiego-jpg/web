import { NextResponse } from "next/server";

import { logZeroResultSearch, type SearchTab } from "@/lib/search-log";

export const runtime = "nodejs";

const VALID_TABS = new Set<SearchTab>([
  "palabra",
  "patente",
  "vehiculo",
  "codigo",
  "medidas",
]);

/**
 * Loguea una búsqueda con cero resultados en Redis para mostrarla
 * después en /admin/busquedas. No requiere auth — es público y
 * write-only desde el cliente.
 *
 * Body: { query: string, tab: SearchTab, resultsCount: number }
 *
 * Solo escribe si `resultsCount === 0` y la query tiene al menos
 * 2 chars normalizados. Si no, devuelve 200 sin hacer nada (para
 * que el cliente pueda llamarnos sin chequear condiciones).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: unknown;
      tab?: unknown;
      resultsCount?: unknown;
    };

    const query = typeof body.query === "string" ? body.query : "";
    const tab = typeof body.tab === "string" ? (body.tab as SearchTab) : null;
    const resultsCount =
      typeof body.resultsCount === "number" ? body.resultsCount : -1;

    if (!query || !tab || !VALID_TABS.has(tab)) {
      return NextResponse.json({ ok: true });
    }
    if (resultsCount !== 0) {
      return NextResponse.json({ ok: true });
    }

    await logZeroResultSearch({ query, tab });
    return NextResponse.json({ ok: true });
  } catch {
    // Tolerante a fallos: nunca rompemos el flujo del usuario.
    return NextResponse.json({ ok: true });
  }
}
