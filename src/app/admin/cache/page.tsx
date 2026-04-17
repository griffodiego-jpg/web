import type { Metadata } from "next";

import { CacheWarmer } from "@/components/admin/CacheWarmer";
import { listCatalog } from "@/lib/api/specparts";

export const metadata: Metadata = {
  title: "Cache de imágenes",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Tamaños que pedimos en la app (ver sizes= de ProductCard + ProductGallery).
// Pre-calentamos los más usados: card grid (~400px mobile / ~640px desktop)
// y galería de detalle (~1080px).
const WARM_WIDTHS = [640, 1080];

export default async function CachePage() {
  let imageUrls: string[] = [];
  let error: string | null = null;

  try {
    const products = await listCatalog();
    const set = new Set<string>();
    for (const p of products) {
      for (const pic of p.pictures ?? []) {
        if (pic.image_url) set.add(pic.image_url);
      }
    }
    imageUrls = Array.from(set);
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar el catálogo";
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-[#0a2b3d]">Cache de imágenes</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Fuerza a Vercel a procesar todas las imágenes del catálogo
          (AVIF/WebP) y dejarlas en cache del CDN. Así el primer visitante no
          espera mientras se optimizan las fotos.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No se pudo cargar la información: {error}
        </div>
      ) : (
        <CacheWarmer imageUrls={imageUrls} widths={WARM_WIDTHS} />
      )}
    </div>
  );
}
