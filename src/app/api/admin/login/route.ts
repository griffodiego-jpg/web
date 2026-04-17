import { NextResponse } from "next/server";
import { createSession, verifyPasswordSafe } from "@/lib/admin-auth";
import { getRedis } from "@/lib/kv";

export const runtime = "nodejs";

/**
 * Endpoint de login del admin con rate limiting por IP.
 *
 * Permite hasta MAX_ATTEMPTS intentos por ventana de WINDOW_SECONDS.
 * Si se excede, devuelve 429 y bloquea la IP hasta que expire la ventana.
 * Esto corta brute-force contra la contraseña de admin.
 */

const WINDOW_SECONDS = 60;
const MAX_ATTEMPTS = 5;

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Incrementa el contador de intentos y devuelve si el request debe
 * permitirse. Si Redis no está disponible, deja pasar (fail-open) —
 * preferimos poder loguear sin Redis a quedar locked-out.
 */
async function rateLimit(
  ip: string
): Promise<{ ok: boolean; remaining: number }> {
  const redis = getRedis();
  if (!redis) return { ok: true, remaining: MAX_ATTEMPTS };
  const key = `ratelimit:admin-login:${ip}`;
  try {
    const count = (await redis.incr(key)) as number;
    if (count === 1) await redis.expire(key, WINDOW_SECONDS);
    const remaining = Math.max(0, MAX_ATTEMPTS - count);
    return { ok: count <= MAX_ATTEMPTS, remaining };
  } catch (e) {
    console.error("[admin/login] rate-limit error:", e);
    return { ok: true, remaining: MAX_ATTEMPTS };
  }
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const rl = await rateLimit(ip);
    if (!rl.ok) {
      return NextResponse.json(
        {
          error:
            "Demasiados intentos fallidos. Esperá 1 minuto y volvé a probar.",
        },
        { status: 429 }
      );
    }

    const { password } = (await request.json()) as { password?: string };

    if (!password || !(await verifyPasswordSafe(password))) {
      return NextResponse.json(
        {
          error: "Contraseña incorrecta",
          remaining: rl.remaining,
        },
        { status: 401 }
      );
    }

    await createSession({
      userAgent: request.headers.get("user-agent") ?? undefined,
      ip,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/login] error:", e);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
