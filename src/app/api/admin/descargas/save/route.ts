import { NextResponse } from "next/server";
import { setOverride, type DescargaSlot } from "@/lib/descargas-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Guarda una URL de Blob en Redis bajo la clave del slot.
 *
 * Se llama desde el cliente después de un upload() exitoso, como
 * fallback en caso de que el webhook `onUploadCompleted` no llegue
 * (típicamente en deploys con protección de preview).
 *
 * Es idempotente: `hset` sobreescribe el valor, no importa cuántas
 * veces se llame.
 */
export async function POST(request: Request) {
  try {
    const { slot, url } = (await request.json()) as {
      slot: DescargaSlot;
      url: string;
    };
    if (!slot || !url) {
      return NextResponse.json({ error: "Faltan params" }, { status: 400 });
    }
    await setOverride(slot, url);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/descargas/save] error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
