import type { Metadata } from "next";

import { MercadoLibreUploader } from "@/components/admin/MercadoLibreUploader";
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

export default async function LinksMercadoLibrePage() {
  const current = await readLinks();

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
          <div className="font-bold">Estado actual</div>
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

      <MercadoLibreUploader hasExistingData={!!current} />
    </div>
  );
}
