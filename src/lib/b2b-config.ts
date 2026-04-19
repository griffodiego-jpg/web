import { getRedis } from "@/lib/kv";

/**
 * Configuración editable del módulo B2B desde el admin. Hoy sólo maneja
 * el email al que se avisan los pedidos nuevos. Se guarda en Redis bajo
 * `b2b:config:<key>` y fallbacks en orden:
 *
 *   1. Valor guardado en Redis por el admin.
 *   2. Env var `GRIFFO_ADMIN_EMAIL`.
 *   3. Default: "ventas@griffo.com.ar".
 */

const KEY_NOTIF_EMAIL = "b2b:config:notif-email";

const DEFAULT_NOTIF_EMAIL = "ventas@griffo.com.ar";

export async function getPedidosNotificationEmail(): Promise<string> {
  const redis = getRedis();
  if (redis) {
    try {
      const stored = await redis.get<string>(KEY_NOTIF_EMAIL);
      if (stored && typeof stored === "string" && stored.includes("@")) {
        return stored.trim();
      }
    } catch {
      /* fallthrough */
    }
  }
  const env = process.env.GRIFFO_ADMIN_EMAIL;
  if (env && env.includes("@")) return env.trim();
  return DEFAULT_NOTIF_EMAIL;
}

export async function setPedidosNotificationEmail(email: string): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  const clean = email.trim();
  if (!clean.includes("@") || clean.length > 255) {
    throw new Error("Email inválido");
  }
  await redis.set(KEY_NOTIF_EMAIL, clean);
}
