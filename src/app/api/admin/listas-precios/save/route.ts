import { NextResponse } from "next/server";
import { savePriceList } from "@/lib/price-lists";
import type { PriceList } from "@/types/price-list";

/**
 * `POST /api/admin/listas-precios/save` — fallback idempotente tras el
 * upload. El cliente lo llama con los datos finales (incluyendo el size
 * real del blob) por si el webhook de Blob no alcanzó.
 */
export const dynamic = "force-dynamic";

interface Body {
  code?: unknown;
  name?: unknown;
  note?: unknown;
  fileUrl?: unknown;
  filename?: unknown;
  sizeBytes?: unknown;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const code = String(body.code ?? "").trim().toUpperCase();
  const name = String(body.name ?? "").trim();
  const fileUrl = String(body.fileUrl ?? "").trim();
  const filename = String(body.filename ?? "lista-precios.xlsx").trim();
  const sizeBytes = Number(body.sizeBytes ?? 0) || 0;
  const note = body.note ? String(body.note).trim() : undefined;

  if (!code) return NextResponse.json({ error: "Falta code" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Falta name" }, { status: 400 });
  if (!fileUrl.startsWith("https://")) {
    return NextResponse.json({ error: "fileUrl inválido" }, { status: 400 });
  }

  const list: PriceList = {
    id: `${code}-${Date.now()}`,
    code,
    name,
    note,
    fileUrl,
    filename,
    sizeBytes,
    uploadedAt: new Date().toISOString(),
  };

  try {
    await savePriceList(list);
    return NextResponse.json({ ok: true, list });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
