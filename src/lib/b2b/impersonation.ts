/**
 * Impersonación de clientes B2B desde el admin.
 *
 * Uso: el admin toca "Loguear como" en `/admin/clientes` → la API graba
 * un cookie `griffo-impersonate-code` con el código del cliente. Todos
 * los server components del portal (`/cuenta/*`) leen ese cookie vía
 * `getCurrentClient()` y renderizan la info del cliente impersonado.
 *
 * El cookie es httpOnly (inviolable desde JS), pero un segundo cookie
 * público `griffo-impersonate-active` se setea para que el nav del
 * portal detecte la situación en cliente y muestre el banner "salir".
 *
 * Chequeos de autorización: los endpoints que inician/paran la
 * impersonación viven bajo `/api/admin/*` — el proxy ya verifica que
 * haya sesión de admin antes de dejarlos ejecutar.
 */

import "server-only";
import { cookies } from "next/headers";

export const IMPERSONATE_COOKIE = "griffo-impersonate-code";
export const IMPERSONATE_ACTIVE_COOKIE = "griffo-impersonate-active";
const TTL_SECONDS = 8 * 60 * 60;

export async function getImpersonatedCode(): Promise<string | null> {
  const c = await cookies();
  const v = c.get(IMPERSONATE_COOKIE)?.value;
  return v ? String(v) : null;
}

export async function setImpersonatedCode(clientCode: string): Promise<void> {
  const c = await cookies();
  c.set(IMPERSONATE_COOKIE, clientCode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
  c.set(IMPERSONATE_ACTIVE_COOKIE, "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function clearImpersonation(): Promise<void> {
  const c = await cookies();
  c.delete(IMPERSONATE_COOKIE);
  c.delete(IMPERSONATE_ACTIVE_COOKIE);
}
