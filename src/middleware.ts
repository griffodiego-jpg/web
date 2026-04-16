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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo proteger /admin/* (excepto /admin/login y /api/admin/login)
  if (
    !pathname.startsWith("/admin") ||
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/login")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const password = process.env.ADMIN_PASSWORD;

  if (!password || !token) {
    return redirectToLogin(request, pathname);
  }

  const expected = await hashToken(password);
  if (token !== expected) {
    return redirectToLogin(request, pathname);
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, from: string) {
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", from);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
