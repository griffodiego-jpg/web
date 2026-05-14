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
 * - /api/admin/debug-password: diagnóstico temporal de ADMIN_PASSWORD.
 */
const EXEMPT_PATHS = [
  "/admin/login",
  "/api/admin/login",
  "/api/admin/descargas/upload",
  "/api/admin/banners/upload",
  "/api/admin/debug-password",
];

function isExempt(pathname: string): boolean {
  return EXEMPT_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo aplica a rutas /admin/* y /api/admin/*
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  if (isExempt(pathname)) {
    return NextResponse.next();
  }

  const sessionId = request.cookies.get(COOKIE_NAME)?.value;

  if (!sessionId) {
    return unauthorized(request, pathname);
  }

  // Validar sesión en Redis
  const redisUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    // Redis no configurado → fail-open para no lockear al admin en dev
    return NextResponse.next();
  }

  try {
    const redis = new Redis({ url: redisUrl, token: redisToken });
    const session = await redis.get(SESSION_KEY_PREFIX + sessionId);
    if (!session) {
      return unauthorized(request, pathname);
    }
  } catch {
    // Redis caído → fail-open
    return NextResponse.next();
  }

  return NextResponse.next();
}

function unauthorized(request: NextRequest, pathname: string): NextResponse {
  const isApi = pathname.startsWith("/api/");
  if (isApi) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl, 307);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
