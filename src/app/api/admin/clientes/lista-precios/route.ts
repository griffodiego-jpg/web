import { NextResponse } from "next/server";

import { loadClientByCode } from "@/lib/b2b/client-loader";
import {
  clearPriceListOverride,
  setPriceListOverride,
} from "@/lib/b2b/price-list-overrides";

export const runtime = "nodejs";

/**
 * Asigna el código de lista de precios a un cliente. Body:
 * `{ code, priceListCode }`. Si `priceListCode` viene vacío, borra
 * el override (el cliente queda sin lista asignada). Protegido por
 * el proxy admin.
 */
export async function POST(req: Request) {
  let body: { code?: string; priceListCode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const code = String(body.code ?? "").trim();
  const priceListCode = String(body.priceListCode ?? "").trim();
  if (!code) {
    return NextResponse.json(
      { error: "Falta código de cliente" },
      { status: 400 },
    );
  }
  const client = await loadClientByCode(code);
  if (!client) {
    return NextResponse.json(
      { error: "Cliente no encontrado" },
      { status: 404 },
    );
  }
  try {
    if (!priceListCode) {
      await clearPriceListOverride(code);
      return NextResponse.json({ ok: true, priceListCode: null });
    }
    await setPriceListOverride(code, priceListCode);
    return NextResponse.json({
      ok: true,
      priceListCode: priceListCode.trim().toUpperCase(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
