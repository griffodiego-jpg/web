import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (antes "middleware") — Next.js 16 renombró el file convention
 * de `middleware.ts` a `proxy.ts`. Comportamiento idéntico.
 *
 * Guard de /admin/* y /api/admin/*.
 *
 * Valida la cookie contra Redis (sesiones reales, revocables). Si no
 * hay cookie válida:
 *   - Para páginas HTML: redirect a /admin/login?from=...
 *   - Para APIs: 401 JSON (un cliente esperando JSON parseando el HTML
 *     del login rompe todo silenciosamente).
 *
 * Corre en Edge Runtime — por eso usamos @upstash/redis (HTTP REST),
 * no `crypto` de Node.
 */

const COOKIE_NAME = "griffo-admin-session";
const SESSION_KEY_PREFIX = "admin:session:";

/**
 * Rutas exentas del guard.
 *
 * - /admin/login y /api/admin/login: la pantalla y endpoint de login.
 * - /api/admin/descargas/upload: recibe webhooks firmados desde Vercel
 *   Blob sin cookie. handleUpload verifica la signature internamente.
 */
const EXEMPT_PATHS = [
  "/admin/login",
  "/api/admin/login",
  "/api/admin/descargas/upload",
  "/api/admin/banners/upload",
];

function isExempt(pathname: string): boolean {
  return EXEMPT_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function getRedisEdge(): Redis | null {
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isExempt(pathname)) {
    return NextResponse.next();
  }

  const sessionId = request.cookies.get(COOKIE_NAME)?.value;
  if (!sessionId) return rejectRequest(request, pathname);

  const redis = getRedisEdge();
  if (!redis) {
    // Sin Redis no hay forma de validar. Cortamos sí o sí.
    return rejectRequest(request, pathname);
  }

  try {
    const session = await redis.get(SESSION_KEY_PREFIX + sessionId);
    if (!session) return rejectRequest(request, pathname);
  } catch {
    return rejectRequest(request, pathname);
  }

  return NextResponse.next();
}

function rejectRequest(request: NextRequest, from: string) {
  if (from.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", from);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
