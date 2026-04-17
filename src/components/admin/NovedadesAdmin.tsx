"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Novedad, TipoNovedad } from "@/lib/novedades";

type Filtro = "todas" | TipoNovedad | "ocultas";

/**
 * UI de admin para novedades auto-detectadas desde SpecParts.
 *
 * Cada fila muestra un producto actualizado en los últimos 12 meses.
 * Por defecto tipo = "Nueva aplicación". El admin puede:
 *   - Marcarla como "Lanzamiento"
 *   - Devolverla a "Nueva aplicación" (default)
 *   - Ocultarla (no aparece en /novedades público)
 *   - Restaurarla (volver a mostrarla)
 */
export function NovedadesAdmin({ novedades }: { novedades: Novedad[] }) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      todas: novedades.filter((n) => !n.hidden).length,
      lanzamiento: novedades.filter(
        (n) => !n.hidden && n.tipo === "lanzamiento"
      ).length,
      aplicacion: novedades.filter(
        (n) => !n.hidden && n.tipo === "aplicacion"
      ).length,
      ocultas: novedades.filter((n) => n.hidden).length,
    }),
    [novedades]
  );

  const filtered = useMemo(() => {
    let list = novedades;
    if (filtro === "ocultas") list = list.filter((n) => n.hidden);
    else list = list.filter((n) => !n.hidden);
    if (filtro === "lanzamiento" || filtro === "aplicacion") {
      list = list.filter((n) => n.tipo === filtro);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (n) =>
          n.code.toLowerCase().includes(q) ||
          n.titulo.toLowerCase().includes(q) ||
          (n.linea && n.linea.toLowerCase().includes(q))
      );
    }
    return list;
  }, [novedades, filtro, query]);

  async function setTipo(code: string, tipo: TipoNovedad) {
    setBusy(code);
    setError(null);
    try {
      const res = await fetch("/api/admin/novedades/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, tipo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function toggleHidden(code: string, hide: boolean) {
    if (hide && !confirm(`¿Ocultar la novedad del código ${code}?`)) return;
    setBusy(code);
    setError(null);
    try {
      const res = await fetch("/api/admin/novedades/despublicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          action: hide ? "hide" : "unhide",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto">
        <Tab
          active={filtro === "todas"}
          onClick={() => setFiltro("todas")}
          label="Todas visibles"
          count={counts.todas}
        />
        <Tab
          active={filtro === "lanzamiento"}
          onClick={() => setFiltro("lanzamiento")}
          label="Lanzamientos"
          count={counts.lanzamiento}
        />
        <Tab
          active={filtro === "aplicacion"}
          onClick={() => setFiltro("aplicacion")}
          label="Nuevas aplicaciones"
          count={counts.aplicacion}
        />
        <Tab
          active={filtro === "ocultas"}
          onClick={() => setFiltro("ocultas")}
          label="Ocultas"
          count={counts.ocultas}
          subtle
        />
      </div>

      {/* Buscador */}
      <input
        type="search"
        placeholder="Buscar por código, título o línea..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      />

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-sm text-gray-500">
          {filtro === "ocultas"
            ? "No hay novedades ocultas."
            : "No hay novedades que coincidan con el filtro."}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((n) => (
            <li
              key={n.code}
              className={`bg-white border rounded-lg p-3 flex flex-wrap items-center gap-3 ${
                n.hidden ? "border-gray-200 opacity-60" : "border-gray-200"
              }`}
            >
              {n.imagen && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={n.imagen}
                  alt=""
                  className="w-14 h-14 object-contain rounded bg-gray-50 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white ${
                      n.tipo === "lanzamiento" ? "bg-primary" : "bg-accent"
                    }`}
                  >
                    {n.tipo === "lanzamiento"
                      ? "Lanzamiento"
                      : "Nueva aplicación"}
                  </span>
                  <span className="font-mono font-black text-primary text-sm">
                    {n.code}
                  </span>
                  {n.linea && (
                    <span className="text-[10px] uppercase tracking-wide text-gray-500 font-bold">
                      {n.linea}
                    </span>
                  )}
                  {n.hidden && (
                    <span className="inline-flex rounded-full bg-gray-200 text-gray-600 px-2 py-0.5 text-[10px] font-bold uppercase">
                      Oculta
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#0a2b3d] font-medium truncate">
                  {n.titulo}
                </p>
                <p className="text-xs text-gray-500">
                  {n.vehiculos.length} vehículo
                  {n.vehiculos.length !== 1 ? "s" : ""} · actualizado{" "}
                  {n.fecha.toLocaleDateString("es-AR")}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Cambiar tipo */}
                {n.tipo === "aplicacion" ? (
                  <button
                    type="button"
                    onClick={() => setTipo(n.code, "lanzamiento")}
                    disabled={busy === n.code}
                    className="rounded-lg bg-primary text-white px-3 py-1.5 text-xs font-bold hover:bg-primary-dark transition cursor-pointer disabled:opacity-50"
                  >
                    Marcar como Lanzamiento
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTipo(n.code, "aplicacion")}
                    disabled={busy === n.code}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                  >
                    Volver a default
                  </button>
                )}

                {/* Ocultar / restaurar */}
                {n.hidden ? (
                  <button
                    type="button"
                    onClick={() => toggleHidden(n.code, false)}
                    disabled={busy === n.code}
                    className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100 transition cursor-pointer disabled:opacity-50"
                  >
                    Restaurar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleHidden(n.code, true)}
                    disabled={busy === n.code}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer disabled:opacity-50"
                  >
                    Ocultar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Tab({
  active,
  onClick,
  label,
  count,
  subtle,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  subtle?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
        active
          ? subtle
            ? "border-gray-400 text-gray-600"
            : "border-primary text-primary"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
      <span
        className={`ml-2 text-xs rounded-full px-2 py-0.5 ${
          active
            ? subtle
              ? "bg-gray-400 text-white"
              : "bg-primary text-white"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
