import Link from "next/link";

import type { CatalogProduct } from "@/types/specparts";
import { getMercadoLibreUrl } from "@/lib/catalog/utils";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.pictures?.[0]?.image_url;
  const meliUrl = getMercadoLibreUrl(product);
  const vehicleCount = product.vehicles?.length ?? 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white transition hover:border-accent hover:shadow-md">
      <Link href={`/catalogo/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
          {primaryImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={primaryImage}
              alt={product.description || product.product}
              loading="lazy"
              className="h-full w-full object-contain p-2 transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              Sin imagen
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3">
          <span className="text-base font-black text-primary">{product.code}</span>
          <span className="text-xs font-semibold text-[#0a2b3d] line-clamp-2 min-h-[2.5em]">
            {product.product}
          </span>
          {vehicleCount > 0 ? (
            <span className="mt-auto pt-1 text-[10px] font-bold uppercase tracking-wide text-accent">
              {vehicleCount} {vehicleCount === 1 ? "vehículo" : "vehículos"}
            </span>
          ) : null}
        </div>
      </Link>

      {meliUrl ? (
        <a
          href={meliUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block border-t border-gray-100 bg-[#FFE600] px-3 py-1.5 text-center text-[11px] font-bold text-[#333] transition hover:brightness-95"
        >
          MercadoLibre ↗
        </a>
      ) : null}
    </article>
  );
}
