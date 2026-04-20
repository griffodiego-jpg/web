/**
 * Gestión de contraseñas de los clientes B2B. SERVER ONLY.
 *
 * Flujo:
 *   - Default: la contraseña es "GRIFFO<CUIT>" (sin guiones, upper) —
 *     se computa al vuelo a partir del cliente. No se guarda nada hasta
 *     que el admin la cambie explícitamente.
 *   - Override: si el admin cambia la contraseña, se guarda el hash
 *     (scrypt + salt) en Redis bajo `client:password:<client_id>`. A
 *     partir de ahí, el default deja de valer.
 *   - Reset: borra la key → vuelve a valer el default.
 *
 * Verificación: intenta contra el override si existe; si no, valida
 * contra el default. Siempre usa timingSafeEqual para comparar hashes.
 */

import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { getRedis } from "@/lib/kv";
import type { BejermanClient } from "@/types/bejerman";

const KEY_PREFIX = "client:password:";
const SCRYPT_KEYLEN = 32;

/**
 * Genera la contraseña por defecto del cliente — "GRIFFO" + CUIT sin
 * guiones, todo en mayúsculas. Si el cliente no tiene CUIT en la
 * respuesta del ERP, cae al client_id como sustituto (seguro pero
 * menos memorizable — habría que pedirle al proveedor que exponga CUIT).
 */
export function getDefaultPassword(client: BejermanClient): string {
  const raw = (client.cuit || client.client_id || "").replace(/[^0-9A-Za-z]/g, "");
  return `GRIFFO${raw}`.toUpperCase();
}

function redisKey(clientCode: string) {
  return `${KEY_PREFIX}${clientCode}`;
}

function hashPassword(plain: string, salt: string): string {
  const derived = scryptSync(plain, salt, SCRYPT_KEYLEN);
  return derived.toString("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Guarda un override de contraseña en Redis. El formato es
 * `<salt>$<hash>` — salt hex de 16 bytes, hash hex scrypt.
 */
export async function setClientPassword(
  clientCode: string,
  plainPassword: string,
): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  if (plainPassword.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }
  const salt = randomBytes(16).toString("hex");
  const hash = hashPassword(plainPassword, salt);
  await redis.set(redisKey(clientCode), `${salt}$${hash}`);
}

/**
 * Borra el override → el cliente vuelve a usar el default (GRIFFO+cuit).
 */
export async function resetClientPassword(clientCode: string): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  await redis.del(redisKey(clientCode));
}

/**
 * True si el cliente tiene un password personalizado (override guardado).
 * False si usa el default.
 */
export async function hasCustomPassword(clientCode: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  const val = await redis.get<string>(redisKey(clientCode));
  return !!val;
}

/**
 * Verifica una contraseña. Prueba primero el override, después el default.
 * Nunca revela cuál de los dos se usó — devuelve solo true/false.
 */
export async function verifyClientPassword(
  client: BejermanClient,
  attempt: string,
): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    const stored = await redis.get<string>(redisKey(client.client_id));
    if (stored && stored.includes("$")) {
      const [salt, hash] = stored.split("$");
      const candidate = hashPassword(attempt, salt);
      return safeEqual(candidate, hash);
    }
  }
  // Sin override → default.
  return attempt === getDefaultPassword(client);
}
