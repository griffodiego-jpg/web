/**
 * Sesión real del cliente B2B — cookie httpOnly server-side + Redis.
 *
 * Modelo (mismo patrón que admin-auth, ver `src/lib/admin-auth.ts`):
 *   - Cookie `griffo-b2b-session`: session ID random hex de 32 bytes,
 *     httpOnly, secure (en prod), sameSite=lax.
 *   - Redis key `b2b:session:<id>` con TTL: guarda el client_id +
 *     metadata. La info detallada del cliente se resuelve al vuelo
 *     desde el ERP cada vez que el server lo necesita (los datos
 *     cambian — saldo, sucursales — y no queremos cachearlos en el
 *     cookie).
 *   - Logout: borra la entry en Redis → la cookie queda inútil aunque
 *     se la roben.
 *
 * El frontend (header, /carrito, etc) sigue leyendo de `useMockSession`
 * (localStorage) para feedback de UI inmediato. El localStorage se
 * actualiza al login/logout en sincronía con el cookie. La verdad
 * autoritativa es el cookie + Redis — nunca el localStorage.
 */

import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";

import { getRedis } from "@/lib/kv";

export const B2B_COOKIE_NAME = "griffo-b2b-session";
const SESSION_KEY_PREFIX = "b2b:session:";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

type SessionPayload = {
  clientId: string;
  email: string;
  createdAt: number;
};

/**
 * Crea sesión: genera ID random, persiste en Redis con TTL, setea cookie.
 * Devuelve el session ID por si el caller quiere loggearlo.
 */
export async function createB2bSession(args: {
  clientId: string;
  email: string;
}): Promise<string> {
  const redis = getRedis();
  if (!redis) {
    throw new Error("Redis no configurado — no se puede crear sesión B2B");
  }
  const sessionId = randomBytes(32).toString("hex");
  const payload: SessionPayload = {
    clientId: args.clientId,
    email: args.email,
    createdAt: Date.now(),
  };
  await redis.set(SESSION_KEY_PREFIX + sessionId, JSON.stringify(payload), {
    ex: SESSION_TTL_SECONDS,
  });
  const store = await cookies();
  store.set(B2B_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return sessionId;
}

/** Borra la sesión actual (Redis + cookie). No-op si no hay sesión. */
export async function destroyB2bSession(): Promise<void> {
  const store = await cookies();
  const sessionId = store.get(B2B_COOKIE_NAME)?.value;
  if (sessionId) {
    const redis = getRedis();
    if (redis) {
      try {
        await redis.del(SESSION_KEY_PREFIX + sessionId);
      } catch (e) {
        console.error("[b2b-session] error borrando en Redis:", e);
      }
    }
  }
  store.delete(B2B_COOKIE_NAME);
}

/**
 * Devuelve el client_id de la sesión activa, o null. Lee la cookie y
 * verifica contra Redis. Si la cookie existe pero la entry de Redis no
 * (sesión revocada), devuelve null.
 */
export async function getB2bSessionClientId(): Promise<string | null> {
  const store = await cookies();
  const sessionId = store.get(B2B_COOKIE_NAME)?.value;
  if (!sessionId) return null;
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<SessionPayload | string>(
      SESSION_KEY_PREFIX + sessionId,
    );
    if (!raw) return null;
    const session = typeof raw === "string" ? (JSON.parse(raw) as SessionPayload) : raw;
    return session.clientId ?? null;
  } catch {
    return null;
  }
}
