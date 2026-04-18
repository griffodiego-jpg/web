import { NextResponse } from "next/server";
import {
  clearImageOverride,
  type CatalogoImagenId,
} from "@/lib/catalogo-imagenes-store";

export const runtime = "nodejs";

/**
 * Borra el override de una imagen del catálogo. Vuelve al fallback
 * estático de /public si existe, sino la imagen queda sin definir.
 */
export async function POST(request: Request) {
  try {
    const { id } = (await request.json()) as { id?: CatalogoImagenId };
    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }
    await clearImageOverride(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
