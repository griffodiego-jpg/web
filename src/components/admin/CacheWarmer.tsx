"use client";

import { useState } from "react";

type Props = {
  /** URLs absolutas de las imágenes del catálogo (raw, sin pasar por /_next/image). */
  imageUrls: string[];
  /** Tamaños que pedimos a /_next/image. Se pre-calientan estos. */
  widths: number[];
};

type Progress = {
  done: number;
  total: number;
  errors: number;
};

const BATCH_SIZE = 8;

export function CacheWarmer({ imageUrls, widths }: Props) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [running, setRunning] = useState(false);
  const [finishedAt, setFinishedAt] = useState<Date | null>(null);

  const total = imageUrls.length * widths.length;

  const handleStart = async () => {
    if (running) return;
    setRunning(true);
    setFinishedAt(null);

    // Lista plana de todas las URLs optimizadas a pedir (una por cada tamaño).
    const calls: string[] = [];
    for (const src of imageUrls) {
      for (const w of widths) {
        calls.push(`/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`);
      }
    }

    let done = 0;
    let errors = 0;
    setProgress({ done, total: calls.length, errors });

    for (let i = 0; i < calls.length; i += BATCH_SIZE) {
      const batch = calls.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map((url) =>
          fetch(url, { method: "GET", cache: "force-cache" })
            .then((r) => r.ok)
            .catch(() => false),
        ),
      );
      for (const ok of results) {
        if (ok) done += 1;
        else errors += 1;
      }
      setProgress({ done, total: calls.length, errors });
    }

    setRunning(false);
    setFinishedAt(new Date());
  };

  const percent = progress
    ? Math.round((progress.done / Math.max(1, progress.total)) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-black uppercase tracking-widest text-[#0a2b3d]">
          Estado actual
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <Stat label="Imágenes únicas" value={String(imageUrls.length)} />
          <Stat label="Tamaños por imagen" value={String(widths.length)} />
          <Stat label="Transformaciones total" value={String(total)} />
          <Stat
            label="Tamaños"
            value={widths.map((w) => `${w}px`).join(" · ")}
            small
          />
        </dl>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-black uppercase tracking-widest text-[#0a2b3d]">
          Calentar cache
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Dispara una request a cada imagen en todos sus tamaños. Vercel
          procesa (AVIF/WebP) y las deja en cache del CDN. Después de correr
          esto, los usuarios reales entran al catálogo sin la ventana de
          primer-usuario-lento.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Tarda ~1 min. Cada transformación cuesta una unidad en el límite
          mensual de Image Optimization de Vercel.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleStart}
            disabled={running || total === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-50"
          >
            {running ? "Calentando..." : progress ? "Volver a correr" : "Iniciar"}
          </button>

          {progress ? (
            <div className="flex flex-1 items-center gap-3 text-xs">
              <div className="h-2 min-w-[200px] flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-emerald-500 transition-[width] duration-200"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="whitespace-nowrap font-bold text-[#0a2b3d]">
                {progress.done} / {progress.total}
              </span>
              {progress.errors > 0 ? (
                <span className="whitespace-nowrap text-red-600">
                  {progress.errors} errores
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {finishedAt ? (
          <p className="mt-3 text-xs text-emerald-700">
            Terminado a las{" "}
            {finishedAt.toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
            . El catálogo debería cargar más rápido a partir de ahora.
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        <p className="font-bold">Cuándo correrlo</p>
        <ul className="mt-1 list-disc pl-5">
          <li>Después de un deploy que cambió configuración de imágenes.</li>
          <li>
            Cuando se suben productos nuevos masivamente a SpecParts y querés
            que el catálogo cargue optimizado desde la primera visita.
          </li>
          <li>
            No hace falta correrlo todos los días — el cache dura 30 días y
            las imágenes se recalientan solas a medida que alguien las pide.
          </li>
        </ul>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-md bg-gray-50 p-3">
      <dt className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
        {label}
      </dt>
      <dd
        className={[
          "mt-1 font-black text-[#0a2b3d]",
          small ? "text-xs" : "text-2xl",
        ].join(" ")}
      >
        {value}
      </dd>
    </div>
  );
}
