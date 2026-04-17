"use client";

import { useMemo, useState } from "react";

import type { CoverageMatrix, VehiculoFila } from "@/lib/catalog/coverage";
import { vehiculoKey } from "@/lib/catalog/coverage";

type SortKey = "brand" | "masterModel";

type Props = {
  matrix: CoverageMatrix;
};

export function CoverageTable({ matrix }: Props) {
  const { columnas, vehiculos, celdas } = matrix;

  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("brand");
  const [sortAsc, setSortAsc] = useState(true);

  const gruposOrden = useMemo(() => {
    const out: Array<{ nombre: string; span: number }> = [];
    let current: string | null = null;
    let span = 0;
    for (const col of columnas) {
      if (col.grupo !== current) {
        if (current) out.push({ nombre: current, span });
        current = col.grupo;
        span = 1;
      } else {
        span += 1;
      }
    }
    if (current) out.push({ nombre: current, span });
    return out;
  }, [columnas]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const base = q
      ? vehiculos.filter((v) => `${v.brand} ${v.masterModel}`.toLowerCase().includes(q))
      : [...vehiculos];

    base.sort((a, b) => {
      const cmp = compareVeh(a, b, sortKey);
      const tieBreak = sortKey === "brand" ? compareVeh(a, b, "masterModel") : 0;
      const result = cmp !== 0 ? cmp : tieBreak;
      return sortAsc ? result : -result;
    });
    return base;
  }, [vehiculos, filter, sortKey, sortAsc]);

  const onSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const stats = useMemo(() => {
    const total = filtered.length * columnas.length;
    let covered = 0;
    for (const v of filtered) {
      const key = vehiculoKey(v.brand, v.masterModel);
      for (const col of columnas) {
        if ((celdas[key]?.[col.id]?.length ?? 0) > 0) covered += 1;
      }
    }
    return {
      total,
      covered,
      percent: total > 0 ? Math.round((covered / total) * 100) : 0,
    };
  }, [filtered, columnas, celdas]);

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Buscar vehículo
          </span>
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Ej: Ford Focus, Chevrolet..."
            className="h-10 w-72 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <Pill label="Modelos" value={`${filtered.length} / ${vehiculos.length}`} />
          <Pill label="Cubiertas" value={`${stats.covered} / ${stats.total}`} />
          <Pill label="Cobertura" value={`${stats.percent}%`} />
        </div>
      </div>

      {/* Matriz */}
      <div className="relative max-h-[calc(100vh-260px)] overflow-auto rounded-lg border border-gray-200 bg-white">
        <table className="border-collapse text-[11px]">
          <thead>
            {/* Primera fila: grupos de sistemas */}
            <tr>
              <th
                rowSpan={2}
                onClick={() => onSort("brand")}
                aria-sort={sortKey === "brand" ? (sortAsc ? "ascending" : "descending") : "none"}
                className="sticky left-0 top-0 z-30 min-w-[150px] cursor-pointer border-b border-r border-gray-200 bg-gray-100 px-3 py-2 text-left font-bold text-[#0a2b3d] hover:bg-gray-200"
              >
                Marca {sortIndicator(sortKey === "brand", sortAsc)}
              </th>
              <th
                rowSpan={2}
                onClick={() => onSort("masterModel")}
                aria-sort={sortKey === "masterModel" ? (sortAsc ? "ascending" : "descending") : "none"}
                className="sticky left-[150px] top-0 z-30 min-w-[170px] cursor-pointer border-b border-r border-gray-200 bg-gray-100 px-3 py-2 text-left font-bold text-[#0a2b3d] hover:bg-gray-200"
              >
                Modelo {sortIndicator(sortKey === "masterModel", sortAsc)}
              </th>
              {gruposOrden.map((g) => (
                <th
                  key={g.nombre}
                  colSpan={g.span}
                  className={[
                    "sticky top-0 z-20 border-b border-r border-gray-300 px-3 py-2 text-center text-[10px] font-black uppercase tracking-widest text-white",
                    g.nombre === "DIRECCIÓN" ? "bg-[#7d8fa3]" : "",
                    g.nombre === "SUSPENSIÓN" ? "bg-[#5a7fb5]" : "",
                    g.nombre === "TRANSMISIÓN" ? "bg-[#4a8c6f]" : "",
                  ].join(" ")}
                >
                  Sistema de {g.nombre.toLowerCase()}
                </th>
              ))}
            </tr>
            {/* Segunda fila: nombres de columnas específicas */}
            <tr>
              {columnas.map((c) => (
                <th
                  key={c.id}
                  className="sticky top-[37px] z-20 min-w-[130px] max-w-[160px] border-b border-r border-gray-200 bg-gray-50 px-2 py-2 text-left align-top text-[10px] font-bold text-[#0a2b3d]"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((v, idx) => {
              const key = vehiculoKey(v.brand, v.masterModel);
              const zebra = idx % 2 === 0 ? "bg-white" : "bg-gray-50/60";
              return (
                <tr key={key}>
                  <td
                    className={`sticky left-0 z-10 min-w-[150px] border-b border-r border-gray-200 px-3 py-1.5 font-bold text-[#0a2b3d] ${zebra}`}
                  >
                    {v.brand}
                  </td>
                  <td
                    className={`sticky left-[150px] z-10 min-w-[170px] border-b border-r border-gray-200 px-3 py-1.5 text-[#0a2b3d] ${zebra}`}
                  >
                    {v.masterModel}
                  </td>
                  {columnas.map((c) => {
                    const skus = celdas[key]?.[c.id] ?? [];
                    const covered = skus.length > 0;
                    return (
                      <td
                        key={c.id}
                        title={covered ? skus.join(", ") : "Sin producto"}
                        className={[
                          "border-b border-r border-gray-200 px-2 py-1.5 text-[10px]",
                          covered ? "bg-emerald-50 text-emerald-900" : "bg-red-50/40",
                        ].join(" ")}
                      >
                        {covered ? skus.join(" · ") : ""}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columnas.length + 2}
                  className="px-6 py-10 text-center text-sm text-gray-400"
                >
                  Ningún vehículo coincide con la búsqueda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function compareVeh(a: VehiculoFila, b: VehiculoFila, key: SortKey): number {
  return a[key].localeCompare(b[key], "es");
}

function sortIndicator(active: boolean, asc: boolean): string {
  if (!active) return "↕";
  return asc ? "▲" : "▼";
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-right">
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
      <p className="text-sm font-black text-[#0a2b3d]">{value}</p>
    </div>
  );
}
