"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { CatalogSnapshot } from "@/lib/catalog-backup";

type Props = {
  initialSnapshots: CatalogSnapshot[];
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(isoDate: string): string {
  // isoDate vino como YYYY-MM-DD.
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CatalogBackupAdmin({ initialSnapshots }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // "Probar crons" — dispara los 3 cron jobs con el secret real, vía
  // un endpoint admin que hace la llamada server-side.
  type CronResult = {
    name: string;
    path: string;
    status: number;
    ok: boolean;
    body: unknown;
    durationMs: number;
  };
  const [cronTesting, setCronTesting] = useState(false);
  const [cronErr, setCronErr] = useState<string | null>(null);
  const [cronResults, setCronResults] = useState<CronResult[] | null>(null);

  const latest = initialSnapshots[0] ?? null;
  const olderSnapshots = initialSnapshots.slice(1);

  async function handleRegenerate() {
    if (loading) return;
    if (
      !confirm(
        "Se va a bajar todo el catálogo de SpecParts y generar un snapshot nuevo (~10-20 seg). ¿Continuamos?",
      )
    ) {
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/catalog-backup/regenerar", {
        method: "POST",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  async function handleCronTest() {
    if (cronTesting) return;
    setCronTesting(true);
    setCronErr(null);
    setCronResults(null);
    try {
      const res = await fetch("/api/admin/cron-test", { method: "POST" });
      const data = (await res.json().catch(() => null)) as
        | { results?: CronResult[]; error?: string }
        | null;
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      setCronResults(data?.results ?? []);
    } catch (e) {
      setCronErr(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setCronTesting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* --- Snapshot más reciente --- */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-accent">
              Último backup
            </h2>
            {latest ? (
              <>
                <p className="mt-1 text-lg font-black text-[#0a2b3d]">
                  {formatDate(latest.date)}
                </p>
                <p className="text-xs text-gray-500">
                  Generado: {formatDateTime(latest.generatedAt)} · {latest.productCount}{" "}
                  productos
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm italic text-gray-500">
                Todavía no hay ningún backup generado. Apretá "Regenerar ahora" para
                crear el primero.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleRegenerate}
            disabled={loading}
            className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? "Regenerando..." : "Regenerar ahora"}
          </button>
        </div>

        {err ? (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{err}</p>
        ) : null}

        {latest ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={latest.xlsxUrl}
              download
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-[#0a2b3d] transition hover:border-primary"
            >
              📊 Descargar Excel ({formatBytes(latest.xlsxBytes)})
            </a>
            <a
              href={latest.jsonUrl}
              download
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-[#0a2b3d] transition hover:border-primary"
            >
              {} Descargar JSON ({formatBytes(latest.jsonBytes)})
            </a>
          </div>
        ) : null}
      </section>

      {/* --- Historial --- */}
      {olderSnapshots.length > 0 ? (
        <section className="rounded-xl border border-gray-200 bg-white">
          <header className="border-b border-gray-100 px-5 py-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">
              Historial ({olderSnapshots.length})
            </h2>
            <p className="text-xs text-gray-500">
              Se conservan los últimos 30 snapshots. Los más viejos se borran
              automáticamente cuando entran nuevos.
            </p>
          </header>
          <ul className="divide-y divide-gray-100">
            {olderSnapshots.map((s) => (
              <li
                key={s.date}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <div>
                  <span className="font-bold text-[#0a2b3d]">{formatDate(s.date)}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {s.productCount} productos
                  </span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={s.xlsxUrl}
                    download
                    className="text-xs font-bold text-accent hover:text-primary-dark"
                  >
                    Excel ({formatBytes(s.xlsxBytes)})
                  </a>
                  <span className="text-gray-300">·</span>
                  <a
                    href={s.jsonUrl}
                    download
                    className="text-xs font-bold text-accent hover:text-primary-dark"
                  >
                    JSON ({formatBytes(s.jsonBytes)})
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* --- Probar crons --- */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">
              Probar crons
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Dispara los 3 jobs automáticos (backup catálogo, banco de
              imágenes, email semanal de salud) con el CRON_SECRET real para
              verificar que el deploy actual los ejecuta correctamente.
              Equivalente a esperar al horario del cron — pero ahora.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCronTest}
            disabled={cronTesting}
            className="shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-[#0a2b3d] transition hover:border-primary disabled:opacity-60"
          >
            {cronTesting ? "Probando..." : "Probar ahora"}
          </button>
        </div>

        {cronErr ? (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
            {cronErr}
          </p>
        ) : null}

        {cronResults ? (
          <ul className="mt-4 space-y-2 text-sm">
            {cronResults.map((r) => (
              <li
                key={r.path}
                className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={[
                        "inline-block h-2.5 w-2.5 rounded-full",
                        r.ok
                          ? "bg-emerald-500"
                          : r.status === 503 || r.status === 401
                            ? "bg-amber-500"
                            : "bg-red-500",
                      ].join(" ")}
                      aria-hidden
                    />
                    <span className="font-bold text-[#0a2b3d]">{r.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    HTTP {r.status} · {r.durationMs} ms
                  </div>
                </div>
                <pre className="mt-1.5 overflow-x-auto text-[11px] text-gray-600">
                  {typeof r.body === "string"
                    ? r.body.slice(0, 400)
                    : JSON.stringify(r.body, null, 2).slice(0, 600)}
                </pre>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
