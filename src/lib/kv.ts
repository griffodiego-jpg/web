import { Redis } from "@upstash/redis";

/**
 * Cliente de Upstash Redis (vercel KV) lazy-inicializado.
 *
 * Acepta tanto las env vars de Vercel KV (KV_REST_API_URL/TOKEN)
 * como las propias de Upstash (UPSTASH_REDIS_REST_URL/TOKEN), porque
 * según cómo se conectó el store aparecen con un nombre u el otro.
 *
 * Si faltan las env vars, devuelve null en vez de explotar — cada
 * consumidor decide qué hacer (ej. fallback a datos estáticos).
 */

let _redis: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;

  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    _redis = null;
    return null;
  }

  _redis = new Redis({ url, token });
  return _redis;
}

/** Throw si no hay Redis — para rutas que lo requieren. */
export function requireRedis(): Redis {
  const redis = getRedis();
  if (!redis) {
    throw new Error(
      "Upstash Redis no configurado (faltan KV_REST_API_URL / KV_REST_API_TOKEN)"
    );
  }
  return redis;
}
