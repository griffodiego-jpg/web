"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { BancoImagenesMeta } from "@/lib/banco-imagenes";

type Props = {
  meta: BancoImagenesMeta | null;
  currentProductCount: number;
  siteUrl: string;
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function BancoImagenesAdmin({
  meta,
  currentProductCount,
  siteUrl,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const publicUrl = `${siteUrl}/api/descargas/banco-imagenes.zip`;

  // Sugerir regenerar si aumentaron los productos con fotos desde la
  // última vez. Un gap > 3 se considera relevante.
  const diff = meta ? currentProductCount - meta.productCount : currentProductCount;
  const suggestRegenerate = !meta || diff > 3;

  async function handleRegenerate() {
    if (loading) return;
    if (!confirm("La regeneración puede tardar hasta 60 segundos. ¿Continuamos?")) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/banco-imagenes/regenerar", {
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

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {suggestRegenerate && !loading && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">
            {meta
              ? `Hay ${diff} producto${diff === 1 ? "" : "s"} con fotos nuevas desde la última regeneración`
              : "El banco de imágenes todavía no se generó"}
          </p>
          <p className="mt-1">
            {meta
              ? "Los clientes que descarguen hoy no las van a tener. Apretá Regenerar para que el ZIP quede al día."
              : "Apretá Regenerar para armar el primer ZIP. Después podés compartir el link con tus clientes."}
          </p>
        </div>
      )}

      <section className="rounded-xl bg-white shadow-sm p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wide text-[#0a2b3d]">
            Estado actual
          </h2>
        </div>

        {meta ? (
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Stat label="Última regeneración" value={formatDateTime(meta.generatedAt)} />
            <Stat label="Productos" value={`${meta.productCount}`} />
            <Stat label="Fotos" value={`${meta.imageCount}`} />
            <Stat label="Tamaño del ZIP" value={formatBytes(meta.byteSize)} />
          </dl>
        ) : (
          <p className="text-sm text-gray-500">
            Todavía no se generó ningún ZIP.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <Spinner /> Regenerando... (puede tardar ~1 minuto)
              </>
            ) : (
              <>
                <RefreshIcon /> Regenerar ahora
              </>
            )}
          </button>
          <p className="text-xs text-gray-500">
            También se regenera automáticamente todos los lunes a la madrugada.
          </p>
        </div>

        {err ? (
          <p className="text-sm text-red-600">Error: {err}</p>
        ) : null}
      </section>

      <section className="rounded-xl bg-white shadow-sm p-5 flex flex-col gap-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-[#0a2b3d]">
          Link para compartir con clientes
        </h2>
        <p className="text-xs text-gray-600">
          Este link siempre apunta al ZIP más reciente. No cambia cuando
          regenerás — mandáselo una vez y listo.
        </p>
        <div className="flex flex-wrap items-stretch gap-2">
          <input
            readOnly
            value={publicUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 min-w-0 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono"
          />
          <button
            type="button"
            onClick={copyLink}
            className="rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-sm font-semibold px-4 py-2 transition"
          >
            {copied ? "¡Copiado!" : "Copiar"}
          </button>
          {meta ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-primary text-primary hover:bg-primary hover:text-white text-sm font-semibold px-4 py-2 transition"
            >
              Descargar
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
        {label}
      </p>
      <p className="mt-0.5 text-[#0a2b3d] font-bold">{value}</p>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
