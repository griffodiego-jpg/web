import { NextResponse } from "next/server";

import { loadAllClients } from "@/lib/b2b/client-loader";
import { verifyClientPassword } from "@/lib/b2b/credentials";
import { createB2bSession } from "@/lib/b2b/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Login del portal B2B. Busca el cliente por email (case-insensitive),
 * valida la contraseña contra el override Redis o el default (GRIFFO +
 * CUIT). Si matchea:
 *   1. Crea sesión real server-side (cookie httpOnly + Redis vía
 *      createB2bSession).
 *   2. Devuelve los datos del cliente para que el frontend seedee
 *      localStorage como UI hint (la fuente de verdad sigue siendo
 *      el cookie del paso 1).
 */
export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email y contraseña son obligatorios" },
      { status: 400 },
    );
  }

  const { clients } = await loadAllClients();
  const client = clients.find((c) => c.email.trim().toLowerCase() === email);
  if (!client) {
    return NextResponse.json(
      { error: "Email o contraseña inválidos" },
      { status: 401 },
    );
  }

  const ok = await verifyClientPassword(client, password);
  if (!ok) {
    return NextResponse.json(
      { error: "Email o contraseña inválidos" },
      { status: 401 },
    );
  }

  try {
    await createB2bSession({
      clientId: client.client_id,
      email: client.email,
    });
  } catch (e) {
    // Si Redis no está disponible no podemos crear la sesión segura.
    // Devolvemos error en vez de loguear sin auth real.
    console.error("[b2b/login] error creando sesión:", e);
    return NextResponse.json(
      { error: "Servicio de sesiones no disponible. Intentá en un momento." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    client: {
      client_id: client.client_id,
      name: client.name,
      email: client.email,
      warehouses: client.warehouses ?? [],
    },
  });
}
