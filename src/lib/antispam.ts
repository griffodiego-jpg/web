/**
 * Antispam para formularios públicos. Dos capas livianas:
 *
 *   1. Honeypot: un campo oculto en el HTML que humanos nunca completan
 *      (display:none + tabindex=-1 + autocomplete=off). Bots ingenuos
 *      llenan TODOS los inputs visibles del DOM y caen acá.
 *      Nombre del campo: `website` (top-3 más usado por bots).
 *
 *   2. Rate limit por IP: counter Redis con TTL. Si la misma IP supera
 *      `max` envíos en `windowSec` segundos, rechazamos. Fail-open si
 *      Redis no responde — preferimos que el form ande a lockear a un
 *      usuario por una caída de Redis.
 *
 * Cuando llegue spam más sofisticado, sumamos Cloudflare Turnstile como
 * tercera capa.
 */

import { getRedis } from "@/lib/kv";

export const HONEYPOT_FIELD = "website";

/**
 * True si el honeypot fue llenado (= bot). Acepta tanto FormData como
 * un objeto plano (los endpoints leen de los dos formatos).
 */
export function isBot(
  data: FormData | Record<string, unknown>,
): boolean {
  let val: unknown;
  if (data instanceof FormData) {
    val = data.get(HONEYPOT_FIELD);
  } else {
    val = data[HONEYPOT_FIELD];
  }
  if (val == null) return false;
  return String(val).trim() !== "";
}

/**
 * Sacamos la IP del request. Vercel/Cloudflare la mandan en headers
 * estándar. En local el header no existe → "unknown".
 */
export function getClientIp(req: Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export type RateLimitResult = {
  allowed: boolean;
  /** Cuántos envíos quedan en la ventana actual. */
  remaining: number;
  /** Segundos hasta que se resetee el counter. */
  resetSec: number;
};

/**
 * Rate limit por IP usando Redis INCR + EXPIRE. Si Redis no está
 * disponible, devuelve allowed=true (fail-open) — el form sigue
 * funcionando.
 *
 * Default: 3 envíos cada 10 minutos. Para newsletter (donde el usuario
 * podría querer reintentar tras un error) lo dejamos un toque más
 * permisivo en el caller.
 */
export async function checkRateLimit(
  kind: string,
  ip: string,
  opts: { max?: number; windowSec?: number } = {},
): Promise<RateLimitResult> {
  const max = opts.max ?? 3;
  const windowSec = opts.windowSec ?? 600;
  const redis = getRedis();
  if (!redis) {
    return { allowed: true, remaining: max, resetSec: windowSec };
  }
  const key = `rl:${kind}:${ip}`;
  try {
    const count = (await redis.incr(key)) as number;
    if (count === 1) {
      // Primera request en la ventana → setear TTL.
      await redis.expire(key, windowSec);
    }
    const remaining = Math.max(0, max - count);
    let resetSec = windowSec;
    try {
      const ttl = (await redis.ttl(key)) as number;
      if (typeof ttl === "number" && ttl > 0) resetSec = ttl;
    } catch {
      /* ignore */
    }
    return { allowed: count <= max, remaining, resetSec };
  } catch (e) {
    console.error("[antispam] rate limit error:", e);
    return { allowed: true, remaining: max, resetSec: windowSec };
  }
}
