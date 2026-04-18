"use client";

import { useMemo, useState } from "react";

import type { CatalogProduct } from "@/types/specparts";
import {
  type CatalogFilters,
  type Facet,
  type FilterGroup,
  type Facets,
  computeFacets,
  displayLadoLabel,
  hasActiveFilters,
} from "@/lib/catalog/filters";

type Props = {
  baseProducts: CatalogProduct[];
  filters: CatalogFilters;
  onToggle: (group: FilterGroup, value: string) => void;
  onClear: () => void;
  open: boolean;
  onClose: () => void;
};

const TOP_VISIBLE = 5;

export function FiltersSidebar({ baseProducts, filters, onToggle, onClear, open, onClose }: Props) {
  const facets = useMemo(() => computeFacets(baseProducts, filters), [baseProducts, filters]);

  const body = <FiltersBody facets={facets} filters={filters} onToggle={onToggle} onClear={onClear} />;

  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-[192px] max-h-[calc(100vh-220px)] overflow-y-auto rounded-lg border border-gray-100 bg-white">
          {body}
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-black text-[#0a2b3d]">Filtros</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-lg text-gray-500 hover:text-[#0a2b3d]"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            {body}
          </div>
        </div>
      ) : null}
    </>
  );
}

function FiltersBody({
  facets,
  filters,
  onToggle,
  onClear,
}: {
  facets: Facets;
  filters: CatalogFilters;
  onToggle: (group: FilterGroup, value: string) => void;
  onClear: () => void;
}) {
  const active = hasActiveFilters(filters);
  const modeloDisabled = filters.marca.size === 0;
  const motorDisabled = filters.modelo.size === 0;
  const anioDisabled = filters.modelo.size === 0;

  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-[#0a2b3d]">Filtros</h2>
        {active ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] font-bold text-accent hover:text-primary-dark"
          >
            Limpiar
          </button>
        ) : null}
      </div>

      <SimpleFacetGroup
        label="Línea"
        group="linea"
        facets={facets.linea}
        selected={filters.linea}
        onToggle={onToggle}
        formatLabel={titleCase}
      />
      <SimpleFacetGroup
        label="Tipo"
        group="tipo"
        facets={facets.tipo}
        selected={filters.tipo}
        onToggle={onToggle}
        formatLabel={formatTipoLabel}
      />
      <SimpleFacetGroup
        label="Ubicación"
        group="ubicacion"
        facets={facets.ubicacion}
        selected={filters.ubicacion}
        onToggle={onToggle}
        formatLabel={titleCase}
      />
      <SimpleFacetGroup
        label="Lado"
        group="lado"
        facets={facets.lado}
        selected={filters.lado}
        onToggle={onToggle}
        formatLabel={displayLadoLabel}
      />
      <SearchableFacetGroup
        label="Marca vehículo"
        group="marca"
        facets={facets.marca}
        selected={filters.marca}
        onToggle={onToggle}
        formatLabel={titleCase}
        placeholder="Buscar marca..."
      />
      <SearchableFacetGroup
        label="Modelo vehículo"
        group="modelo"
        facets={facets.modelo}
        selected={filters.modelo}
        onToggle={onToggle}
        formatLabel={titleCase}
        placeholder="Buscar modelo..."
        disabled={modeloDisabled}
        disabledHint="Elegí primero una marca"
      />
      <SearchableFacetGroup
        label="Motor"
        group="motor"
        facets={facets.motor}
        selected={filters.motor}
        onToggle={onToggle}
        formatLabel={titleCase}
        placeholder="Buscar motor..."
        disabled={motorDisabled}
        disabledHint="Elegí primero un modelo"
      />
      <SearchableFacetGroup
        label="Año"
        group="anio"
        facets={facets.anio}
        selected={filters.anio}
        onToggle={onToggle}
        formatLabel={(v) => v}
        placeholder="Buscar año..."
        disabled={anioDisabled}
        disabledHint="Elegí primero un modelo"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Simple group (sin búsqueda, sin top — muestra todo)                        */
/* -------------------------------------------------------------------------- */

function SimpleFacetGroup({
  label,
  group,
  facets,
  selected,
  onToggle,
  formatLabel,
}: {
  label: string;
  group: FilterGroup;
  facets: Facet[];
  selected: Set<string>;
  onToggle: (g: FilterGroup, v: string) => void;
  formatLabel: (v: string) => string;
}) {
  // Incluimos opciones seleccionadas aunque el count las haya filtrado a cero.
  const visible = mergeSelected(facets, selected);
  if (visible.length === 0) return null;

  return (
    <FacetSection label={label}>
      <ul className="flex flex-col gap-1.5">
        {visible.map((f) => (
          <FacetCheckbox
            key={f.value}
            facet={f}
            group={group}
            checked={selected.has(f.value)}
            label={formatLabel(f.value)}
            onToggle={onToggle}
          />
        ))}
      </ul>
    </FacetSection>
  );
}

/* -------------------------------------------------------------------------- */
/*  Searchable group (Marca, Modelo) — top 5 + Ver más + buscador              */
/* -------------------------------------------------------------------------- */

