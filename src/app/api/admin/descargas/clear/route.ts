import { NextResponse } from "next/server";
import { clearOverride, type DescargaSlot } from "@/lib/descargas-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Borra el override en Redis para un slot específico. El archivo en
 * Blob queda huérfano (no pasa nada, no estorba). La próxima vez que
 * el sitio lea ese slot, va a caer al default estático de
 * `src/data/descargas.ts`.
 */
export async function POST(request: Request) {
  try {
    const { slot } = (await request.json()) as { slot: DescargaSlot };
    if (!slot) {
      return NextResponse.json({ error: "Falta slot" }, { status: 400 });
    }
    await clearOverride(slot);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/descargas/clear] error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
