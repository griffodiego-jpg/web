"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";
import type { DescargaSlot } from "@/lib/descargas-store";

export type SlotRow = {
  slot: DescargaSlot;
  title: string;
  description?: string;
  currentUrl?: string;
  /** Si es true, el URL actual viene del código (fallback), no de Redis. */
  isDefault: boolean;
  /** Accept attribute sugerido para el input file (ej. "application/pdf"). */
  accept?: string;
};

export type DescargasSection = {
  id: string;
  title: string;
  rows: SlotRow[];
};

export function DescargasManager({
  sections,
}: {
  sections: DescargasSection[];
}) {
  return (
    <div className="space-y-10">
      {sections.map((s) => (
        <section key={s.id}>
          <h2 className="text-lg font-bold text-[#0a2b3d] uppercase tracking-wide border-l-4 border-accent pl-3">
            {s.title}
          </h2>
          <div className="mt-4 space-y-3">
            {s.rows.map((row) => (
              <SlotCard key={JSON.stringify(row.slot)} row={row} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

type Status = "idle" | "uploading" | "ok" | "error";

function SlotCard({ row }: { row: SlotRow }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState(row.currentUrl);
  const [isDefault, setIsDefault] = useState(row.isDefault);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setError(null);
    try {
      // Upload directo cliente → Blob, evita el límite de 4.5 MB de
      // las serverless functions. Nuestra API genera el token y, al
      // completarse la subida, guarda la URL en Redis.
      const pathname = pathnameFor(row.slot, file.name);
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/admin/descargas/upload",
        clientPayload: JSON.stringify(row.slot),
      });
      // Fallback por si el webhook onUploadCompleted no alcanza al
      // server (en previews con protección). Es idempotente con
      // la escritura del webhook.
      await fetch("/api/admin/descargas/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot: row.slot, url: blob.url }),
      });
      setCurrentUrl(blob.url);
      setIsDefault(false);
      setStatus("ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setStatus("error");
    } finally {
      // Resetear el input para permitir re-upload del mismo archivo
      e.target.value = "";
    }
  }

  async function handleClear() {
    if (!confirm("¿Borrar el archivo subido y volver al default del código?")) {
      return;
    }
    setStatus("uploading");
    setError(null);
    try {
      const res = await fetch("/api/admin/descargas/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot: row.slot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setCurrentUrl(undefined);
      setIsDefault(true);
      setStatus("ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setStatus("error");
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[#0a2b3d]">{row.title}</p>
          {row.description && (
            <p className="text-xs text-gray-500 mt-0.5">{row.description}</p>
          )}
          {currentUrl ? (
            <p className="text-xs text-gray-600 mt-1 truncate">
              {isDefault ? (
                <span className="text-amber-600">
                  Usando default del código:
                </span>
              ) : (
                <span className="text-green-700">En Blob:</span>
              )}{" "}
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {currentUrl}
              </a>
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1 italic">Sin archivo</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-dark cursor-pointer">
            <UploadIcon />
            {currentUrl && !isDefault ? "Reemplazar" : "Subir archivo"}
            <input
              type="file"
              accept={row.accept}
              onChange={handleUpload}
              disabled={status === "uploading"}
              className="sr-only"
            />
          </label>
          {currentUrl && !isDefault && (
            <button
              type="button"
              onClick={handleClear}
              disabled={status === "uploading"}
              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
            >
              Borrar
            </button>
          )}
        </div>
      </div>

      {status === "uploading" && (
        <p className="mt-2 text-xs text-gray-500">Procesando…</p>
      )}
      {status === "ok" && (
        <p className="mt-2 text-xs text-green-700 font-semibold">Listo ✓</p>
      )}
      {status === "error" && error && (
        <p className="mt-2 text-xs text-red-700 font-semibold">{error}</p>
      )}
    </div>
  );
}

/** Pathname descriptivo dentro del blob — no afecta la URL pública. */
function pathnameFor(slot: DescargaSlot, filename: string): string {
  const safe = filename.replace(/[^\w.\-]+/g, "-");
  if (slot.kind === "catalogo-general") return `descargas/catalogo/${safe}`;
  if (slot.kind === "material")
    return `descargas/productos/${slot.slug}/${slot.type}/${safe}`;
  return `descargas/gated/${slot.id}/${safe}`;
}

function UploadIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
