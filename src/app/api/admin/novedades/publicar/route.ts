import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getProductByCode } from "@/lib/api/specparts";
import { setTipo, type TipoNovedad } from "@/lib/novedades";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Override de tipo para una novedad. Se usa principalmente para marcar
 * algunos códigos como "Lanzamiento" — el resto queda como "Nueva
 * aplicación" por default sin necesidad de tocar nada.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      code?: string;
      tipo?: TipoNovedad;
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
        { error: `No existe el código "${body.code}" en SpecParts` },
        { status: 404 }
      );
    }

    await setTipo(product.code, body.tipo);
    // Refrescamos las páginas públicas que muestran la novedad para que
    // el ISR refleje el cambio inmediatamente.
    revalidatePath("/novedades");
    revalidatePath("/novedades/lanzamientos");
    revalidatePath("/novedades/aplicaciones");
    revalidatePath(`/novedades/${encodeURIComponent(product.code)}`);
    return NextResponse.json({ ok: true, code: product.code });
  } catch (e) {
    console.error("[admin/novedades/publicar] error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
