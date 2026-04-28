import { NextResponse } from "next/server";

import { loadAllClients } from "@/lib/b2b/client-loader";
import { verifyClientPassword } from "@/lib/b2b/credentials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Login del portal B2B. Busca el cliente por email (case-insensitive),
 * valida la contraseña contra el override Redis o el default (GRIFFO +
 * CUIT). Si matchea, devuelve los datos mínimos del cliente para que
 * el frontend seedee la sesión.
 *
 * Cuando Firebase Auth esté conectado, este endpoint se retira: el
 * login es contra Firebase y el cliente viene del claim.
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
