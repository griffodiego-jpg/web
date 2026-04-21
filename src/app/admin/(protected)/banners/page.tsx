import type { Metadata } from "next";
import { BannersAdmin } from "@/components/admin/BannersAdmin";
import { listBanners } from "@/lib/banners-store";
import { getRedis } from "@/lib/kv";

export const metadata: Metadata = {
  title: "Banners",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminBannersPage() {
  const redisAvailable = getRedis() !== null;
  const banners = redisAvailable ? await listBanners() : [];

  return (
    <div>
      <h1 className="text-3xl font-black text-[#0a2b3d]">Banners</h1>
      <p className="mt-2 text-sm text-gray-500 max-w-3xl">
        Carousel del home. Podés sumar imágenes, videos o el buscador de
        patente — aparecen rotando uno por uno. Arrastrá para reordenar,
        desactivá sin borrar, o reemplazá el archivo cuando quieras.
      </p>

      {!redisAvailable && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">Persistencia no configurada</p>
          <p className="mt-1">
            Falta conectar Upstash Redis. Los banners se guardan bajo la
            clave <code>banners:list</code>.
          </p>
        </div>
      )}

      <div className="mt-8">
        <BannersAdmin initial={banners} />
      </div>
    </div>
  );
}
