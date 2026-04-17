import { NextResponse } from "next/server";
import { despublicarNovedad } from "@/lib/novedades";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Despublica una novedad por código. */
export async function POST(request: Request) {
  try {
    const { code } = (await request.json()) as { code?: string };
    if (!code) {
      return NextResponse.json({ error: "Falta code" }, { status: 400 });
    }
    await despublicarNovedad(code);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/novedades/despublicar] error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
