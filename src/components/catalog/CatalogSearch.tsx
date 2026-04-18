"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { CatalogProduct, SpecPartsPlateResponse } from "@/types/specparts";
import {
  buildMeasureRows,
  buildVehicleTree,
  filterByPlateVehicle,
  indexProducts,
  searchByCode,
  searchByKeyword,
  searchByVehicle,
  type MeasureRow,
  type MeasureType,
} from "@/lib/catalog/utils";
import {
  applyFilters,
  countActiveFilters,
  emptyFilters,
  hasActiveFilters,
  toggleFilter,
  type CatalogFilters,
  type FilterGroup,
} from "@/lib/catalog/filters";

import { FiltersSidebar } from "./FiltersSidebar";
import { ImageLightbox } from "./ImageLightbox";
import { ProductCard } from "./ProductCard";
import { StatusBadge, type CatalogStatus } from "./StatusBadge";

type TabKey = "palabra" | "patente" | "vehiculo" | "codigo" | "medidas";

type Props = {
  products: CatalogProduct[];
  status?: CatalogStatus;
  /** URL de la imagen 'Medidas de Tréboles'. Si no hay, el botón queda deshabilitado. */
  trebolesUrl?: string;
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "palabra", label: "Palabra" },
  { key: "patente", label: "Patente" },
  { key: "vehiculo", label: "Vehículo" },
  { key: "codigo", label: "Código" },
  { key: "medidas", label: "Medidas" },
];

const STICKY_TOP = "top-[60px]";
const VALID_TABS: TabKey[] = ["palabra", "patente", "vehiculo", "codigo", "medidas"];
const VALID_MEASURES: MeasureType[] = ["direccion", "transmision", "tope"];
const FILTER_GROUPS: FilterGroup[] = [
  "linea",
  "tipo",
  "ubicacion",
  "lado",
  "marca",
  "modelo",
  "motor",
  "anio",
];

/** Lee el estado inicial del catálogo desde los query params de la URL. */
function readStateFromParams(sp: URLSearchParams) {
  const tabParam = sp.get("tab");
  const tab: TabKey =
    tabParam && (VALID_TABS as string[]).includes(tabParam)
      ? (tabParam as TabKey)
      : "palabra";
  const mtParam = sp.get("mt");
  const measureType: MeasureType =
    mtParam && (VALID_MEASURES as string[]).includes(mtParam)
      ? (mtParam as MeasureType)
      : "direccion";

  const filters: CatalogFilters = {
    linea: new Set(csvFromParam(sp.get("linea"))),
    tipo: new Set(csvFromParam(sp.get("tipo"))),
    ubicacion: new Set(csvFromParam(sp.get("ubicacion"))),
    lado: new Set(csvFromParam(sp.get("lado"))),
    marca: new Set(csvFromParam(sp.get("marca"))),
    modelo: new Set(csvFromParam(sp.get("modelo"))),
    motor: new Set(csvFromParam(sp.get("motor"))),
    anio: new Set(csvFromParam(sp.get("anio"))),
  };

  return {
    tab,
    keyword: sp.get("q") ?? "",
    plate: sp.get("p") ?? "",
    code: sp.get("c") ?? "",
    brand: sp.get("b") ?? "",
    model: sp.get("m") ?? "",
    year: sp.get("y") ?? "",
    measureType,
    filters,
  };
}

