import type { Metadata } from "next";

import { CatalogoImagenesManager } from "@/components/admin/CatalogoImagenesManager";
import {
  CATALOGO_IMAGENES,
  readImageOverrides,
} from "@/lib/catalogo-imagenes-store";

export const metadata: Metadata = {
  title: "Imagen tréboles",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CatalogoImagenesPage() {
  const overrides = await readImageOverrides();

  const resolvedUrls: Record<string, string | undefined> = {};
  const hasOverride: Record<string, boolean> = {};
  for (const slot of CATALOGO_IMAGENES) {
    resolvedUrls[slot.id] = overrides[slot.id] || slot.fallback;
    hasOverride[slot.id] = !!overrides[slot.id];
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-[#0a2b3d]">Imagen tréboles</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Gestioná la imagen 'Medidas de Tréboles' que aparece en el catálogo
          público (tab Medidas → Fuelle Transmisión → botón 'Medidas de
          Tréboles'). Se sube a Vercel Blob y se guarda en Redis.
        </p>
      </div>

      <CatalogoImagenesManager
        slots={CATALOGO_IMAGENES}
        resolvedUrls={resolvedUrls}
        hasOverride={hasOverride}
      />
    </div>
  );
}
