import { cookies } from "next/headers";
import { getRedis } from "@/lib/kv";

/**
 * Auth del admin con sesiones reales en Redis.
 *
 * Modelo:
 *   - Cookie `griffo-admin-session`: contiene un session ID aleatorio
 *     de 32 bytes hex (no deriva del password).
 *   - Redis key `admin:session:<id>`: metadata de la sesión con TTL.
 *   - Logout: borra la entry en Redis → el cookie queda inútil aunque
 *     se lo roben.
 *
 * Ventajas sobre el esquema anterior (hash(SALT + password) en cookie):
 *   - Cookie robada se puede revocar sin cambiar el password.
 *   - Cada sesión tiene su propio ID, trazable.
 *   - Sin salt hardcodeado en el código.
 */

export const ADMIN_COOKIE_NAME = "griffo-admin-session";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
export const SESSION_KEY_PREFIX = "admin:session:";

/**
 * Compara el password ingresado con la env var en tiempo constante
 * para evitar side-channels de timing. Hace trim() en ambos lados
 * para tolerar espacios/newlines que pueda agregar el copy-paste.
 * Si las longitudes difieren, hacemos igual una comparación dummy.
 */
export async function verifyPasswordSafe(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return false;
  const { timingSafeEqual } = await import("crypto");
  const a = Buffer.from(password.trim(), "utf-8");
  const b = Buffer.from(expected, "utf-8");
  if (a.length !== b.length) {
    // Dummy compare para no leakear la longitud del password esperado.
    timingSafeEqual(Buffer.alloc(32), Buffer.alloc(32));
    return false;
  }
  return timingSafeEqual(a, b);
}

/**
 * Crea una nueva sesión: genera un session ID random, lo persiste
 * en Redis con TTL, y setea el cookie httpOnly.
 */
export async function createSession(meta?: {
  userAgent?: string;
  ip?: string;
}): Promise<string> {
  const redis = getRedis();
  if (!redis) {
    throw new Error(
      "Upstash Redis no configurado — imposible crear sesión de admin."
    );
  }

  const { randomBytes } = await import("crypto");
  const sessionId = randomBytes(32).toString("hex");

  await redis.set(
    SESSION_KEY_PREFIX + sessionId,
    JSON.stringify({
      createdAt: Date.now(),
      userAgent: meta?.userAgent,
      ip: meta?.ip,
    }),
    { ex: SESSION_TTL_SECONDS }
  );

  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return sessionId;
}

/** Borra la sesión actual (Redis + cookie). No-op si no hay sesión. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const sessionId = store.get(ADMIN_COOKIE_NAME)?.value;
  if (sessionId) {
    const redis = getRedis();
    if (redis) {
      try {
        await redis.del(SESSION_KEY_PREFIX + sessionId);
      } catch (e) {
        console.error("[admin-auth] error borrando sesión en Redis:", e);
      }
    }
  }
  store.delete(ADMIN_COOKIE_NAME);
}

/**
 * Valida que haya una sesión de admin activa. Devuelve true si la
 * cookie existe y matchea una key viva en Redis; false en cualquier
 * otro caso (sin cookie, Redis caído, sesión revocada).
 *
 * Defensa en profundidad: la usa el layout (protected) de admin para
 * no depender exclusivamente del proxy, que puede saltearse en
 * prefetches o con cache de CDN.
 */
export async function hasValidAdminSession(): Promise<boolean> {
  const store = await cookies();
  const sessionId = store.get(ADMIN_COOKIE_NAME)?.value;
  if (!sessionId) return false;
  const redis = getRedis();
  if (!redis) return false;
  try {
    const session = await redis.get(SESSION_KEY_PREFIX + sessionId);
    return !!session;
  } catch {
    return false;
  }
}
