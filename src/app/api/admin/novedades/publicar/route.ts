import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getProductByCode } from "@/lib/api/specparts";
import {
  clearFecha,
  setFecha,
  setTipo,
  type TipoNovedad,
} from "@/lib/novedades";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Override de tipo (y opcionalmente fecha) para una novedad.
 *
 * Body:
 *   - code: string (requerido)
 *   - tipo: "lanzamiento" | "aplicacion" (requerido)
 *   - fecha: "YYYY-MM" (opcional) — si viene, setea el override de fecha.
 *     Si viene string vacío explícito, borra el override existente.
 *     Si no viene la prop → no toca la fecha.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      code?: string;
      tipo?: TipoNovedad;
      fecha?: string;
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

    if (typeof body.fecha === "string") {
      if (body.fecha === "") {
        await clearFecha(product.code);
      } else if (/^\d{4}-\d{2}$/.test(body.fecha)) {
        await setFecha(product.code, body.fecha);
      } else {
        return NextResponse.json(
          { error: "Fecha inválida (formato YYYY-MM)" },
          { status: 400 }
        );
      }
    }

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
