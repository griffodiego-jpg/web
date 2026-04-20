import { NextResponse } from "next/server";

import { loadClientByCode } from "@/lib/b2b/client-loader";
import {
  clearImpersonation,
  setImpersonatedCode,
} from "@/lib/b2b/impersonation";

export const runtime = "nodejs";

/**
 * Inicia una sesión de impersonación. Body: { code }. El proxy ya
 * garantiza que solo el admin llega acá. Devuelve los datos del
 * cliente para que el frontend seedee localStorage y el header del
 * sitio reaccione.
 */
export async function POST(req: Request) {
  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const code = String(body.code ?? "").trim();
  if (!code) {
    return NextResponse.json({ error: "Falta código" }, { status: 400 });
  }
  const client = await loadClientByCode(code);
  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }
  await setImpersonatedCode(code);
  return NextResponse.json({
    ok: true,
    client: {
      client_id: client.client_id,
      name: client.name,
      email: client.email,
    },
  });
}

/** Termina la sesión de impersonación. */
export async function DELETE() {
  await clearImpersonation();
  return NextResponse.json({ ok: true });
}
