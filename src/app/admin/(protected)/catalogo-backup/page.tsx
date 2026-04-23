import type { Metadata } from "next";

import { CatalogBackupAdmin } from "@/components/admin/CatalogBackupAdmin";
import { readSnapshots } from "@/lib/catalog-backup";

export const metadata: Metadata = { title: "Backup del catálogo" };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CatalogoBackupPage() {
  const snapshots = await readSnapshots();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-[#0a2b3d]">Backup del catálogo</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">
          Snapshot diario del catálogo completo de SpecParts. Se genera
          solo todos los días a las 4am (hora UTC) y guarda los últimos 30
          días. También podés descargar el último (JSON crudo + Excel con
          3 hojas: Productos, Vehículos, Atributos) o regenerar a mano si
          SpecParts tuvo cambios importantes y no querés esperar al cron.
        </p>
        <p className="mt-2 max-w-3xl text-xs italic text-gray-500">
          Fallback automático: si un día SpecParts no responde, el catálogo
          público sirve el último snapshot de acá. No se cae el sitio.
        </p>
      </header>

      <CatalogBackupAdmin initialSnapshots={snapshots} />
    </div>
  );
}
