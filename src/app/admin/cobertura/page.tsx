import type { Metadata } from "next";

import { CoverageTable } from "@/components/admin/CoverageTable";
import { listCatalog } from "@/lib/api/specparts";
import { buildCoverageMatrix } from "@/lib/catalog/coverage";

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0a2b3d]">Cobertura de catálogo</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Matriz vehículo × tipo de producto. Las celdas vacías son huecos
            del catálogo Griffo.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Universo: los modelos que aparecen en al menos un producto Griffo.
            No incluye parque automotor fuera de la cobertura actual.
          </p>
        </div>
        <a
          href="/api/admin/cobertura/export"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark"
        >
          <DownloadIcon /> Exportar CSV (Excel)
        </a>
      </div>

      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No se pudo cargar la información: {error}
        </div>
      ) : matrix ? (
        <CoverageTable matrix={matrix} />
      ) : null}
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
