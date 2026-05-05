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
 * Cada card linkea al detalle del producto y trae un AddToCartButton
 * inline (mismo flujo que el catálogo público — agrega al carrito B2B).
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

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:border-primary/40 hover:shadow-sm">
      <Link href={detalleHref} className="block">
        <div className="relative aspect-[4/3] bg-gray-50">
          {novedad.imagen ? (
            <img
              src={novedad.imagen}
              alt={novedad.titulo}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-3"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300">
              Sin imagen
            </div>
          )}
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
            Lanzamiento
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={detalleHref} className="block">
          <p className="font-mono text-base font-black text-primary">
            {novedad.code}
          </p>
          <p className="line-clamp-2 text-sm font-medium text-[#0a2b3d] group-hover:underline">
            {novedad.titulo}
          </p>
        </Link>
        {novedad.linea ? (
          <span className="self-start rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-dark">
            {novedad.linea}
          </span>
        ) : null}
        <div className="mt-auto pt-1">
          <AddToCartButton
            productCode={novedad.code}
            slug={novedad.catalogoSlug}
            name={novedad.titulo}
            image={novedad.imagen ?? undefined}
            compact
          />
        </div>
      </div>
    </article>
  );
}
