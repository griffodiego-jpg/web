"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Novedad, TipoNovedad } from "@/lib/novedades";

type Candidate = {
  code: string;
  product: string;
  description: string;
  category: string;
  updated_at: string;
  imagen: string | null;
  vehicleCount: number;
  alreadyPublished: boolean;
};

/**
 * UI de admin para novedades. Dos secciones:
 *   1. Publicadas: lista editable, botón para despublicar o cambiar tipo.
 *   2. Publicar nueva: input de código manual + feed de candidatos
 *      (últimos actualizados en SpecParts).
 */
export function NovedadesAdmin({
  initialPublished,
  candidates,
}: {
  initialPublished: Novedad[];
  candidates: Candidate[];
}) {
  const router = useRouter();
  const [published, setPublished] = useState(initialPublished);
  const [query, setQuery] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [manualTipo, setManualTipo] = useState<TipoNovedad>("lanzamiento");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredCandidates = useMemo(() => {
    if (!query.trim()) return candidates;
    const q = query.toLowerCase();
    return candidates.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.product.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [candidates, query]);

  async function publicar(code: string, tipo: TipoNovedad) {
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
      // Recargar para refrescar el state server-side.
      router.refresh();
      // Optimistic: marcamos ya publicada localmente.
      setPublished((p) => [
        {
          code: data.code ?? code,
          tipo,
          titulo: data.titulo ?? code,
          descripcion: "",
          fecha: new Date(),
          linea: null,
          imagen: null,
          vehiculos: [],
          destacadoSlug: null,
          catalogoSlug: "",
        },
        ...p.filter((x) => x.code !== code),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function despublicar(code: string) {
    if (!confirm(`¿Despublicar la novedad del código ${code}?`)) return;
    setBusy(code);
    setError(null);
    try {
      const res = await fetch("/api/admin/novedades/despublicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setPublished((p) => p.filter((x) => x.code !== code));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function onManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await publicar(manualCode.trim(), manualTipo);
    setManualCode("");
  }

  return (
    <div className="space-y-10">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Publicadas */}
      <section>
        <h2 className="text-lg font-bold text-[#0a2b3d] uppercase tracking-wide border-l-4 border-accent pl-3">
          Publicadas ({published.length})
        </h2>

        {published.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500 italic">
            No hay novedades publicadas todavía. Publicá alguna desde el feed
            de abajo o con el formulario de código manual.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {published.map((n) => (
              <li
                key={n.code}
                className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
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
                  </div>
                  <p className="font-bold text-sm text-[#0a2b3d]">
                    {n.titulo}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {n.vehiculos.length} vehículo
                    {n.vehiculos.length !== 1 ? "s" : ""} ·{" "}
                    {n.fecha.toLocaleDateString("es-AR")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      publicar(
                        n.code,
                        n.tipo === "lanzamiento" ? "aplicacion" : "lanzamiento"
                      )
                    }
                    disabled={busy === n.code}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                  >
                    Cambiar tipo
                  </button>
                  <button
                    type="button"
                    onClick={() => despublicar(n.code)}
                    disabled={busy === n.code}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer disabled:opacity-50"
                  >
                    Despublicar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Publicar manual por código */}
      <section>
        <h2 className="text-lg font-bold text-[#0a2b3d] uppercase tracking-wide border-l-4 border-accent pl-3">
          Publicar por código
        </h2>
        <form
          onSubmit={onManualSubmit}
          className="mt-4 flex flex-wrap items-end gap-3 bg-white border border-gray-200 rounded-lg p-4"
        >
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Código SKU
            </label>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="ej. 238-32"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Tipo
            </label>
            <select
              value={manualTipo}
              onChange={(e) => setManualTipo(e.target.value as TipoNovedad)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="lanzamiento">Lanzamiento</option>
              <option value="aplicacion">Nueva aplicación</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={busy !== null || !manualCode.trim()}
            className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-bold hover:bg-primary-dark transition cursor-pointer disabled:opacity-50"
          >
            {busy === manualCode ? "Publicando..." : "Publicar"}
          </button>
        </form>
      </section>

      {/* Candidatos — últimos actualizados en SpecParts */}
      <section>
        <h2 className="text-lg font-bold text-[#0a2b3d] uppercase tracking-wide border-l-4 border-accent pl-3">
          Candidatos (últimos actualizados en SpecParts)
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Ordenados por fecha de actualización. Un click publica con ese tipo.
        </p>

        <div className="mt-3">
          <input
            type="search"
            placeholder="Filtrar por código, nombre o categoría..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {filteredCandidates.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500 italic">
            No hay candidatos que coincidan con el filtro.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {filteredCandidates.map((c) => (
              <li
                key={c.code}
                className="bg-white border border-gray-200 rounded-lg p-3 flex flex-wrap items-center gap-3"
              >
                {c.imagen && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={c.imagen}
                    alt=""
                    className="w-12 h-12 object-contain rounded bg-gray-50 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-primary text-sm">
                      {c.code}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-gray-500 font-bold">
                      {c.category}
                    </span>
                    {c.alreadyPublished && (
                      <span className="inline-flex rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                        Publicada
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#0a2b3d] font-medium truncate">
                    {c.product}
                  </p>
                  <p className="text-xs text-gray-500">
                    {c.vehicleCount} vehículo{c.vehicleCount !== 1 ? "s" : ""}{" "}
                    · actualizado{" "}
                    {new Date(c.updated_at).toLocaleDateString("es-AR")}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => publicar(c.code, "lanzamiento")}
                    disabled={busy === c.code}
                    className="rounded-lg bg-primary text-white px-3 py-1.5 text-xs font-bold hover:bg-primary-dark transition cursor-pointer disabled:opacity-50"
                  >
                    Lanzamiento
                  </button>
                  <button
                    type="button"
                    onClick={() => publicar(c.code, "aplicacion")}
                    disabled={busy === c.code}
                    className="rounded-lg bg-accent text-white px-3 py-1.5 text-xs font-bold hover:bg-primary transition cursor-pointer disabled:opacity-50"
                  >
                    Nueva aplicación
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
