import type { Metadata } from "next";

import { MercadoLibreUploader } from "@/components/admin/MercadoLibreUploader";
import { listCatalog } from "@/lib/api/specparts";
import { readLinks } from "@/lib/mercadolibre-links-store";

export const metadata: Metadata = {
  title: "Links Mercado Libre",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function formatFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Cruza el mapa guardado contra los códigos reales del catálogo de
 * SpecParts. Devuelve cuántos matchean y los primeros N que NO matchean
 * (para que el admin vea si el problema es de formato).
 */
async function crossCheck(savedKeys: string[]): Promise<{
  totalSaved: number;
  matching: number;
  unmatched: string[];
  catalogSamples: string[];
} | null> {
  try {
    const products = await listCatalog();
    const catalogCodes = new Set(
      products.map((p) => p.code.trim().toUpperCase()),
    );
    const matching = savedKeys.filter((k) => catalogCodes.has(k)).length;
    const unmatched = savedKeys.filter((k) => !catalogCodes.has(k)).slice(0, 10);
    const catalogSamples = Array.from(catalogCodes).slice(0, 8);
    return {
      totalSaved: savedKeys.length,
      matching,
      unmatched,
      catalogSamples,
    };
  } catch {
    return null;
  }
}

export default async function LinksMercadoLibrePage() {
  const current = await readLinks();
  const savedKeys = current ? Object.keys(current.links) : [];
  const check = savedKeys.length > 0 ? await crossCheck(savedKeys) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-[#0a2b3d]">
          Links de Mercado Libre
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Subí el Excel con código y link de Mercado Libre. Si hay varias
          publicaciones para el mismo código (ej. una por vehículo), se queda
          con la primera. Al guardar, se usan en el catálogo público para los
          visitantes no logueados.
        </p>
      </div>

      {current ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <div className="font-bold">Estado actual (en Redis)</div>
          <div className="mt-1">
            <strong>{current.totalWithLink}</strong> productos con link
            {current.totalWithoutLink > 0 && (
              <>
                {" · "}
                <strong>{current.totalWithoutLink}</strong> sin link
              </>
            )}
          </div>
          <div className="text-xs text-emerald-800/80 mt-1">
            Última actualización: {formatFecha(current.updatedAt)}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Todavía no se subió ningún Excel. Subí uno para empezar a mostrar
          los links en el catálogo público.
        </div>
      )}

      {check && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            check.matching === check.totalSaved
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : check.matching === 0
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <div className="font-bold">Diagnóstico contra el catálogo</div>
          <div className="mt-1">
            <strong>{check.matching}</strong> de <strong>{check.totalSaved}</strong>{" "}
            códigos guardados existen en el catálogo SpecParts.
            {check.matching === 0 && (
              <>
                {" "}
                <strong>Ningún código matchea</strong> — el formato del Excel es
                distinto al del catálogo.
              </>
            )}
          </div>
          {check.unmatched.length > 0 && (
            <div className="mt-3 text-xs">
              <div className="font-semibold">
                Ejemplos de códigos guardados que NO existen en el catálogo:
              </div>
              <div className="font-mono mt-1">
                {check.unmatched.map((c) => (
                  <span
                    key={c}
                    className="inline-block bg-white/50 rounded px-1.5 py-0.5 mr-1 mb-1"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="font-semibold mt-3">
                Cómo se ven los códigos en el catálogo (8 ejemplos al azar):
              </div>
              <div className="font-mono mt-1">
                {check.catalogSamples.map((c) => (
                  <span
                    key={c}
                    className="inline-block bg-white/50 rounded px-1.5 py-0.5 mr-1 mb-1"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[11px] opacity-80">
                Si el formato no coincide (ej. el Excel tiene{" "}
                <code>5412203</code> y el catálogo <code>54-122-03</code>), hay
                que normalizarlo en el Excel antes de subirlo.
              </p>
            </div>
          )}
        </div>
      )}

      <MercadoLibreUploader hasExistingData={!!current} />
    </div>
  );
}
