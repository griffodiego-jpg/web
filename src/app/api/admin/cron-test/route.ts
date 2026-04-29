import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

/**
 * "Probar crons" — endpoint admin que dispara los 3 cron jobs server-
 * to-server con el `CRON_SECRET` del env, y devuelve un resumen del
 * status de cada uno. Sirve para verificar que:
 *
 *   - La env var está seteada en el deploy actual.
 *   - El auth header del cron funciona.
 *   - El job en sí no está roto end-to-end.
 *
 * Reemplaza tener que andar con curl + el secret a mano.
 *
 * Protegido por el proxy admin estándar — sólo el admin logueado
 * puede llamarlo. Internamente usa el mismo CRON_SECRET que Vercel
 * cron usa, así replica el flow exacto.
 */

const CRON_PATHS = [
  { name: "Backup del catálogo", path: "/api/cron/catalog-backup" },
  { name: "Banco de imágenes", path: "/api/cron/banco-imagenes" },
  { name: "Email semanal de salud", path: "/api/cron/weekly-digest" },
];

type CronTestResult = {
  name: string;
  path: string;
  status: number;
  ok: boolean;
  body: unknown;
  durationMs: number;
};

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        error:
          "CRON_SECRET no configurado en este deploy. Cargalo en Vercel → Settings → Environment Variables y redeployá.",
      },
      { status: 503 },
    );
  }

  // Origen del deploy actual — request.url incluye host + protocolo.
  const origin = new URL(request.url).origin;

  const results: CronTestResult[] = await Promise.all(
    CRON_PATHS.map(async ({ name, path }) => {
      const start = Date.now();
      try {
        const res = await fetch(`${origin}${path}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${secret}` },
          // No queremos cache acá — cada test es fresh.
          cache: "no-store",
        });
        const text = await res.text();
        let body: unknown = text;
        try {
          body = JSON.parse(text);
        } catch {
          // Dejamos como string si no parsea.
        }
        return {
          name,
          path,
          status: res.status,
          ok: res.ok,
          body,
          durationMs: Date.now() - start,
        };
      } catch (err) {
        return {
          name,
          path,
          status: 0,
          ok: false,
          body: { error: err instanceof Error ? err.message : String(err) },
          durationMs: Date.now() - start,
        };
      }
    }),
  );

  return NextResponse.json({ results });
}
