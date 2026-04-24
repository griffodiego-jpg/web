import type { Metadata } from "next";

import { MercadoLibreUploader } from "@/components/admin/MercadoLibreUploader";

export const metadata: Metadata = {
  title: "Links Mercado Libre",
};

export default function LinksMercadoLibrePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-[#0a2b3d]">
          Links de Mercado Libre
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Subí el Excel con código y link de Mercado Libre. Si hay varias
          publicaciones para el mismo código (ej. una por vehículo), se queda
          con la primera.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Paso intermedio sin persistencia: descargá el JSON y mandámelo, o
          copialo como TypeScript para pegar en el código.
        </p>
      </div>

      <MercadoLibreUploader />
    </div>
  );
}
