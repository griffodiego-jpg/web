import { NextResponse } from "next/server";

import { listCatalog } from "@/lib/api/specparts";
import { buildCoverageCsv, buildCoverageMatrix } from "@/lib/catalog/coverage";

export const runtime = "nodejs";

export async function GET() {
  try {
    const products = await listCatalog();
    const matrix = buildCoverageMatrix(products);
    const csv = buildCoverageCsv(matrix);

    const today = new Date().toISOString().slice(0, 10);
    const filename = `griffo-cobertura-${today}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
