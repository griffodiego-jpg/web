"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminErrorEntry } from "@/lib/admin-log";

/**
 * Log de errores del dashboard. Lista los últimos N errores que se
 * registraron en Redis desde distintos puntos del sitio (SpecParts,
 * uploads, etc.). Tiene un botón "Limpiar" para vaciar la lista.
 */
export function ErrorsLog({
  initialErrors,
}: {
  initialErrors: AdminErrorEntry[];
}) {
  const router = useRouter();
  const [errors, setErrors] = useState(initialErrors);
  const [busy, setBusy] = useState(false);

  async function clearAll() {
    if (errors.length === 0) return;
    if (!confirm(`¿Limpiar ${errors.length} error${errors.length === 1 ? "" : "es"} del log?`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/errors/clear", { method: "POST" });
      if (res.ok) {
        setErrors([]);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  if (errors.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-gray-200 p-5 text-sm text-gray-500 text-center">
        No hay errores registrados. ✨
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Últimos {errors.length} errores (más recientes arriba).
        </p>
        <button
          type="button"
          onClick={clearAll}
          disabled={busy}
          className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
        >
          {busy ? "Limpiando..." : "Limpiar log"}
        </button>
      </div>
      <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
        {errors.map((e, i) => (
          <li key={i} className="p-3 text-xs flex items-start gap-3">
            <span className="shrink-0 w-8 inline-flex items-center justify-center rounded bg-red-100 text-red-700 font-black uppercase text-[10px] px-1 py-0.5">
              {e.scope}
            </span>
            <span className="text-gray-800 flex-1 min-w-0 break-words font-mono leading-tight">
              {e.message}
            </span>
            <time className="shrink-0 text-gray-400 text-[10px]">
              {formatTs(e.ts)}
            </time>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatTs(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
