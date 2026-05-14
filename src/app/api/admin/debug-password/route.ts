import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Endpoint temporal de diagnóstico — solo muestra metadata de ADMIN_PASSWORD,
// nunca el valor. Borrar después de resolver el problema de login.
export async function GET() {
  const raw = process.env.ADMIN_PASSWORD;
  const trimmed = raw?.trim();
  return NextResponse.json({
    isSet: !!raw,
    rawLength: raw?.length ?? 0,
    trimmedLength: trimmed?.length ?? 0,
    firstChar: trimmed ? trimmed[0] : null,
    lastChar: trimmed ? trimmed[trimmed.length - 1] : null,
  });
}
