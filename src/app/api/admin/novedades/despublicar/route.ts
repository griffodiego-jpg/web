import { NextResponse } from "next/server";
import { hideNovedad, unhideNovedad } from "@/lib/novedades";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Oculta o muestra una novedad en el feed público. Con la auto-
 * detección desde SpecParts, "despublicar" = ocultar (la novedad
 * sigue existiendo en el catálogo, solo no aparece en /novedades).
 */
export async function POST(request: Request) {
  try {
    const { code, action } = (await request.json()) as {
      code?: string;
      action?: "hide" | "unhide";
    };
    if (!code) {
      return NextResponse.json({ error: "Falta code" }, { status: 400 });
    }
    if (action === "unhide") {
      await unhideNovedad(code);
    } else {
      await hideNovedad(code);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/novedades/despublicar] error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
