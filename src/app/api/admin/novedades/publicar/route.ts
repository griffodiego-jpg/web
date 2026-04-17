import { NextResponse } from "next/server";
import { publicarNovedad, type TipoNovedad } from "@/lib/novedades";
import { getProductByCode } from "@/lib/api/specparts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Publica una novedad por código SKU.
 * Verifica contra SpecParts que el código exista antes de escribir
 * en Redis — evita que se publiquen códigos inventados.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      code?: string;
      tipo?: TipoNovedad;
      tituloOverride?: string;
      descripcionOverride?: string;
      fechaVisibleOverride?: string;
    };

    if (!body.code || !body.tipo) {
      return NextResponse.json(
        { error: "Faltan code y tipo" },
        { status: 400 }
      );
    }

    if (body.tipo !== "lanzamiento" && body.tipo !== "aplicacion") {
      return NextResponse.json(
        { error: "Tipo inválido (lanzamiento o aplicacion)" },
        { status: 400 }
      );
    }

    const product = await getProductByCode(body.code);
    if (!product) {
      return NextResponse.json(
        { error: `No existe un producto con código "${body.code}" en SpecParts` },
        { status: 404 }
      );
    }

    await publicarNovedad({
      code: product.code,
      tipo: body.tipo,
      publishedAt: Date.now(),
      tituloOverride: body.tituloOverride?.trim() || undefined,
      descripcionOverride: body.descripcionOverride?.trim() || undefined,
      fechaVisibleOverride: body.fechaVisibleOverride?.trim() || undefined,
    });

    return NextResponse.json({
      ok: true,
      code: product.code,
      titulo: product.product,
    });
  } catch (e) {
    console.error("[admin/novedades/publicar] error:", e);
    const msg = e instanceof Error ? e.message : "Error al publicar";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
