import { NextResponse } from "next/server";

import { loadClientByCode } from "@/lib/b2b/client-loader";
import {
  resetClientPassword,
  setClientPassword,
} from "@/lib/b2b/credentials";

export const runtime = "nodejs";

/**
 * Asigna un password custom al cliente. Body: { code, password }.
 * Longitud mínima 6. Protegido por el proxy admin.
 */
export async function POST(req: Request) {
  let body: { code?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const code = String(body.code ?? "").trim();
  const password = String(body.password ?? "");
  if (!code) {
    return NextResponse.json({ error: "Falta código de cliente" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres" },
      { status: 400 },
    );
  }
  const client = await loadClientByCode(code);
  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }
  try {
    await setClientPassword(code, password);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Borra el override → el cliente vuelve a la contraseña por defecto
 * (GRIFFO + CUIT). Body: { code }.
 */
export async function DELETE(req: Request) {
  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const code = String(body.code ?? "").trim();
  if (!code) {
    return NextResponse.json({ error: "Falta código de cliente" }, { status: 400 });
  }
  try {
    await resetClientPassword(code);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
