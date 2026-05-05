"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { ZeroResultMeta, SearchTab } from "@/lib/search-log";

const TAB_LABEL: Record<SearchTab, string> = {
  palabra: "Palabra",
  patente: "Patente",
  vehiculo: "Vehículo",
  codigo: "Código",
  medidas: "Medidas",
};

function formatDate(ts: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function summarizeTabs(
  breakdown: Partial<Record<SearchTab, number>>,
): string {
  const entries = Object.entries(breakdown) as Array<[SearchTab, number]>;
  if (entries.length === 0) return "—";
  return entries
    .sort((a, b) => b[1] - a[1])
    .map(([tab, n]) => `${TAB_LABEL[tab]} ×${n}`)
    .join(" · ");
}

type Props = {
  rows: ZeroResultMeta[];
  showResolved: boolean;
};

export function BusquedasTable({ rows, showResolved }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = rows.filter((r) =>
    showResolved ? true : !r.resolved,
  );

  if (filtered.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
        {showResolved
          ? "No hay búsquedas registradas todavía."
          : "Sin búsquedas pendientes — todas las que hubo ya están marcadas como resueltas."}
      </div>
    );
  }

  async function act(action: "resolve" | "unresolve" | "delete", query: string) {
    setBusy(query + ":" + action);
    try {
      const res = await fetch("/api/admin/busquedas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, query }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        alert(body.error ?? "Error");
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Búsqueda</th>
            <th className="px-4 py-3">Veces</th>
            <th className="px-4 py-3">Tabs</th>
            <th className="px-4 py-3">Última</th>
            <th className="px-4 py-3">Primera</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filtered.map((r, i) => (
            <tr
              key={r.query}
              className={r.resolved ? "bg-emerald-50/40" : ""}
            >
              <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
              <td className="px-4 py-3">
                <div className="font-mono text-[#0a2b3d]">{r.originalQuery}</div>
                {r.resolved ? (
                  <span className="mt-1 inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    Resuelta
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 font-bold text-[#0a2b3d]">{r.count}</td>
              <td className="px-4 py-3 text-xs text-gray-600">
                {summarizeTabs(r.tabBreakdown)}
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">
                {formatDate(r.lastSeen)}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {formatDate(r.firstSeen)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {r.resolved ? (
                    <button
                      type="button"
                      disabled={pending || busy !== null}
                      onClick={() => act("unresolve", r.query)}
                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Desmarcar
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={pending || busy !== null}
                      onClick={() => act("resolve", r.query)}
                      className="rounded-md border border-emerald-600 bg-emerald-600 px-2 py-1 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                      title="Marcar como cubierta (la oculta del listado por defecto)"
                    >
                      Marcar resuelta
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pending || busy !== null}
                    onClick={() => {
                      if (
                        confirm(
                          `¿Borrar la búsqueda "${r.originalQuery}" del log?`,
                        )
                      ) {
                        act("delete", r.query);
                      }
                    }}
                    className="rounded-md border border-red-300 bg-white px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Borrar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
