import { NextResponse } from "next/server";

import {
  deleteZeroResultEntry,
  markResolved,
  unmarkResolved,
} from "@/lib/search-log";

export const runtime = "nodejs";

/**
 * Acciones del admin sobre el log de búsquedas con cero resultados.
 *
 * Body: { action: "resolve" | "unresolve" | "delete", query: string }
 *
 * Auth: protegido por el proxy de admin (sesión en cookie + Redis).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: unknown;
      query?: unknown;
    };

    const action = String(body.action ?? "");
    const query = typeof body.query === "string" ? body.query : "";

    if (!query) {
      return NextResponse.json(
        { error: "Falta query" },
        { status: 400 },
      );
    }

    switch (action) {
      case "resolve":
        await markResolved(query);
        break;
      case "unresolve":
        await unmarkResolved(query);
        break;
      case "delete":
        await deleteZeroResultEntry(query);
        break;
      default:
        return NextResponse.json(
          { error: "action inválida" },
          { status: 400 },
        );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 },
    );
  }
}
