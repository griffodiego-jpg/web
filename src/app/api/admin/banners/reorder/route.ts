import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { reorderBanners } from "@/lib/banners-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Body: { ids: string[] } — el array representa el orden nuevo. */
export async function POST(request: Request) {
  try {
    const { ids } = (await request.json()) as { ids?: string[] };
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "Falta ids[]" }, { status: 400 });
    }
    await reorderBanners(ids);
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/banners/reorder] error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
