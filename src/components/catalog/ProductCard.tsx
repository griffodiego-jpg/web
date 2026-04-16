"use client";

import { useState } from "react";
import Link from "next/link";

import type { CatalogProduct, SpecPartsVehicle } from "@/types/specparts";
import { getAttrValue, getMercadoLibreUrl } from "@/lib/catalog/utils";

type ProductCardProps = {
  product: CatalogProduct;
};

const VISIBLE_VEHICLES = 3;

export function ProductCard({ product }: ProductCardProps) {
  const [expanded, setExpanded] = useState(false);

  const primaryImage = product.pictures?.[0]?.image_url;
  const meliUrl = getMercadoLibreUrl(product);

  const location = getAttrValue(product, "ubicaci");
  const sideRaw = getAttrValue(product, "lado");
  const side = sideRaw && sideRaw !== location ? sideRaw : "";

  const vehicles = product.vehicles ?? [];
  const visible = expanded ? vehicles : vehicles.slice(0, VISIBLE_VEHICLES);
  const hiddenCount = Math.max(0, vehicles.length - VISIBLE_VEHICLES);

  const detailHref = `/catalogo/${product.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white transition hover:border-accent hover:shadow-md">
      <Link href={detailHref} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
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
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-lg font-black leading-none text-primary">{product.code}</span>
          </div>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[#0a2b3d] line-clamp-2">
            {product.product}
          </p>
        </Link>

        {location || side ? (
          <dl className="flex flex-col gap-0.5 text-[11px] text-gray-600">
            {location ? (
              <div className="flex gap-1">
                <dt className="font-semibold text-gray-500">Ubicación:</dt>
                <dd className="font-semibold text-[#0a2b3d]">{location}</dd>
              </div>
            ) : null}
            {side ? (
              <div className="flex gap-1">
                <dt className="font-semibold text-gray-500">Lado:</dt>
                <dd className="font-semibold text-[#0a2b3d]">{side}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        {vehicles.length > 0 ? (
          <div className="mt-1 flex flex-col gap-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
              {vehicles.length} {vehicles.length === 1 ? "vehículo" : "vehículos"} compatibles
            </p>
            <ul className="flex flex-col gap-0.5 text-[11px] text-gray-600">
              {visible.map((v, i) => (
                <li key={`${v.brand}-${v.model}-${i}`} className="truncate">
                  <VehicleLine v={v} />
                </li>
              ))}
            </ul>
            {hiddenCount > 0 ? (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                aria-expanded={expanded}
                className="self-start text-[11px] font-bold text-accent hover:text-primary-dark"
              >
                {expanded ? "Ver menos" : `Ver más (${hiddenCount})`}
              </button>
            ) : null}
          </div>
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
  );
}

function VehicleLine({ v }: { v: SpecPartsVehicle }) {
  const model = v.master_model || v.model;
  const version = v.version ? ` ${v.version}` : "";
  const years =
    v.sold_from_year && v.sold_until_year
      ? ` ${v.sold_from_year}-${v.sold_until_year}`
      : v.sold_from_year
        ? ` ${v.sold_from_year}`
        : "";
  return (
    <span>
      <span className="font-bold text-[#0a2b3d]">{v.brand}</span> {model}
      <span className="text-gray-500">
        {version}
        {years}
      </span>
    </span>
  );
}
