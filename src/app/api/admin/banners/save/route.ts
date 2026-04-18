import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { saveBanner, type BannerTipo } from "@/lib/banners-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Crea o actualiza un banner. Body:
 *   - id?: string — si existe, update; sino, create
 *   - tipo: "imagen" | "video" | "patente"
 *   - activo: boolean
 *   - fileUrl?, titulo?, subtitulo?, ctaText?, ctaHref?
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      tipo?: BannerTipo;
      activo?: boolean;
      fileUrl?: string;
      titulo?: string;
      subtitulo?: string;
      ctaText?: string;
      ctaHref?: string;
    };

    if (body.tipo && !["imagen", "video", "patente"].includes(body.tipo)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    // Para tipo imagen/video se requiere fileUrl (salvo en edits parciales).
    if (
      !body.id &&
      (body.tipo === "imagen" || body.tipo === "video") &&
      !body.fileUrl
    ) {
      return NextResponse.json(
        { error: "Falta el archivo para el banner" },
        { status: 400 }
      );
    }

    const banner = await saveBanner(body);
    revalidatePath("/");
    return NextResponse.json({ ok: true, banner });
  } catch (e) {
    console.error("[admin/banners/save] error:", e);
    const msg = e instanceof Error ? e.message : "Error al guardar";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
