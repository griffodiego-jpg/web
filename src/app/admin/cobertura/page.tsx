import type { Metadata } from "next";

import { CoverageTable } from "@/components/admin/CoverageTable";
import { listCatalog } from "@/lib/api/specparts";
import { buildCoverageMatrix } from "@/lib/catalog/coverage";

export const metadata: Metadata = {
  title: "Cobertura de catálogo",
};

// Dynamic: el admin siempre necesita datos frescos y no queremos que el build
// falle si SpecParts no responde durante el prerender.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
