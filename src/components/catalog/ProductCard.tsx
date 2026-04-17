"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { CatalogProduct, SpecPartsVehicle } from "@/types/specparts";
import { getFeaturedSlug } from "@/data/featured-products";
import { getMercadoLibreUrl } from "@/lib/catalog/utils";
import { getDisplayApplication } from "@/lib/catalog/display";

import { VehiclesModal } from "./VehiclesModal";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const primaryImage = product.pictures?.[0]?.image_url;
  const meliUrl = getMercadoLibreUrl(product);

  const { ubicaciones, lados } = getDisplayApplication(product);
  const locationText = ubicaciones.join(", ");
  const sideText = lados.join(lados.length === 2 ? " y " : ", ");

  const vehicles = product.vehicles ?? [];
  const vehicleSummary = useMemo(() => buildVehicleSummary(vehicles), [vehicles]);

  const featuredSlug = getFeaturedSlug(product.code);
  const detailHref = featuredSlug
    ? `/productos/${featuredSlug}`
    : `/catalogo/${product.slug}`;

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white transition hover:border-accent hover:shadow-md">
        <Link href={detailHref} className="block">
          <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
            {featuredSlug ? (
              <span className="absolute left-2 top-2 z-10 rounded bg-primary px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white shadow-sm">
                Destacado
              </span>
            ) : null}
            {primaryImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={primaryImage}
                alt={product.description || product.product}
                loading="lazy"
                className="h-full w-full object-contain p-3 transition group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                Sin imagen
              </div>
            )}
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-2 p-3">
          <Link href={detailHref} className="block">
            <span className="text-lg font-black leading-none text-primary">{product.code}</span>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[#0a2b3d] line-clamp-2">
              {product.product}
            </p>
          </Link>

          {vehicleSummary.length > 0 ? (
            <p className="text-[11px] leading-snug text-gray-600 line-clamp-4">
              <span className="font-semibold text-gray-500">Descripción: </span>
              {vehicleSummary.map((entry, i) => (
                <span key={entry.brand}>
                  <strong className="font-bold text-[#0a2b3d]">{entry.brand}</strong>
                  {` (${entry.models.join(" - ")})`}
                  {i < vehicleSummary.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          ) : null}

          {locationText ? (
            <p className="text-[11px] text-gray-600">
              <span className="font-semibold text-gray-500">Ubicación: </span>
              <span className="font-semibold text-[#0a2b3d]">{locationText}</span>
            </p>
          ) : null}
          {sideText ? (
            <p className="text-[11px] text-gray-600">
              <span className="font-semibold text-gray-500">Lado: </span>
              <span className="font-semibold text-[#0a2b3d]">{sideText}</span>
            </p>
          ) : null}

          {vehicles.length > 0 ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-1 self-start text-[11px] font-bold text-accent hover:text-primary-dark"
            >
              Ver {vehicles.length} {vehicles.length === 1 ? "vehículo" : "vehículos"} compatibles →
            </button>
          ) : null}

          <Link
            href={detailHref}
            className="mt-auto pt-2 text-[11px] font-bold text-primary hover:text-primary-dark"
          >
            Ver detalle →
          </Link>
        </div>

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

      <VehiclesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        productCode={product.code}
        productName={product.product}
        vehicles={vehicles}
      />
    </>
  );
}

type BrandSummary = { brand: string; models: string[] };

/**
 * Resumen compacto de vehículos: agrupa por marca y devuelve los modelos únicos.
 * Reproduce el formato del sitio anterior de Griffo para renderizar luego como
 * "FORD (KUGA - RANGER), CHEVROLET (S-10)" con la marca en negrita.
 */
function buildVehicleSummary(vehicles: SpecPartsVehicle[]): BrandSummary[] {
  if (!vehicles.length) return [];

  const byBrand = new Map<string, Set<string>>();
  for (const v of vehicles) {
    const brand = (v.brand || "").trim().toUpperCase();
    if (!brand) continue;
    const model = (v.master_model || v.model || "").trim().toUpperCase();
    if (!model) continue;
    if (!byBrand.has(brand)) byBrand.set(brand, new Set());
    byBrand.get(brand)!.add(model);
  }

  return Array.from(byBrand.entries()).map(([brand, models]) => ({
    brand,
    models: Array.from(models).sort(),
  }));
}
