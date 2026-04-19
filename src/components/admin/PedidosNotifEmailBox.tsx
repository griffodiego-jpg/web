"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Box inline en /admin/pedidos que muestra el email al que se avisan
 * los pedidos nuevos + permite editarlo. Se guarda en Redis via
 * `POST /api/admin/b2b/config/notif-email`.
 */
export function PedidosNotifEmailBox({ current }: { current: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(current);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/b2b/config/notif-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-blue-900">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        <span className="font-semibold">Notificación de pedidos nuevos:</span>
      </div>
      {!editing ? (
        <>
          <span className="font-mono text-sm text-blue-900 flex-1 min-w-0 truncate">
            {current}
          </span>
          <button
            type="button"
            onClick={() => {
              setValue(current);
              setEditing(true);
              setError(null);
            }}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline"
          >
            Cambiar
          </button>
        </>
      ) : (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
          <input
            type="email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            autoFocus
            disabled={submitting}
            placeholder="ventas@griffo.com.ar"
            className="flex-1 min-w-[200px] px-3 py-1.5 border border-blue-300 rounded-md text-sm bg-white"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md text-xs disabled:opacity-60"
          >
            {submitting ? "Guardando…" : "Guardar"}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              setEditing(false);
              setError(null);
            }}
            className="text-xs text-gray-700 hover:text-[#0a2b3d] font-semibold"
          >
            Cancelar
          </button>
          {error && (
            <p className="w-full text-xs text-red-700 font-semibold">{error}</p>
          )}
        </form>
      )}
    </div>
  );
}
