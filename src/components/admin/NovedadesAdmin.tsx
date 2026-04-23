"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  formatFechaMes,
  vehicleKey,
  type Novedad,
  type TipoNovedad,
} from "@/lib/novedades";

type Filtro = "sin-publicar" | "publicadas" | TipoNovedad | "ocultas";

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
  const [filtro, setFiltro] = useState<Filtro>("sin-publicar");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  /** Estado local (por código) de los vehículos marcados como "nuevos". */
  const [nuevosByCode, setNuevosByCode] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    for (const n of novedades) {
      init[n.code] = new Set(n.nuevosVehiculos);
    }
    return init;
  });
  /**
   * Estado local del mes de lanzamiento por código (formato YYYY-MM).
   * Inicializa con el override actual si existe.
   */
  const [fechaByCode, setFechaByCode] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const n of novedades) {
      if (n.fechaMes) init[n.code] = n.fechaMes;
    }
    return init;
  });

  const counts = useMemo(
    () => ({
      sinPublicar: novedades.filter((n) => !n.published && !n.hidden).length,
      publicadas: novedades.filter((n) => n.published && !n.hidden).length,
      lanzamiento: novedades.filter(
        (n) => n.published && !n.hidden && n.tipo === "lanzamiento"
      ).length,
      aplicacion: novedades.filter(
        (n) => n.published && !n.hidden && n.tipo === "aplicacion"
      ).length,
      ocultas: novedades.filter((n) => n.hidden).length,
    }),
    [novedades]
  );

  const filtered = useMemo(() => {
    let list = novedades;
    if (filtro === "ocultas") {
      list = list.filter((n) => n.hidden);
    } else if (filtro === "sin-publicar") {
      list = list.filter((n) => !n.published && !n.hidden);
    } else if (filtro === "publicadas") {
      list = list.filter((n) => n.published && !n.hidden);
    } else {
      // tipo específico: solo publicadas con ese tipo
      list = list.filter((n) => n.published && !n.hidden && n.tipo === filtro);
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

  async function setTipo(code: string, tipo: TipoNovedad, fecha?: string) {
    setBusy(code);
    setError(null);
    try {
      const res = await fetch("/api/admin/novedades/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, tipo, ...(fecha !== undefined && { fecha }) }),
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

  /** Guarda el set de vehículos "nuevos" para un código. */
  async function saveNuevos(code: string, keys: string[]) {
    setBusy(code);
    setError(null);
    try {
      const res = await fetch("/api/admin/novedades/nuevos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, keys }),
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

  function toggleVehiculoNuevo(code: string, key: string) {
    setNuevosByCode((prev) => {
      const current = new Set(prev[code] ?? []);
      if (current.has(key)) current.delete(key);
      else current.add(key);
      return { ...prev, [code]: current };
    });
  }

  async function unpublish(code: string) {
    if (!confirm(`¿Despublicar la novedad del código ${code}?`)) return;
    setBusy(code);
    setError(null);
    try {
      const res = await fetch("/api/admin/novedades/despublicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "unpublish" }),
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
          active={filtro === "sin-publicar"}
          onClick={() => setFiltro("sin-publicar")}
          label="Sin publicar"
          count={counts.sinPublicar}
        />
        <Tab
          active={filtro === "publicadas"}
          onClick={() => setFiltro("publicadas")}
          label="Publicadas"
          count={counts.publicadas}
        />
        <Tab
          active={filtro === "lanzamiento"}
          onClick={() => setFiltro("lanzamiento")}
          label="Lanzamientos"
          count={counts.lanzamiento}
          subtle
        />
        <Tab
          active={filtro === "aplicacion"}
          onClick={() => setFiltro("aplicacion")}
          label="Nuevas aplicaciones"
          count={counts.aplicacion}
          subtle
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
          {filtered.map((n) => {
            const isExpanded = expandedCode === n.code;
            const localNuevos = nuevosByCode[n.code] ?? new Set();
            const unique = uniqueBrandModels(n.vehiculos);
            const nuevosCount = localNuevos.size;
            const originalNuevosCount = n.nuevosVehiculos.length;
            const dirty = nuevosCount !== originalNuevosCount || !sameSet(localNuevos, new Set(n.nuevosVehiculos));
            return (
            <li
              key={n.code}
              className={`bg-white border rounded-lg ${
                n.hidden ? "border-gray-200 opacity-60" : "border-gray-200"
              }`}
            >
              <div className="p-3 flex flex-wrap items-center gap-3">
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
                  {n.published ? (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white ${
                        n.tipo === "lanzamiento" ? "bg-primary" : "bg-accent"
                      }`}
                    >
                      {n.tipo === "lanzamiento"
                        ? "Lanzamiento"
                        : "Nueva aplicación"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-gray-300 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Sin publicar
                    </span>
                  )}
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
                  {n.vehiculos.length !== 1 ? "s" : ""}
                  {n.fechaMes ? (
                    <> · lanzamiento {formatFechaMes(n.fechaMes)}</>
                  ) : (
                    <> · actualizado {n.fecha.toLocaleDateString("es-AR")}</>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Input de mes de lanzamiento. Para lanzamientos entra
                    en la publicación; para aplicaciones es opcional. */}
                {(() => {
                  const fechaLocal = fechaByCode[n.code] ?? "";
                  const fechaDirty =
                    n.published && fechaLocal !== (n.fechaMes ?? "");
                  return (
                    <label className="inline-flex items-center gap-1 text-[10px] text-gray-500 font-semibold">
                      <span>Mes</span>
                      <input
                        type="month"
                        value={fechaLocal}
                        onChange={(e) =>
                          setFechaByCode((prev) => ({
                            ...prev,
                            [n.code]: e.target.value,
                          }))
                        }
                        className="rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      {n.published && fechaDirty && (
                        <button
                          type="button"
                          onClick={() => setTipo(n.code, n.tipo, fechaLocal)}
                          disabled={busy === n.code}
                          className="ml-1 rounded bg-primary text-white px-2 py-1 text-[10px] font-bold hover:bg-primary-dark transition cursor-pointer disabled:opacity-50"
                        >
                          Guardar
                        </button>
                      )}
                    </label>
                  );
                })()}

                {!n.published ? (
                  // SIN PUBLICAR: 2 botones para elegir tipo y publicar
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setTipo(n.code, "lanzamiento", fechaByCode[n.code] || "")
                      }
                      disabled={busy === n.code}
                      className="rounded-lg bg-primary text-white px-3 py-1.5 text-xs font-bold hover:bg-primary-dark transition cursor-pointer disabled:opacity-50"
                    >
                      Publicar Lanzamiento
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTipo(n.code, "aplicacion", fechaByCode[n.code] || "")
                      }
                      disabled={busy === n.code}
                      className="rounded-lg bg-accent text-white px-3 py-1.5 text-xs font-bold hover:bg-primary transition cursor-pointer disabled:opacity-50"
                    >
                      Publicar Nueva aplicación
                    </button>
                  </>
                ) : (
                  // PUBLICADA: cambiar tipo + despublicar
                  <>
                    {n.tipo === "aplicacion" ? (
                      <button
                        type="button"
                        onClick={() => setTipo(n.code, "lanzamiento")}
                        disabled={busy === n.code}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                      >
                        Cambiar a Lanzamiento
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setTipo(n.code, "aplicacion")}
                        disabled={busy === n.code}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                      >
                        Cambiar a Aplicación
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => unpublish(n.code)}
                      disabled={busy === n.code}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 transition cursor-pointer disabled:opacity-50"
                    >
                      Despublicar
                    </button>
                  </>
                )}

                {/* Marcar vehículos nuevos (solo para aplicaciones publicadas) */}
                {n.published && n.tipo === "aplicacion" && n.vehiculos.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedCode(isExpanded ? null : n.code)
                    }
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      originalNuevosCount > 0
                        ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Vehículos nuevos
                    {originalNuevosCount > 0 && ` (${originalNuevosCount})`}
                    <span className="ml-1">{isExpanded ? "▴" : "▾"}</span>
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
              </div>

              {isExpanded && n.tipo === "aplicacion" && (
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <p className="text-xs font-bold text-gray-700 mb-2">
                    Marcá los vehículos que son <span className="text-red-700">nuevas aplicaciones</span> para este producto:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 max-h-64 overflow-y-auto">
                    {unique.map((v) => {
                      const key = v.key;
                      const checked = localNuevos.has(key);
                      return (
                        <label
                          key={key}
                          className="flex items-center gap-2 text-xs bg-white rounded border border-gray-200 px-2 py-1.5 cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleVehiculoNuevo(n.code, key)}
                            className="accent-red-600"
                          />
                          <span className="font-bold text-[#0a2b3d]">
                            {v.brand}
                          </span>
                          <span className="text-gray-600 truncate">
                            {v.modelo}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        saveNuevos(n.code, Array.from(localNuevos))
                      }
                      disabled={busy === n.code || !dirty}
                      className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-red-700 transition cursor-pointer disabled:opacity-50"
                    >
                      Guardar cambios
                    </button>
                    {nuevosCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setNuevosByCode((prev) => ({
                            ...prev,
                            [n.code]: new Set(),
                          }));
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                      >
                        Limpiar selección
                      </button>
                    )}
                    <p className="text-xs text-gray-500 ml-auto">
                      {nuevosCount} / {unique.length} marcado
                      {nuevosCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              )}
            </li>
          );
          })}
        </ul>
      )}
    </div>
  );
}

function uniqueBrandModels(
  vehicles: Novedad["vehiculos"]
): { key: string; brand: string; modelo: string }[] {
  const seen = new Map<string, { brand: string; modelo: string }>();
  for (const v of vehicles) {
    if (!v.brand) continue;
    const modelo = (v.master_model || v.model || "").trim();
    if (!modelo) continue;
    const key = vehicleKey(v);
    if (!seen.has(key)) seen.set(key, { brand: v.brand, modelo });
  }
  return Array.from(seen.entries())
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => a.brand.localeCompare(b.brand) || a.modelo.localeCompare(b.modelo));
}

function sameSet(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
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
