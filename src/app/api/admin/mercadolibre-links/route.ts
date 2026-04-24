import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { hasValidAdminSession } from "@/lib/admin-auth";
import {
  clearLinks,
  readLinks,
  saveLinks,
} from "@/lib/mercadolibre-links-store";

export const runtime = "nodejs";

/**
 * Invalida el cache ISR de las páginas del catálogo para que los
 * cambios en el mapa de links se vean inmediatamente después del
 * POST/DELETE. Sin esto, /catalogo y /catalogo/[slug] siguen
 * sirviendo el HTML prerendereado hasta que expire `revalidate`.
 */
function revalidateCatalog() {
  revalidatePath("/catalogo", "page");
  revalidatePath("/catalogo/[slug]", "page");
}

/**
 * GET → estado actual del mapa guardado (o null si nunca se subió).
 */
export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const data = await readLinks();
  return NextResponse.json({ data });
}

/**
 * POST → persiste un nuevo mapa código → link. Body:
 *   { productos: [{ codigo, link }] }
 */
export async function POST(req: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const productos = (body as { productos?: unknown })?.productos;
  if (!Array.isArray(productos)) {
    return NextResponse.json(
      { error: "Falta el array 'productos'" },
      { status: 400 },
    );
  }
  try {
    const saved = await saveLinks({
      productos: productos
        .filter(
          (p): p is { codigo: string; link: string | null } =>
            typeof p === "object" &&
            p !== null &&
            typeof (p as { codigo?: unknown }).codigo === "string",
        )
        .map((p) => ({
          codigo: p.codigo,
          link: typeof p.link === "string" ? p.link : null,
        })),
    });
    revalidateCatalog();
    return NextResponse.json({ data: saved });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al guardar" },
      { status: 500 },
    );
  }
}

/**
 * DELETE → limpia el mapa guardado.
 */
export async function DELETE() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  await clearLinks();
  revalidateCatalog();
  return NextResponse.json({ ok: true });
}
