import type { Metadata } from "next";

import { listCatalog } from "@/lib/api/specparts";
import { buildCoverageMatrix, COLUMNAS, vehiculoKey } from "@/lib/catalog/coverage";

export const metadata: Metadata = {
  title: "Cobertura de catálogo",
};

export const revalidate = 1800;

export default async function CoberturaPage() {
  let matrix: Awaited<ReturnType<typeof buildCoverageMatrix>> | null = null;
  let error: string | null = null;
  try {
    const products = await listCatalog();
    matrix = buildCoverageMatrix(products);
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar el catálogo";
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-black text-[#0a2b3d]">Cobertura de catálogo</h1>
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No se pudo cargar la información: {error}
        </div>
      </div>
    );
  }
  if (!matrix) return null;

  const { vehiculos, columnas } = matrix;
  const gruposOrden: Array<{ nombre: string; span: number }> = [];
  let currentGroup: string | null = null;
  let currentSpan = 0;
  for (const col of columnas) {
    if (col.grupo !== currentGroup) {
      if (currentGroup) gruposOrden.push({ nombre: currentGroup, span: currentSpan });
      currentGroup = col.grupo;
      currentSpan = 1;
    } else {
      currentSpan += 1;
    }
  }
  if (currentGroup) gruposOrden.push({ nombre: currentGroup, span: currentSpan });

  // Estadísticas rápidas
  const totalCeldas = vehiculos.length * columnas.length;
  let celdasCubiertas = 0;
  for (const v of vehiculos) {
    const key = vehiculoKey(v.brand, v.masterModel);
    for (const col of columnas) {
      if ((matrix.celdas[key]?.[col.id]?.length ?? 0) > 0) celdasCubiertas += 1;
    }
  }
  const porcentaje = totalCeldas > 0 ? Math.round((celdasCubiertas / totalCeldas) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0a2b3d]">Cobertura de catálogo</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Matriz vehículo × tipo de producto. Las celdas vacías son huecos
            del catálogo Griffo: vehículos donde no hay producto desarrollado
            para esa posición/lado.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Universo: los <strong>{vehiculos.length}</strong> modelos que aparecen
            en al menos un producto Griffo. No incluye parque automotor fuera
            de la cobertura actual (esa lista hay que pedírsela a SpecParts).
          </p>
        </div>
        <a
          href="/api/admin/cobertura/export"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark"
        >
          <DownloadIcon /> Exportar CSV (Excel)
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Modelos" value={String(vehiculos.length)} />
        <Stat label="Columnas" value={String(columnas.length)} />
        <Stat label="Celdas cubiertas" value={`${celdasCubiertas} / ${totalCeldas}`} />
        <Stat label="Cobertura" value={`${porcentaje}%`} />
      </div>

      {/* Matriz */}
      <div className="overflow-auto rounded-lg border border-gray-200 bg-white">
        <table className="border-collapse text-[11px]">
          <thead className="sticky top-0 z-10">
            <tr>
              <th
                rowSpan={2}
                className="sticky left-0 z-20 min-w-[160px] border-b border-r border-gray-200 bg-gray-50 px-3 py-2 text-left font-bold text-[#0a2b3d]"
              >
                Marca
              </th>
              <th
                rowSpan={2}
                className="sticky left-[160px] z-20 min-w-[180px] border-b border-r border-gray-200 bg-gray-50 px-3 py-2 text-left font-bold text-[#0a2b3d]"
              >
                Modelo
              </th>
              {gruposOrden.map((g) => (
                <th
                  key={g.nombre}
                  colSpan={g.span}
                  className={[
                    "border-b border-r border-gray-300 px-3 py-2 text-center text-[10px] font-black uppercase tracking-widest text-white",
                    g.nombre === "DIRECCIÓN" ? "bg-[#7d8fa3]" : "",
                    g.nombre === "SUSPENSIÓN" ? "bg-[#5a7fb5]" : "",
                    g.nombre === "TRANSMISIÓN" ? "bg-[#4a8c6f]" : "",
                  ].join(" ")}
                >
                  Sistema de {g.nombre.toLowerCase()}
                </th>
              ))}
            </tr>
            <tr>
              {columnas.map((c) => (
                <th
                  key={c.id}
                  className="min-w-[120px] max-w-[160px] border-b border-r border-gray-200 bg-gray-100 px-2 py-2 text-left align-top text-[10px] font-bold text-[#0a2b3d]"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehiculos.map((v, idx) => {
              const key = vehiculoKey(v.brand, v.masterModel);
              return (
                <tr key={key} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                  <td className="sticky left-0 z-10 border-b border-r border-gray-200 bg-inherit px-3 py-1.5 font-bold text-[#0a2b3d]">
                    {v.brand}
                  </td>
                  <td className="sticky left-[160px] z-10 border-b border-r border-gray-200 bg-inherit px-3 py-1.5 text-[#0a2b3d]">
                    {v.masterModel}
                  </td>
                  {columnas.map((c) => {
                    const skus = matrix.celdas[key]?.[c.id] ?? [];
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
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-[#0a2b3d]">{value}</p>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
