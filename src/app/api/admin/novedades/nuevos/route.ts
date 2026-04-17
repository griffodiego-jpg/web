import { NextResponse } from "next/server";
import { setNuevosVehiculos } from "@/lib/novedades";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Define qué vehículos están marcados como "nuevos" para un código.
 * Body: { code: string, keys: string[] } donde keys son claves
 * "BRAND:MODELO" (ver vehicleKey en lib/novedades.ts).
 * Reemplaza el set completo — si keys = [], limpia todos.
 */
export async function POST(request: Request) {
  try {
    const { code, keys } = (await request.json()) as {
      code?: string;
      keys?: string[];
    };
    if (!code) {
      return NextResponse.json({ error: "Falta code" }, { status: 400 });
    }
    await setNuevosVehiculos(code, Array.isArray(keys) ? keys : []);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/novedades/nuevos] error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
