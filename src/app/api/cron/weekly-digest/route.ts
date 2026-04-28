import { NextResponse } from "next/server";

import { sendWeeklyDigest } from "@/lib/health-digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron semanal que manda el email de salud del sitio. Schedule en
 * `vercel.json` → `0 12 * * 0` (todos los domingos a las 12 AM UTC =
 * 9 AM Argentina).
 *
 * Vercel Cron invoca este endpoint con `Authorization: Bearer
 * <CRON_SECRET>`. Fail-closed si la env var no está — preferimos no
 * mandar el digest a que cualquiera lo dispare.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/weekly-digest] CRON_SECRET no configurado");
    return NextResponse.json(
      { error: "CRON_SECRET no configurado" },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const result = await sendWeeklyDigest();
    if (!result.ok) {
      // No tiramos 500 para que Vercel no marque el cron como failed
      // si lo único que falló fue el send (la summary igual se generó).
      return NextResponse.json(
        {
          ok: false,
          recipient: result.recipient,
          error: result.errorMessage,
        },
        { status: 200 },
      );
    }
    return NextResponse.json({
      ok: true,
      recipient: result.recipient,
      stats: {
        leads: result.summary.leadsCounts.reduce((a, l) => a + l.count, 0),
        alerts: result.summary.alerts.length,
        errors: result.summary.totalErrors,
        snapshotsMissing: result.summary.snapshotsMissing,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
