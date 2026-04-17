import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware que protege las rutas /admin/* (excepto /admin/login).
 * Si no hay cookie de sesión válido, redirige a /admin/login.
 *
 * Usa Web Crypto API (crypto.subtle) en vez de Node.js crypto,
 * porque middleware corre en Edge Runtime.
 */

const SALT = "griffo-admin-2026-salt";
const COOKIE_NAME = "griffo-admin-token";

async function hashToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${SALT}:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Rutas exentas del guard de admin.
 *
 * - /admin/login: la pantalla de login, obvio.
 * - /api/admin/login: el endpoint que valida password y setea cookie.
 * - /api/admin/descargas/upload: recibe webhooks firmados desde Vercel
 *   Blob sin cookie — se auto-verifica por signature dentro del route.
 */
const EXEMPT_PATHS = [
  "/admin/login",
  "/api/admin/login",
  "/api/admin/descargas/upload",
];

function isExempt(pathname: string): boolean {
  return EXEMPT_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // El matcher ya restringe este middleware a /admin/:path* y
  // /api/admin/:path*, así que asumimos que cualquier path que llega
  // acá es protegido salvo los exentos.
  if (isExempt(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const password = process.env.ADMIN_PASSWORD;

  if (!password || !token) {
    return rejectRequest(request, pathname);
  }

  const expected = await hashToken(password);
  if (token !== expected) {
    return rejectRequest(request, pathname);
  }

  return NextResponse.next();
}

/**
 * Rechaza la request sin admin auth:
 * - Páginas HTML (/admin/*): redirect a /admin/login con `from=` del origen.
 * - APIs (/api/admin/*): devuelve 401 JSON — no redirigir APIs silenciosamente,
 *   un client esperando JSON parseando HTML de login rompe todo (y peor:
 *   permite mistakes de interpretación si el caller ignora el status).
 */
function rejectRequest(request: NextRequest, from: string) {
  if (from.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return redirectToLogin(request, from);
}

function redirectToLogin(request: NextRequest, from: string) {
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", from);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
