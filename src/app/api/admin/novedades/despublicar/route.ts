import { NextResponse } from "next/server";
import {
  clearTipoOverride,
  hideNovedad,
  unhideNovedad,
} from "@/lib/novedades";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Acciones sobre una novedad existente:
 *   - "unpublish": borra el override de tipo → la novedad deja de
 *     aparecer en /novedades.
 *   - "hide": la oculta (queda publicada pero no se muestra).
 *   - "unhide": la restaura.
 */
export async function POST(request: Request) {
  try {
    const { code, action } = (await request.json()) as {
      code?: string;
      action?: "hide" | "unhide" | "unpublish";
    };
    if (!code) {
      return NextResponse.json({ error: "Falta code" }, { status: 400 });
    }
    if (action === "unpublish") {
      await clearTipoOverride(code);
    } else if (action === "unhide") {
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
