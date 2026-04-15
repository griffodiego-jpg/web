"use client";

import { useMemo, useState } from "react";
import {
  distribuidores,
  listarProvincias,
  type Distribuidor,
} from "@/data/distribuidores";

const TODAS = "__todas__";

type SortKey = "nombre" | "telefono" | "email" | "provincia";
type SortDir = "asc" | "desc";

export default function DistribuidoresPage() {
  const [provincia, setProvincia] = useState<string>(TODAS);
  const [sortKey, setSortKey] = useState<SortKey>("nombre");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const provincias = useMemo(() => listarProvincias(), []);

  const filtrados = useMemo(() => {
    const base =
      provincia === TODAS
        ? distribuidores
        : distribuidores.filter((d) => d.provinciasFiltro.includes(provincia));
    // Orden estable por la columna seleccionada
    const sorted = [...base].sort((a, b) => {
      const va = a[sortKey].toLocaleLowerCase("es");
      const vb = b[sortKey].toLocaleLowerCase("es");
      return va.localeCompare(vb, "es");
    });
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [provincia, sortKey, sortDir]);

  /** Cambia la columna de ordenamiento. Si es la misma, alterna dirección. */
  function onSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <section className="container mx-auto max-w-6xl px-5 pt-10 pb-16">
      {/* Selector de provincia */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <label
          htmlFor="provincia"
          className="font-bold text-[#0a2b3d] text-lg"
        >
          Encontrá tu distribuidor más cercano
        </label>
        <div className="relative sm:ml-auto sm:min-w-[280px]">
          <select
            id="provincia"
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
            className="w-full appearance-none cursor-pointer bg-white border-2 border-primary rounded-lg py-3 pl-4 pr-10 text-[#0a2b3d] font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value={TODAS}>Todas las provincias</option>
            {provincias.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Resultados */}
      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">
            No se encontraron distribuidores para{" "}
            <strong>{provincia}</strong>.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop: tabla con columnas ordenables */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <SortableTh
                    label="Nombre"
                    sortKey="nombre"
                    active={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                  />
                  <SortableTh
                    label="Teléfono"
                    sortKey="telefono"
                    active={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                  />
                  <SortableTh
                    label="Email"
                    sortKey="email"
                    active={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                  />
                  <SortableTh
                    label="Ubicación"
                    sortKey="provincia"
                    active={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                  />
                </tr>
              </thead>
              <tbody>
                {filtrados.map((d, i) => (
                  <tr
                    key={`${d.nombre}-${i}`}
                    className="border-t border-gray-200 hover:bg-gray-50 transition"
                  >
                    <Td className="font-bold text-[#0a2b3d] align-top">
                      {d.nombre}
                    </Td>
                    <Td className="align-top">
                      <a
                        href={`tel:${d.telefono.replace(/[^0-9+]/g, "")}`}
                        className="text-primary hover:underline"
                      >
                        {d.telefono}
                      </a>
                    </Td>
                    <Td className="align-top">
                      <a
                        href={`mailto:${d.email}`}
                        className="text-primary hover:underline break-all"
                      >
                        {d.email}
                      </a>
                    </Td>
                    <Td className="align-top text-gray-700">{d.provincia}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="md:hidden space-y-4">
            {filtrados.map((d, i) => (
              <DistribuidorCard key={`${d.nombre}-${i}`} d={d} />
            ))}
          </ul>

          <p className="mt-6 text-sm text-gray-500">
            {filtrados.length}{" "}
            {filtrados.length === 1 ? "distribuidor" : "distribuidores"}
            {provincia !== TODAS ? (
              <>
                {" "}que entregan en <strong>{provincia}</strong>
              </>
            ) : (
              <> en total</>
            )}
          </p>
        </>
      )}
    </section>
  );
}

/**
 * Encabezado de columna clickeable. Muestra una flechita al lado del
 * título indicando dirección cuando esa columna está activa.
 */
function SortableTh({
  label,
  sortKey,
  active,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  active: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const isActive = active === sortKey;
  return (
    <th className="text-left px-4 py-3 text-sm font-bold uppercase tracking-wide">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer"
        aria-sort={
          isActive ? (dir === "asc" ? "ascending" : "descending") : "none"
        }
      >
        <span>{label}</span>
        <SortIcon active={isActive} dir={dir} />
      </button>
    </th>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    // Flechita doble gris tenue cuando no está activa
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="opacity-40"
        aria-hidden
      >
        <path d="M7 10l5-5 5 5H7zm0 4l5 5 5-5H7z" />
      </svg>
    );
  }
  // Flechita única apuntando en la dirección del orden
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      {dir === "asc" ? (
        <path d="M7 14l5-5 5 5H7z" />
      ) : (
        <path d="M7 10l5 5 5-5H7z" />
      )}
    </svg>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function DistribuidorCard({ d }: { d: Distribuidor }) {
  return (
    <li className="border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="font-black text-[#0a2b3d] text-lg">{d.nombre}</h3>
      <p className="text-sm text-gray-500 uppercase tracking-wide">
        {d.provincia}
      </p>
      <div className="mt-3 space-y-1.5 text-sm">
        <p>
          <strong className="text-gray-700">Tel: </strong>
          <a
            href={`tel:${d.telefono.replace(/[^0-9+]/g, "")}`}
            className="text-primary hover:underline"
          >
            {d.telefono}
          </a>
        </p>
        <p>
          <strong className="text-gray-700">Email: </strong>
          <a
            href={`mailto:${d.email}`}
            className="text-primary hover:underline break-all"
          >
            {d.email}
          </a>
        </p>
      </div>
    </li>
  );
}
