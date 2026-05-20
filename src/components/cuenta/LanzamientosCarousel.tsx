"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";

import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import type { Novedad } from "@/lib/novedades";

const PAGE_SIZE = 3;

type Props = {
  items: Novedad[];
};

/**
 * Carrusel de últimos lanzamientos para el resumen del portal B2B.
 * Muestra 3 cards a la vez con flechas para avanzar/retroceder de a 3.
 *
 * Cada card replica el diseño de NovedadCard (fecha, ubicación, vehículos)
 * y agrega un AddToCartButton para el flujo B2B.
 */
export function LanzamientosCarousel({ items }: Props) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const visible = items.slice(start, start + PAGE_SIZE);

  if (items.length === 0) return null;

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <section className="space-y-3">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[#0a2b3d]">
            Últimos lanzamientos
          </h2>
          <p className="text-xs text-gray-500">
            Productos nuevos al catálogo. Sumalos a tu próximo pedido.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href="/novedades/lanzamientos"
            className="hidden sm:inline text-xs font-bold text-primary hover:text-primary/80 mr-2"
          >
            Ver todos →
          </Link>
          {totalPages > 1 ? (
            <>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={!canPrev}
                aria-label="Anteriores"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                ‹
              </button>
              <span className="text-xs text-gray-500 tabular-nums px-1">
                {page + 1}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={!canNext}
                aria-label="Siguientes"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                ›
              </button>
            </>
          ) : null}
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((n) => (
          <LanzamientoCard key={n.code} novedad={n} />
        ))}
      </div>
    </section>
  );
}

function LanzamientoCard({ novedad }: { novedad: Novedad }) {
  const detalleHref = novedad.destacadoSlug
    ? `/productos/${novedad.destacadoSlug}`
    : `/catalogo/${novedad.catalogoSlug}`;

  const fecha = formatFecha(novedad);

  // Vehículos: hasta 3 marcas con sus modelos
  const grouped = groupByBrand(novedad.vehiculos);
  const shownBrands = grouped.slice(0, 3);
  const hiddenCount =
    novedad.vehiculos.length -
    shownBrands.reduce((acc, g) => acc + g.models.length, 0);

  return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      {/* Header: badge + fecha */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary text-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
          <SparkIcon />
          Lanzamiento
        </span>
        {fecha ? (
          <time className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
            {fecha}
          </time>
        ) : null}
      </div>

      {/* Imagen + info principal inline */}
      <div className="flex gap-3 px-4 pt-1 pb-3">
        {novedad.imagen ? (
          <div className="w-24 h-24 shrink-0 bg-gray-50 rounded-lg p-2 flex items-center justify-center">
            <img
              src={novedad.imagen}
              alt={novedad.titulo}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          </div>
        ) : null}
        <div className="flex-1 min-w-0">
          <Link href={detalleHref} className="block hover:underline">
            <p className="font-mono text-base font-black text-primary leading-none">
              {novedad.code}
            </p>
            <h3 className="mt-1 font-bold text-sm text-[#0a2b3d] leading-tight uppercase line-clamp-2">
              {novedad.titulo}
            </h3>
          </Link>
          {novedad.linea ? (
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-accent font-bold">
              {novedad.linea}
            </p>
          ) : null}
          <div className="mt-1 space-y-0.5 text-xs text-gray-600">
            {novedad.ubicaciones.length > 0 ? (
              <p>
                <span className="font-semibold">Ubicación:</span>{" "}
                {novedad.ubicaciones.join(" · ")}
              </p>
            ) : null}
            {novedad.lados.length > 0 ? (
              <p>
                <span className="font-semibold">Lado:</span>{" "}
                {novedad.lados.join(" · ")}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Vehículos compatibles */}
      {grouped.length > 0 ? (
        <div className="px-4 pb-3 pt-2 border-t border-gray-100">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
            Vehículos compatibles
          </p>
          <ul className="flex flex-wrap gap-1">
            {shownBrands.map((g) => (
              <li
                key={g.brand}
                className="inline-flex items-start gap-1 text-xs bg-gray-100 rounded-md px-2 py-1 max-w-full"
              >
                <span className="font-bold text-[#0a2b3d] shrink-0">
                  {g.brand}
                </span>
                <span className="text-gray-600 truncate">
                  ({g.models.slice(0, 3).join(" · ")}
                  {g.models.length > 3 ? ` +${g.models.length - 3}` : ""})
                </span>
              </li>
            ))}
            {hiddenCount > 0 ? (
              <li className="text-xs text-primary font-bold bg-primary/5 rounded-md px-2 py-1">
                +{hiddenCount} más
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}

      {/* Footer: agregar al carrito + ver en catálogo */}
      <div className="px-4 pb-3 pt-2 mt-auto flex items-center justify-between gap-2 border-t border-gray-100">
        <AddToCartButton
          productCode={novedad.code}
          slug={novedad.catalogoSlug}
          name={novedad.titulo}
          image={novedad.imagen ?? undefined}
          compact
        />
        <Link
          href={detalleHref}
          className="text-xs text-primary font-bold hover:underline whitespace-nowrap"
        >
          Ver →
        </Link>
      </div>
    </article>
  );
}

function formatFecha(n: { fecha: Date; fechaMes: string | null }): string {
  if (n.fechaMes) {
    const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    const [y, m] = n.fechaMes.split("-");
    const idx = parseInt(m, 10) - 1;
    return `${meses[idx] ?? m}-${y.slice(-2)}`;
  }
  return n.fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function groupByBrand(vehicles: Novedad["vehiculos"]) {
  const map = new Map<string, Set<string>>();
  for (const v of vehicles) {
    if (!v.brand) continue;
    const brand = v.brand.toUpperCase();
    const model = (v.master_model || v.model || "").trim();
    if (!model) continue;
    if (!map.has(brand)) map.set(brand, new Set());
    map.get(brand)!.add(model);
  }
  return Array.from(map.entries())
    .map(([brand, models]) => ({
      brand,
      models: Array.from(models).sort(),
    }))
    .sort((a, b) => b.models.length - a.models.length);
}

function SparkIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 2z" />
    </svg>
  );
}

