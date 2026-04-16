import { NextResponse } from "next/server";
import { verifyPassword, setAdminCookie } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { password } = (await request.json()) as { password?: string };

    if (!password || !verifyPassword(password)) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    await setAdminCookie();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
