import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { deleteBanner } from "@/lib/banners-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { id } = (await request.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }
    await deleteBanner(id);
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/banners/delete] error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
