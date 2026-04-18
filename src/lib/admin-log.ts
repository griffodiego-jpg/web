import { getRedis } from "@/lib/kv";

/**
 * Log de errores del admin en Redis.
 *
 * Se usa para que el dashboard muestre cuándo fallan servicios externos
 * (SpecParts, Redis, Blob, email). Los call sites críticos llaman a
 * `logAdminError` en sus catch blocks. Guardamos los últimos N en una
 * lista con LPUSH + LTRIM.
 */

const LIST_KEY = "admin:errors";
const MAX_ENTRIES = 100;

export type AdminErrorEntry = {
  ts: number;
  scope: string; // ej. "specparts", "redis", "blob", "resend", "novedades"
  message: string;
};

export async function logAdminError(scope: string, err: unknown): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    const message = err instanceof Error ? err.message : String(err);
    const entry: AdminErrorEntry = {
      ts: Date.now(),
      scope,
      message: message.slice(0, 500),
    };
    await redis.lpush(LIST_KEY, JSON.stringify(entry));
    await redis.ltrim(LIST_KEY, 0, MAX_ENTRIES - 1);
  } catch {
    // Swallow — si Redis falla no queremos cascada.
  }
}

export async function readAdminErrors(limit = 50): Promise<AdminErrorEntry[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const raw = await redis.lrange(LIST_KEY, 0, limit - 1);
    return raw
      .map((e) => {
        if (typeof e === "string") {
          try {
            return JSON.parse(e) as AdminErrorEntry;
          } catch {
            return null;
          }
        }
        return e as AdminErrorEntry;
      })
      .filter((x): x is AdminErrorEntry => x !== null);
  } catch {
    return [];
  }
}

export async function clearAdminErrors(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.del(LIST_KEY);
  } catch {
    // ignore
  }
}
