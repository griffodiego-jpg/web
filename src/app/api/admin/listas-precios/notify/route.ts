import { NextResponse } from "next/server";
import { getPriceList } from "@/lib/price-lists";
import { loadAllClients } from "@/lib/b2b/client-loader";
import { sendNewPriceListEmails } from "@/lib/emails/price-lists";

/**
 * `POST /api/admin/listas-precios/notify` — body `{ code }`. Manda mail
 * a todos los clientes cuyo priceListCode coincida con el code.
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { code?: unknown };
  try {
    body = (await req.json()) as { code?: unknown };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const code = String(body.code ?? "").trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Falta code" }, { status: 400 });

  const list = await getPriceList(code);
  if (!list) {
    return NextResponse.json(
      { error: `No hay lista cargada con código ${code}` },
      { status: 404 },
    );
  }

  const { clients } = await loadAllClients();
  const result = await sendNewPriceListEmails(list, clients);
  return NextResponse.json({ ok: true, ...result, total: clients.length });
}
