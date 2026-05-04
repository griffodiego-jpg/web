import "server-only";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Cookie httpOnly de sesión B2B. La setea `/api/b2b/login` cuando el
 * cliente se autentica. Sirve para validar server-side quién está
 * pidiendo qué (descarga de la lista de precios, ownership de pedidos
 * sin impersonación, etc.) — sin esta cookie cualquiera con el link
 * directo al Blob podría bajar la lista de cualquier cliente.
 *
 * Estructura: payload base64url + "." + HMAC-SHA256. Si Firebase Auth
 * empieza a vivir, este archivo se reemplaza por `getServerSession()`
 * de Firebase Admin — la API pública (`getB2BSession`) queda igual.
 */

const COOKIE_NAME = "griffo-b2b-session";
const TTL_SECONDS = 7 * 24 * 60 * 60;

function getSecret(): string {
  // En producción la variable correcta es B2B_SESSION_SECRET. Si no
  // está, caemos a ADMIN_PASSWORD (siempre existe en prod) — no es
  // óptimo pero evita que el portal quede roto en setups parciales.
  return (
    process.env.B2B_SESSION_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "griffo-b2b-dev-secret"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export interface B2BSessionPayload {
  clientId: string;
  email: string;
}

export async function setB2BSession(data: B2BSessionPayload): Promise<void> {
  const c = await cookies();
  const payload = JSON.stringify(data);
  const sig = sign(payload);
  const value =
    Buffer.from(payload, "utf8").toString("base64url") + "." + sig;
  c.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function getB2BSession(): Promise<B2BSessionPayload | null> {
  const c = await cookies();
  const raw = c.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const dot = raw.indexOf(".");
  if (dot < 0) return null;
  const payloadB64 = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expectedSig = sign(payload);
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expectedSig, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(payload) as B2BSessionPayload;
    if (!parsed.clientId || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function clearB2BSession(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}