function csvFromParam(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Construye la query string desde el estado actual. */
function buildQueryString(state: {
  tab: TabKey;
  keyword: string;
  plate: string;
  code: string;
  brand: string;
  model: string;
  year: string;
  measureType: MeasureType;
  filters: CatalogFilters;
}): string {
  const p = new URLSearchParams();
  if (state.tab !== "palabra") p.set("tab", state.tab);

  if (state.tab === "palabra" && state.keyword.trim()) p.set("q", state.keyword.trim());
  if (state.tab === "patente" && state.plate.trim()) p.set("p", state.plate.trim().toUpperCase());
  if (state.tab === "codigo" && state.code.trim()) p.set("c", state.code.trim());
  if (state.tab === "vehiculo") {
    if (state.brand) p.set("b", state.brand);
    if (state.model) p.set("m", state.model);
    if (state.year) p.set("y", state.year);
  }
  if (state.tab === "medidas" && state.measureType !== "direccion") {
    p.set("mt", state.measureType);
  }

  for (const group of FILTER_GROUPS) {
    const values = Array.from(state.filters[group]);
    if (values.length > 0) p.set(group, values.join(","));
  }

  return p.toString();
}

export function CatalogSearch({ products, status, trebolesUrl }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado inicial desde la URL (al montar). Después sincronizamos en un efecto.
  const initial = useMemo(
    () => readStateFromParams(new URLSearchParams(searchParams.toString())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [tab, setTab] = useState<TabKey>(initial.tab);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<CatalogFilters>(initial.filters);

  const [keyword, setKeyword] = useState(initial.keyword);
  const [plate, setPlate] = useState(initial.plate);
  const [plateVehicle, setPlateVehicle] = useState<SpecPartsPlateResponse | null>(null);
  const [plateError, setPlateError] = useState<string | null>(null);
  const [platePending, startPlateTransition] = useTransition();
  const [brand, setBrand] = useState(initial.brand);
  const [model, setModel] = useState(initial.model);
  const [year, setYear] = useState(initial.year);
  const [code, setCode] = useState(initial.code);
  const [measureType, setMeasureType] = useState<MeasureType>(initial.measureType);

  const vehicleTree = useMemo(() => buildVehicleTree(products), [products]);

  // Índice de búsqueda (keyword) — se construye en el cliente al montar.
  // Ahorra ~150KB en el payload inicial vs enviarlo pre-computado del server.
  const indexedProducts = useMemo(() => indexProducts(products), [products]);

  const onToggleFilter = useCallback((group: FilterGroup, value: string) => {
    setFilters((f) => toggleFilter(f, group, value));
  }, []);
  const onClearFilters = useCallback(() => setFilters(emptyFilters()), []);

  const searchPlate = useCallback(
    (plateValue: string) => {
      const q = plateValue.trim().toUpperCase();
      if (!q) return;
      setPlateError(null);
      setPlateVehicle(null);
      startPlateTransition(async () => {
        try {
          const res = await fetch(`/api/catalog/plate?plate=${encodeURIComponent(q)}`);
          const data = (await res.json()) as SpecPartsPlateResponse;
          if (!res.ok || data.error || !data.brand) {
            setPlateError(data.error || "No se encontró vehículo para esa patente");
            return;
          }
          setPlateVehicle(data);
        } catch (err) {
          setPlateError(err instanceof Error ? err.message : "Error al buscar la patente");
        }
      });
    },
    [startPlateTransition],
  );

  // Al montar: si venimos con ?tab=patente&p=XXX, re-disparamos la búsqueda
  // de patente (el vehicle identificado no se persiste en URL — es server).
  const didInitPlate = useRef(false);
  useEffect(() => {
    if (didInitPlate.current) return;
    didInitPlate.current = true;
    if (initial.tab === "patente" && initial.plate.trim()) {
      searchPlate(initial.plate);
    }
  }, [initial, searchPlate]);

  /**
   * URL sync: cada vez que cambia el estado, actualizamos la URL con
   * router.replace (no agrega entrada al history). Debounce de 200ms para
   * text inputs, así no inundamos el history con una entry por keystroke.
   */
  useEffect(() => {
    const qs = buildQueryString({
      tab,
      keyword,
      plate,
      code,
      brand,
      model,
      year,
      measureType,
      filters,
    });
    const target = qs ? `${pathname}?${qs}` : pathname;
    const timer = setTimeout(() => {
      router.replace(target, { scroll: false });
    }, 200);
    return () => clearTimeout(timer);
  }, [
    tab,
    keyword,
    plate,
    code,
    brand,
    model,
    year,
    measureType,
    filters,
    pathname,
    router,
  ]);

  /* --- Base results por tab (antes de aplicar filtros del sidebar) --- */
  const tabState = useMemo(() => {
    if (tab === "palabra") {
      if (keyword.trim().length < 2) {
        return { kind: "empty" as const, message: "Escribí al menos 2 letras para buscar." };
      }
      return { kind: "results" as const, products: searchByKeyword(indexedProducts, keyword) };
    }
    if (tab === "patente") {
      if (plateError) return { kind: "error" as const, message: plateError };
      if (!plateVehicle) {
        return { kind: "empty" as const, message: "Ingresá una patente para buscar." };
      }
      return {
        kind: "results" as const,
        products: filterByPlateVehicle(products, plateVehicle),
        plateVehicle,
      };
    }
    if (tab === "vehiculo") {
      if (!brand) {
        return { kind: "empty" as const, message: "Elegí una marca para empezar." };
      }
      return {
        kind: "results" as const,
        products: searchByVehicle(products, {
          brand,
          model: model || undefined,
          year: year ? parseInt(year, 10) : undefined,
        }),
      };
    }
    if (tab === "codigo") {
      if (code.trim().length < 2) {
        return { kind: "empty" as const, message: "Escribí al menos 2 caracteres del código." };
      }
      return { kind: "results" as const, products: searchByCode(products, code) };
    }
    return { kind: "measures" as const };
  }, [
    tab,
    products,
    indexedProducts,
    keyword,
    plateError,
    plateVehicle,
    brand,
    model,
    year,
    code,
  ]);

  const baseResults = tabState.kind === "results" ? tabState.products : [];
  const filteredResults = useMemo(
    () => applyFilters(baseResults, filters),
    [baseResults, filters],
  );

  const showSidebar = tab !== "medidas";
  const activeFilters = countActiveFilters(filters);

  return (
    <>
      {/* ---------------- Sticky header con tabs + form ---------------- */}
      <div className={`sticky ${STICKY_TOP} z-20 border-b border-gray-100 bg-white/95 backdrop-blur`}>
        <div className="px-4 py-3 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                Catálogo
              </p>
              <p className="text-xs text-gray-500">
                {products.length} productos Griffo — buscá por patente, vehículo, código, palabra
                o medidas
              </p>
            </div>
            <div className="flex items-center gap-2">
              {status ? <StatusBadge status={status} /> : null}
              {showSidebar ? (
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0a2b3d] transition hover:border-primary lg:hidden"
                >
                  <FilterIcon /> Filtros
                  {activeFilters > 0 ? (
                    <span className="rounded-full bg-primary px-1.5 text-[10px] font-black text-white">
                      {activeFilters}
                    </span>
                  ) : null}
                </button>
              ) : null}
            </div>
          </div>

          <nav
            role="tablist"
            aria-label="Tipos de búsqueda"
            className="mt-3 flex flex-wrap gap-1 border-b border-gray-100"
          >
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.key)}
                  type="button"
                  className={[
                    "relative px-3 py-2 text-sm font-bold transition",
                    active
                      ? "text-primary after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:bg-accent"
                      : "text-gray-400 hover:text-primary",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-3">
            {tab === "palabra" ? <KeywordForm value={keyword} onChange={setKeyword} /> : null}
            {tab === "patente" ? (
              <PlateForm
                value={plate}
                onChange={setPlate}
                onSubmit={() => searchPlate(plate)}
                pending={platePending}
              />
            ) : null}
            {tab === "vehiculo" ? (
              <VehicleForm
                tree={vehicleTree}
                brand={brand}
                model={model}
                year={year}
                onBrand={(v) => {
                  setBrand(v);
                  setModel("");
                  setYear("");
                }}
                onModel={(v) => {
                  setModel(v);
                  setYear("");
                }}
                onYear={setYear}
              />
            ) : null}
            {tab === "codigo" ? <CodeForm value={code} onChange={setCode} /> : null}
            {tab === "medidas" ? (
              <MeasuresSelector value={measureType} onChange={setMeasureType} />
            ) : null}
          </div>
        </div>
      </div>

      {/* ---------------- Área de resultados ---------------- */}
      {tab === "medidas" ? (
        <div className="px-4 py-6 lg:px-6">
          <MeasuresTable products={products} type={measureType} trebolesUrl={trebolesUrl} />
        </div>
      ) : (
        <div
          className={
            showSidebar
              ? "grid gap-6 px-4 py-6 lg:grid-cols-[240px_1fr] lg:px-6"
              : "px-4 py-6 lg:px-6"
          }
        >
          {showSidebar ? (
            <FiltersSidebar
              baseProducts={baseResults}
              filters={filters}
              onToggle={onToggleFilter}
              onClear={onClearFilters}
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
            />
          ) : null}

          <div>
            {tab === "patente" && tabState.kind === "results" && tabState.plateVehicle ? (
              <PlateVehicleHeader vehicle={tabState.plateVehicle} />
            ) : null}
            {tabState.kind === "empty" ? <EmptyState message={tabState.message} /> : null}
            {tabState.kind === "error" ? (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{tabState.message}</p>
            ) : null}
            {tabState.kind === "results" ? (
              <ResultsGrid
                results={filteredResults}
                total={baseResults.length}
                filtersActive={hasActiveFilters(filters)}
                onClearFilters={onClearFilters}
              />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}

/* ========================================================================== */
/*  FORMS                                                                      */
/* ========================================================================== */

function KeywordForm({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <SearchIcon />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribí marca, modelo, código, categoría..."
        aria-label="Búsqueda libre"
        className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function PlateForm({
  value,
  onChange,
  onSubmit,
  pending,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  pending: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex gap-2"
    >
      <div className="relative flex-1">
        <PlateIcon />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: AC923HI"
          maxLength={10}
          aria-label="Patente"
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm uppercase focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-lg bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Buscando..." : "Buscar"}
      </button>
    </form>
  );
}

function VehicleForm({
  tree,
  brand,
  model,
  year,
  onBrand,
  onModel,
  onYear,
}: {
  tree: ReturnType<typeof buildVehicleTree>;
  brand: string;
  model: string;
  year: string;
  onBrand: (v: string) => void;
  onModel: (v: string) => void;
  onYear: (v: string) => void;
}) {
  const models = brand ? tree.modelsByBrand[brand] ?? [] : [];
  const years = brand && model ? tree.yearsByBrandModel[`${brand}|${model}`] ?? [] : [];

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <SelectField
        label="Marca"
        value={brand}
        onChange={onBrand}
        options={[
          { label: "Seleccioná marca", value: "" },
          ...tree.brands.map((b) => ({ label: b, value: b })),
        ]}
      />
      <SelectField
        label="Modelo"
        value={model}
        disabled={!brand}
        onChange={onModel}
        options={[
          { label: brand ? "Seleccioná modelo" : "Primero marca", value: "" },
          ...models.map((m) => ({ label: m, value: m })),
        ]}
      />
      <SelectField
        label="Año"
        value={year}
        disabled={!model}
        onChange={onYear}
        options={[
          { label: model ? "Todos los años" : "Primero modelo", value: "" },
          ...years.map((y) => ({ label: String(y), value: String(y) })),
        ]}
      />
    </div>
  );
}

function CodeForm({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <HashIcon />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej: 076-35"
        aria-label="Código del producto"
        className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function MeasuresSelector({
  value,
  onChange,
}: {
  value: MeasureType;
  onChange: (v: MeasureType) => void;
}) {
  const opts: { key: MeasureType; label: string }[] = [
    { key: "direccion", label: "Fuelle Dirección" },
    { key: "transmision", label: "Fuelle Transmisión" },
    { key: "tope", label: "Tope Amortiguador" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={[
              "rounded-lg border-2 px-3 py-2 text-xs font-bold transition",
              active
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 bg-white text-gray-500 hover:border-primary",
            ].join(" ")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ========================================================================== */
/*  RESULT VIEWS                                                               */
/* ========================================================================== */

function PlateVehicleHeader({ vehicle }: { vehicle: SpecPartsPlateResponse }) {
  return (
    <div className="mb-4 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
        Vehículo identificado
      </p>
      <p className="text-sm font-bold text-[#0a2b3d]">
        {vehicle.brand} {vehicle.master_model ?? vehicle.model}
      </p>
      {vehicle.version || vehicle.sold_from_year ? (
        <p className="text-xs text-gray-600">
          {vehicle.version ?? ""}{" "}
          {vehicle.sold_from_year ? `(${vehicle.sold_from_year})` : ""}
        </p>
      ) : null}
    </div>
  );
}

function ResultsGrid({
  results,
  total,
  filtersActive,
  onClearFilters,
}: {
  results: CatalogProduct[];
  total: number;
  filtersActive: boolean;
  onClearFilters: () => void;
}) {
  if (total === 0) {
    return <EmptyState message="No se encontraron productos." />;
  }
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-gray-200 p-6">
        <p className="text-sm text-gray-500">Ningún producto cumple todos los filtros activos.</p>
        {filtersActive ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-bold text-accent hover:text-primary-dark"
          >
            Limpiar filtros →
          </button>
        ) : null}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-500">
        <span className="font-bold text-[#0a2b3d]">{results.length}</span>
        {results.length !== total ? (
          <span className="text-gray-400"> de {total}</span>
        ) : null}{" "}
        {results.length === 1 ? "producto" : "productos"}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {results.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
      {message}
    </p>
  );
}

/* ========================================================================== */
/*  MEASURES TABLE                                                             */
/* ========================================================================== */

type SortCol = "diamMenor" | "diamMayor" | "largo" | "code";

function MeasuresTable({
  products,
  type,
  trebolesUrl,
}: {
  products: CatalogProduct[];
  type: MeasureType;
  trebolesUrl?: string;
}) {
  const [sortCol, setSortCol] = useState<SortCol>("diamMenor");
  const [sortAsc, setSortAsc] = useState(true);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [trebolesOpen, setTrebolesOpen] = useState(false);

  const rows = useMemo(() => buildMeasureRows(products, type), [products, type]);
  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      if (sortCol === "code") {
        return sortAsc ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code);
      }
      const key =
        sortCol === "diamMenor"
          ? "diamMenorNum"
          : sortCol === "diamMayor"
            ? "diamMayorNum"
            : "largoNum";
      const va = (a[key] as number | null) ?? (sortAsc ? Infinity : -Infinity);
      const vb = (b[key] as number | null) ?? (sortAsc ? Infinity : -Infinity);
      return sortAsc ? va - vb : vb - va;
    });
    return arr;
  }, [rows, sortCol, sortAsc]);

  const onSort = (col: SortCol) => {
    if (col === sortCol) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Llamadores del tab Transmisión: accesos rápidos a Fuelle Universal
            y a la grilla de Tréboles. Replica la convención del sitio viejo. */}
        {type === "transmision" ? (
          <TransmisionShortcuts
            trebolesUrl={trebolesUrl}
            onOpenTreboles={() => setTrebolesOpen(true)}
          />
        ) : null}

        <p className="text-xs text-gray-500">
          <span className="font-bold text-[#0a2b3d]">{sorted.length}</span>{" "}
          {sorted.length === 1 ? "producto" : "productos"}
        </p>
        <div className="overflow-auto rounded-lg border border-gray-100 max-h-[70vh]">
          <table className="min-w-full text-xs">
            <thead className="sticky top-0 z-10 bg-primary text-white shadow-sm">
              <tr>
                <Th onClick={() => onSort("diamMenor")} active={sortCol === "diamMenor"} asc={sortAsc}>
                  Diám. Menor
                </Th>
                <Th onClick={() => onSort("diamMayor")} active={sortCol === "diamMayor"} asc={sortAsc}>
                  Diám. Mayor
                </Th>
                <Th onClick={() => onSort("largo")} active={sortCol === "largo"} asc={sortAsc}>
                  Largo
                </Th>
                <Th onClick={() => onSort("code")} active={sortCol === "code"} asc={sortAsc}>
                  Código
                </Th>
                <th className="px-3 py-2 text-right text-[11px] font-bold uppercase tracking-wide">
                  Foto
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <MeasureRowView
                  key={`${type}-${row.code}`}
                  row={row}
                  onImageClick={(src, alt) => setLightbox({ src, alt })}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {lightbox ? (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      ) : null}
      {trebolesOpen && trebolesUrl ? (
        <ImageLightbox
          src={trebolesUrl}
          alt="Medidas de tréboles — catálogo Griffo"
          onClose={() => setTrebolesOpen(false)}
        />
      ) : null}
    </>
  );
}

function TransmisionShortcuts({
  trebolesUrl,
  onOpenTreboles,
}: {
  trebolesUrl?: string;
  onOpenTreboles: () => void;
}) {
  const trebolesDisabled = !trebolesUrl;
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <Link
        href="/productos/kit-de-fuelles-universales-para-homocineticas"
        className="flex items-center justify-between gap-3 rounded-lg border-2 border-accent/30 bg-accent/5 p-3 transition hover:border-accent hover:bg-accent/10"
      >
        <div>
          <p className="text-sm font-black text-primary">
            ¿No encontraste el fuelle que buscabas?
          </p>
          <p className="mt-0.5 text-[13px] font-semibold text-[#0a2b3d]">
            Mirá el Fuelle Universal →
          </p>
        </div>
      </Link>

      <button
        type="button"
        onClick={onOpenTreboles}
        disabled={trebolesDisabled}
        title={trebolesDisabled ? "Imagen aún no cargada" : undefined}
        className={[
          "flex items-center justify-between gap-3 rounded-lg border-2 p-3 text-left transition",
          trebolesDisabled
            ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
            : "border-primary/20 bg-primary/5 hover:border-primary hover:bg-primary/10",
        ].join(" ")}
      >
        <div>
          <p
            className={[
              "text-[10px] font-bold uppercase tracking-widest",
              trebolesDisabled ? "text-gray-400" : "text-primary",
            ].join(" ")}
          >
            Guía visual
          </p>
          <p
            className={[
              "text-sm font-black",
              trebolesDisabled ? "text-gray-400" : "text-primary",
            ].join(" ")}
          >
            Medidas de Tréboles
          </p>
          <p className="mt-0.5 text-[11px] text-gray-500">
            {trebolesDisabled
              ? "Próximamente"
              : "Grilla visual con los códigos y medidas de cada trébol."}
          </p>
        </div>
        <span className={trebolesDisabled ? "text-lg text-gray-400" : "text-lg font-bold text-primary"}>
          ⊕
        </span>
      </button>
    </div>
  );
}

function MeasureRowView({
  row,
  onImageClick,
}: {
  row: MeasureRow;
  onImageClick: (src: string, alt: string) => void;
}) {
  return (
    <tr className="group border-b border-gray-50 transition hover:bg-primary/5">
      <td className="px-3 py-2 text-[#0a2b3d]">{row.diamMenor || "—"}</td>
      <td className="px-3 py-2 text-[#0a2b3d]">{row.diamMayor || "—"}</td>
      <td className="px-3 py-2 text-[#0a2b3d]">{row.largo || "—"}</td>
      <td className="px-3 py-2">
        <Link
          href={`/catalogo/${row.productSlug}`}
          className="font-black text-primary hover:text-primary-dark"
        >
          {row.code}
        </Link>
      </td>
      <td className="relative px-3 py-1.5 text-right">
        {row.imageUrl ? (
          <div className="group/img relative inline-block">
            <button
              type="button"
              onClick={() => onImageClick(row.imageUrl!, row.productName || row.code)}
              aria-label={`Ampliar foto del producto ${row.code}`}
              className="inline-block overflow-hidden rounded border border-gray-200 bg-white p-1 transition hover:border-accent hover:shadow-sm"
            >
              <Image
                src={row.imageUrl}
                alt={row.productName || row.code}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </button>
            {/* Preview flotante al hover — desktop only. Aparece a la izquierda
                para no salirse del viewport en la columna final. */}
            <div
              className="pointer-events-none absolute right-full top-1/2 z-30 mr-2 hidden -translate-y-1/2 group-hover/img:block"
              aria-hidden
            >
              <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-2xl">
                <Image
                  src={row.imageUrl}
                  alt=""
                  width={200}
                  height={200}
                  className="h-48 w-48 object-contain"
                />
              </div>
            </div>
          </div>
        ) : (
          <span className="text-[10px] text-gray-300">—</span>
        )}
      </td>
    </tr>
  );
}

function Th({
  children,
  onClick,
  active,
  asc,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  asc: boolean;
}) {
  return (
    <th
      onClick={onClick}
      className="cursor-pointer select-none px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide"
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <span className={active ? "opacity-100" : "opacity-40"}>{active && !asc ? "▼" : "▲"}</span>
      </span>
    </th>
  );
}

/* ========================================================================== */
/*  SHARED UI                                                                  */
/* ========================================================================== */

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:text-gray-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ========================================================================== */
/*  ICONS                                                                      */
/* ========================================================================== */

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function PlateIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="6" width="20" height="12" rx="3" />
      <line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  );
}

function HashIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
