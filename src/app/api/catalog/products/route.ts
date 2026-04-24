import { NextResponse } from "next/server";

import { listCatalog } from "@/lib/api/specparts";
import { stripProductsForClient } from "@/lib/catalog/utils";

export const runtime = "nodejs";
export const revalidate = 1800;

export async function GET() {
  try {
    const products = await listCatalog();
    return NextResponse.json(
      { total: products.length, products: stripProductsForClient(products) },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=1800, stale-while-revalidate=3600",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
