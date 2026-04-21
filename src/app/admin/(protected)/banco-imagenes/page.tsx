import type { Metadata } from "next";

import { BancoImagenesAdmin } from "@/components/admin/BancoImagenesAdmin";
import {
  countProductsWithImages,
  readMeta,
} from "@/lib/banco-imagenes";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = { title: "Banco de imágenes" };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function BancoImagenesPage() {
  // countProductsWithImages puede fallar si SpecParts está caído.
  // No es crítico: el admin sigue pudiendo regenerar.
  const [meta, currentProductCount] = await Promise.all([
    readMeta(),
    countProductsWithImages().catch(() => 0),
  ]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-[#0a2b3d]">Banco de imágenes</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">
          Un ZIP con todas las fotos del catálogo (organizadas por código de
          producto) para mandarles a los clientes que lo pidan. El link es
          fijo: podés compartirlo una vez y siempre apunta al ZIP más reciente.
          Se regenera automáticamente todos los lunes a la madrugada, y vos
          podés forzarlo desde acá si subieron productos nuevos.
        </p>
      </header>

      <BancoImagenesAdmin
        meta={meta}
        currentProductCount={currentProductCount}
        siteUrl={SITE_URL}
      />
    </div>
  );
}
