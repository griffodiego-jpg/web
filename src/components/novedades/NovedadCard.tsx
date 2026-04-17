"use client";

import Link from "next/link";
import { useState } from "react";
import { AssetImage } from "@/components/AssetImage";
import { VehiclesModal } from "@/components/catalog/VehiclesModal";
import { vehicleKey, type Novedad } from "@/lib/novedades";

/**
 * Card de novedad — compacta, optimizada para entrar más de 2 por pantalla.
 * Muestra hasta ~3-4 marcas agrupadas con sus modelos; si hay más, botón
 * "Ver más" abre un modal con el listado completo.
 *
 * CTA único: "Ver en catálogo" que va a /productos/[slug] si es destacado
 * o a /catalogo/[slug] si no.
 */
export function NovedadCard({ novedad }: { novedad: Novedad }) {
  const [modalOpen, setModalOpen] = useState(false);

  const detalleHref = novedad.destacadoSlug
    ? `/productos/${novedad.destacadoSlug}`
    : `/catalogo/${novedad.catalogoSlug}`;

  const nuevosSet = new Set(novedad.nuevosVehiculos);
  const grouped = groupByBrand(novedad.vehiculos, nuevosSet);
  const maxBrands = 4;
  const shownBrands = grouped.slice(0, maxBrands);
  const hiddenBrandsCount = grouped.length - shownBrands.length;

  return (
    <>
      <article className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
        {/* Header: badge + fecha */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <TipoBadge tipo={novedad.tipo} />
          <time
            className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide"
            dateTime={novedad.fecha.toISOString()}
          >
            {formatFecha(novedad.fecha)}
          </time>
        </div>

        <div className="flex gap-3 px-4 pt-1 pb-3">
          {/* Imagen chica */}
          {novedad.imagen && (
            <div className="w-24 h-24 shrink-0 bg-gray-50 rounded-lg p-2 flex items-center justify-center">
              <AssetImage
                src={novedad.imagen}
                alt={novedad.titulo}
                bare
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}

          {/* Info principal */}
          <div className="flex-1 min-w-0">
            <p className="text-primary font-mono font-black text-lg leading-none">
              {novedad.code}
            </p>
            <h3 className="mt-1 font-bold text-sm text-[#0a2b3d] leading-tight uppercase">
              {novedad.titulo}
            </h3>
            {novedad.linea && (
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-accent font-bold">
                {novedad.linea}
              </p>
            )}
            {/* Ubicación / Lado — inline, solo primero de cada */}
            <div className="mt-1 space-y-0.5 text-xs text-gray-600">
              {novedad.ubicaciones.length > 0 && (
                <p>
                  <span className="font-semibold">Ubicación:</span>{" "}
                  {novedad.ubicaciones.join(" · ")}
                </p>
              )}
              {novedad.lados.length > 0 && (
                <p>
                  <span className="font-semibold">Lado:</span>{" "}
                  {novedad.lados.join(" · ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Vehículos */}
        {grouped.length > 0 && (
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
                    ({g.models.slice(0, 3).map((m) => m.name).join(" · ")}
                    {g.models.length > 3 ? ` +${g.models.length - 3}` : ""})
                  </span>
                </li>
              ))}
              {hiddenBrandsCount > 0 && (
                <li>
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs text-primary font-bold bg-primary/5 hover:bg-primary/10 rounded-md px-2 py-1 cursor-pointer transition"
                  >
                    + Ver {novedad.vehiculos.length - shownBrandsVehicleCount(shownBrands)}{" "}
                    más
                  </button>
                </li>
              )}
              {hiddenBrandsCount === 0 && totalTruncatedModels(shownBrands) > 0 && (
                <li>
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs text-primary font-bold bg-primary/5 hover:bg-primary/10 rounded-md px-2 py-1 cursor-pointer transition"
                  >
                    Ver todos ({novedad.vehiculos.length})
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="px-4 pb-3 mt-auto">
          <Link
            href={detalleHref}
            className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:gap-2 transition-all"
          >
            Ver en catálogo
            <ArrowIcon />
          </Link>
        </div>
      </article>

      <VehiclesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        productCode={novedad.code}
        productName={novedad.titulo}
        vehicles={novedad.vehiculos.map((v) => ({
          brand: v.brand,
          master_model: v.master_model,
          model: v.model,
          version: v.version,
          sold_from_year: v.sold_from_year ?? 0,
          sold_until_year: v.sold_until_year ?? 0,
        }))}
        nuevosKeys={novedad.nuevosVehiculos}
      />
    </>
  );
}

function TipoBadge({ tipo }: { tipo: "lanzamiento" | "aplicacion" }) {
  if (tipo === "lanzamiento") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary text-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
        <SparkIcon />
        Lanzamiento
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent text-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
      <CarIcon />
      Nueva aplicación
    </span>
  );
}

type GroupedBrand = {
  brand: string;
  models: { name: string; isNew: boolean }[];
  hasNuevo: boolean;
};

function groupByBrand(
  vehicles: Novedad["vehiculos"],
  nuevosSet: Set<string>
): GroupedBrand[] {
  const map = new Map<string, Map<string, boolean>>();
  for (const v of vehicles) {
    if (!v.brand) continue;
    const brand = v.brand.toUpperCase();
    const label = (v.master_model || v.model || "").trim();
    if (!label) continue;
    const key = vehicleKey(v);
    const isNew = nuevosSet.has(key);
    if (!map.has(brand)) map.set(brand, new Map());
    const models = map.get(brand)!;
    // Si ya estaba, quedamos con el "más nuevo" (OR).
    models.set(label, (models.get(label) ?? false) || isNew);
  }
  return Array.from(map.entries())
    .map(([brand, models]) => {
      const arr = Array.from(models.entries())
        .map(([name, isNew]) => ({ name, isNew }))
        .sort((a, b) => {
          if (a.isNew !== b.isNew) return a.isNew ? -1 : 1; // nuevos primero
          return a.name.localeCompare(b.name);
        });
      return {
        brand,
        models: arr,
        hasNuevo: arr.some((m) => m.isNew),
      };
    })
    .sort((a, b) => {
      if (a.hasNuevo !== b.hasNuevo) return a.hasNuevo ? -1 : 1; // marcas con nuevos primero
      return b.models.length - a.models.length;
    });
}

function shownBrandsVehicleCount(brands: GroupedBrand[]) {
  return brands.reduce((acc, b) => acc + b.models.length, 0);
}

function totalTruncatedModels(brands: GroupedBrand[]) {
  return brands.reduce(
    (acc, b) => acc + Math.max(0, b.models.length - 3),
    0
  );
}

function formatFecha(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 2z" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h.5A1.5 1.5 0 0 1 21 12.5v4a1.5 1.5 0 0 1-1.5 1.5H19v1a1 1 0 0 1-2 0v-1H7v1a1 1 0 0 1-2 0v-1h-.5A1.5 1.5 0 0 1 3 16.5v-4A1.5 1.5 0 0 1 4.5 11H5zm2.1 0h9.8l-1-3H8.1l-1 3zm-.6 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm11 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
    </svg>
  );
}
