"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Novedad, TipoNovedad } from "@/lib/novedades";
import { NovedadCard } from "./NovedadCard";

type Filtro = "todas" | TipoNovedad;

/**
 * Hub de novedades con tabs (Todas / Lanzamientos / Nuevas aplicaciones)
 * y grid de cards. Mismo componente en las 3 rutas públicas — el
 * `initialTipo` decide cuál filtro arranca activo.
 */
export function NovedadesHub({
  novedades,
  initialTipo,
}: {
  novedades: Novedad[];
  initialTipo: Filtro;
}) {
  const [filtro, setFiltro] = useState<Filtro>(initialTipo);

  const counts = useMemo(() => {
    return {
      todas: novedades.length,
      lanzamiento: novedades.filter((n) => n.tipo === "lanzamiento").length,
      aplicacion: novedades.filter((n) => n.tipo === "aplicacion").length,
    };
  }, [novedades]);

  const filtered = useMemo(() => {
    if (filtro === "todas") return novedades;
    return novedades.filter((n) => n.tipo === filtro);
  }, [novedades, filtro]);

  return (
    <div className="container mx-auto max-w-6xl px-5 pt-8 pb-16">
      {/* Header */}
      <div className="border-l-4 border-accent pl-4 mb-6">
        <h1 className="text-2xl lg:text-3xl font-black text-[#0a2b3d] uppercase tracking-tight">
          Novedades
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Lanzamientos y nuevas aplicaciones de productos Griffo.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        <Tab
          active={filtro === "todas"}
          onClick={() => setFiltro("todas")}
          label="Todas"
          count={counts.todas}
        />
        <Tab
          active={filtro === "lanzamiento"}
          onClick={() => setFiltro("lanzamiento")}
          label="Lanzamientos"
          count={counts.lanzamiento}
        />
        <Tab
          active={filtro === "aplicacion"}
          onClick={() => setFiltro("aplicacion")}
          label="Nuevas aplicaciones"
          count={counts.aplicacion}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState filtro={filtro} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((n) => (
            <NovedadCard key={n.code} novedad={n} />
          ))}
        </div>
      )}
    </div>
  );
}

function Tab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 text-sm font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
      <span
        className={`ml-2 text-xs rounded-full px-2 py-0.5 ${
          active ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function EmptyState({ filtro }: { filtro: Filtro }) {
  const label =
    filtro === "lanzamiento"
      ? "lanzamientos"
      : filtro === "aplicacion"
        ? "nuevas aplicaciones"
        : "novedades";

  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
      <p className="text-sm text-gray-500">
        Todavía no hay {label} publicadas.
      </p>
      <Link
        href="/catalogo"
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary font-bold hover:gap-2 transition-all"
      >
        Explorar el catálogo
        <svg
          width="14"
          height="14"
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
      </Link>
    </div>
  );
}
