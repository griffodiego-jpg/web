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
    <article className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={`/catalogo/${product.slug}`}
        className="flex flex-1 flex-col gap-3 p-4 focus-visible:outline-none"
      >
        {primaryImage ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primaryImage}
              alt={product.description || product.product}
              loading="lazy"
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-gray-50 text-xs text-gray-400">
            Sin imagen
          </div>
        )}

        <div className="flex flex-1 flex-col gap-1">
          <span className="text-lg font-black text-primary">{product.code}</span>
          <span className="text-sm font-semibold text-[#0a2b3d] line-clamp-2">
            {product.product}
          </span>
          {product.description ? (
            <span className="text-xs text-gray-500 line-clamp-2">{product.description}</span>
          ) : null}
          {vehicleCount > 0 ? (
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
              {vehicleCount} {vehicleCount === 1 ? "vehículo" : "vehículos"} compatibles
            </span>
          ) : null}
        </div>

        <span className="mt-auto text-xs font-bold text-accent">Ver detalle →</span>
      </Link>

      {meliUrl ? (
        <a
          href={meliUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block border-t border-gray-100 bg-[#FFE600] px-3 py-2 text-center text-xs font-bold text-[#333] transition hover:brightness-95"
        >
          Comprar en MercadoLibre ↗
        </a>
      ) : null}
    </article>
  );
}
