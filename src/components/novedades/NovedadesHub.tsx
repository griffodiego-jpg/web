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
    <div className="container mx-auto max-w-6xl px-5 pt-5 pb-14">
      {/* Tabs (sin título — el menú activo ya dice "Novedades") */}
      <div className="flex items-start gap-1 border-b border-gray-200 mb-5 overflow-x-auto">
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
          sublabel="de nuevos productos"
          count={counts.lanzamiento}
        />
        <Tab
          active={filtro === "aplicacion"}
          onClick={() => setFiltro("aplicacion")}
          label="Nuevas aplicaciones"
          sublabel="de productos existentes"
          count={counts.aplicacion}
        />
      </div>

      {/* Grid — 3 columnas en desktop para que entren más por pantalla */}
      {filtered.length === 0 ? (
        <EmptyState filtro={filtro} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
  sublabel,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sublabel?: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 text-left border-b-2 transition cursor-pointer whitespace-nowrap ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      <span className="flex items-center gap-2">
        <span className="text-sm font-bold">{label}</span>
        <span
          className={`text-[10px] rounded-full px-2 py-0.5 ${
            active ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {count}
        </span>
      </span>
      {sublabel && (
        <span className="block text-[10px] text-gray-400 font-normal normal-case">
          {sublabel}
        </span>
      )}
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
