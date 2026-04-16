import { cookies } from "next/headers";

/**
 * Auth simple para el admin. Usa una contraseña única en env var
 * (ADMIN_PASSWORD) y un cookie httpOnly con un token hasheado.
 *
 * Usa Node.js `crypto` (compatible con API routes que corren en Node).
 * El middleware usa Web Crypto API (Edge). Ambos producen el mismo hash.
 */

const SALT = "griffo-admin-2026-salt";
const COOKIE_NAME = "griffo-admin-token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

async function hashToken(password: string): Promise<string> {
  // Usar createHash de Node.js (disponible en API routes / server actions)
  const { createHash } = await import("crypto");
  return createHash("sha256")
    .update(`${SALT}:${password}`)
    .digest("hex");
}

/** Setea el cookie de sesión del admin. */
export async function setAdminCookie(): Promise<void> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD env var no definida");
  const token = await hashToken(password);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/** Borra el cookie de sesión del admin. */
export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Verifica la contraseña contra la env var. */
export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return password === expected;
}