function SearchableFacetGroup({
  label,
  group,
  facets,
  selected,
  onToggle,
  formatLabel,
  placeholder,
  disabled = false,
  disabledHint,
}: {
  label: string;
  group: FilterGroup;
  facets: Facet[];
  selected: Set<string>;
  onToggle: (g: FilterGroup, v: string) => void;
  formatLabel: (v: string) => string;
  placeholder: string;
  disabled?: boolean;
  disabledHint?: string;
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  if (disabled) {
    return (
      <FacetSection label={label} disabled>
        <div className="pointer-events-none select-none">
          <input
            type="search"
            disabled
            placeholder={placeholder}
            className="mb-2 h-8 w-full rounded-md border border-gray-200 bg-gray-50 px-2 text-[11px] text-gray-300"
          />
          <ul className="flex flex-col gap-1.5 opacity-50">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  disabled
                  className="h-3.5 w-3.5 rounded border-gray-300"
                />
                <span className="h-2 flex-1 rounded bg-gray-200" />
              </li>
            ))}
          </ul>
          {disabledHint ? (
            <p className="mt-2 text-[10px] italic text-gray-400">{disabledHint}</p>
          ) : null}
        </div>
      </FacetSection>
    );
  }

  const all = mergeSelected(facets, selected);
  if (all.length === 0) {
    return (
      <FacetSection label={label}>
        <p className="text-[11px] text-gray-400">Sin opciones disponibles</p>
      </FacetSection>
    );
  }

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? all.filter((f) => f.value.toLowerCase().includes(normalized))
    : all;

  const showSearch = all.length > TOP_VISIBLE;
  const shouldCollapse = !expanded && !normalized && filtered.length > TOP_VISIBLE;
  const visible = shouldCollapse ? filtered.slice(0, TOP_VISIBLE) : filtered;
  const hiddenCount = filtered.length - visible.length;

  return (
    <FacetSection label={label}>
      {showSearch ? (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="mb-2 h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-[11px] focus:border-primary focus:outline-none"
        />
      ) : null}
      {visible.length === 0 ? (
        <p className="text-[11px] text-gray-400">Sin coincidencias</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {visible.map((f) => (
            <FacetCheckbox
              key={f.value}
              facet={f}
              group={group}
              checked={selected.has(f.value)}
              label={formatLabel(f.value)}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2 text-[11px] font-bold text-accent hover:text-primary-dark"
        >
          Ver {hiddenCount} más
        </button>
      ) : null}
      {expanded && !normalized && filtered.length > TOP_VISIBLE ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-1 text-[11px] font-bold text-gray-500 hover:text-[#0a2b3d]"
        >
          Ver menos
        </button>
      ) : null}
    </FacetSection>
  );
}

/* -------------------------------------------------------------------------- */
/*  UI primitives                                                              */
/* -------------------------------------------------------------------------- */

function FacetSection({
  label,
  children,
  disabled = false,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <details open className="group">
      <summary
        className={[
          "flex cursor-pointer items-center justify-between text-[11px] font-bold uppercase tracking-widest [&::-webkit-details-marker]:hidden",
          disabled ? "text-gray-300" : "text-gray-500",
        ].join(" ")}
      >
        <span>{label}</span>
        <span className="text-gray-400 transition group-open:rotate-180">▾</span>
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}

function FacetCheckbox({
  facet,
  group,
  checked,
  label,
  onToggle,
}: {
  facet: Facet;
  group: FilterGroup;
  checked: boolean;
  label: string;
  onToggle: (g: FilterGroup, v: string) => void;
}) {
  const disabled = !checked && facet.count === 0;
  return (
    <li>
      <label
        className={[
          "flex cursor-pointer items-center justify-between gap-2 text-xs transition",
          disabled ? "cursor-not-allowed opacity-40" : "hover:text-primary",
          checked ? "text-primary" : "text-gray-600",
        ].join(" ")}
      >
        <span className="flex items-center gap-2 truncate">
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={() => onToggle(group, facet.value)}
            className="h-3.5 w-3.5 rounded border-gray-300 text-primary accent-[color:var(--color-primary-value,#00549F)] focus:ring-primary/30"
          />
          <span className="truncate">{label}</span>
        </span>
        <span className="flex-shrink-0 text-[10px] text-gray-400">({facet.count})</span>
      </label>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Incluye las selecciones en la lista de facets aunque el count sea 0. */
function mergeSelected(facets: Facet[], selected: Set<string>): Facet[] {
  const present = new Set(facets.map((f) => f.value));
  const merged = [...facets];
  for (const v of selected) {
    if (!present.has(v)) merged.push({ value: v, count: 0 });
  }
  return merged.sort((a, b) => a.value.localeCompare(b.value, "es"));
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function formatTipoLabel(v: string): string {
  if (v === "kit") return "Kit";
  if (v === "fuelle") return "Fuelle";
  if (v === "tope") return "Tope";
  return titleCase(v);
}
