import { NextResponse } from "next/server";

import { identifyPlate } from "@/lib/api/specparts";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const plate = new URL(request.url).searchParams.get("plate")?.trim().toUpperCase();
  if (!plate) {
    return NextResponse.json({ error: "Falta patente" }, { status: 400 });
  }

  try {
    const data = await identifyPlate(plate);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
