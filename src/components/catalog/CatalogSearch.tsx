"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";

import type { CatalogProduct, SpecPartsPlateResponse } from "@/types/specparts";
import {
  buildMeasureRows,
  buildVehicleTree,
  filterByPlateVehicle,
  searchByCode,
  searchByKeyword,
  searchByVehicle,
  type MeasureRow,
  type MeasureType,
} from "@/lib/catalog/utils";

import { ProductCard } from "./ProductCard";

type TabKey = "palabra" | "patente" | "vehiculo" | "codigo" | "medidas";

type Props = {
  products: CatalogProduct[];
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "palabra", label: "Palabra" },
  { key: "patente", label: "Patente" },
  { key: "vehiculo", label: "Vehículo" },
  { key: "codigo", label: "Código" },
  { key: "medidas", label: "Medidas" },
];

// Altura aprox del Header sticky del sitio (py-2.5 + logo h-10 ≈ 60px)
const STICKY_TOP = "top-[60px]";

export function CatalogSearch({ products }: Props) {
  const [tab, setTab] = useState<TabKey>("palabra");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [plate, setPlate] = useState("");
  const [plateVehicle, setPlateVehicle] = useState<SpecPartsPlateResponse | null>(null);
  const [plateError, setPlateError] = useState<string | null>(null);
  const [platePending, startPlateTransition] = useTransition();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [code, setCode] = useState("");
  const [measureType, setMeasureType] = useState<MeasureType>("direccion");

  const vehicleTree = useMemo(() => buildVehicleTree(products), [products]);

  const searchPlate = (plateValue: string) => {
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
  };

  return (
    <>
      {/* ---------- STICKY: eyebrow + tabs + form del tab activo ---------- */}
      <div
        className={`sticky ${STICKY_TOP} z-20 border-b border-gray-100 bg-white/95 backdrop-blur`}
      >
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
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0a2b3d] transition hover:border-primary lg:hidden"
            >
              <FilterIcon /> Filtros
            </button>
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
            {tab === "palabra" ? (
              <KeywordForm value={keyword} onChange={setKeyword} />
            ) : null}
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

      {/* ---------- LAYOUT: sidebar + results ---------- */}
      <div className="grid gap-6 px-4 py-6 lg:grid-cols-[240px_1fr] lg:px-6">
        <FiltersSidebar open={filtersOpen} onClose={() => setFiltersOpen(false)} />

        <div>
          {tab === "palabra" ? (
            <KeywordResults products={products} query={keyword} />
          ) : null}
          {tab === "patente" ? (
            <PlateResults products={products} vehicle={plateVehicle} error={plateError} />
          ) : null}
          {tab === "vehiculo" ? (
            <VehicleResults products={products} brand={brand} model={model} year={year} />
          ) : null}
          {tab === "codigo" ? <CodeResults products={products} query={code} /> : null}
          {tab === "medidas" ? (
            <MeasuresResults products={products} type={measureType} />
          ) : null}
        </div>
      </div>
    </>
  );
}

/* ========================================================================== */
/*  FORMS                                                                      */
/* ========================================================================== */

function KeywordForm({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
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

function CodeForm({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
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
/*  RESULTS                                                                    */
/* ========================================================================== */

function KeywordResults({
  products,
  query,
}: {
  products: CatalogProduct[];
  query: string;
}) {
  const results = useMemo(
    () => (query.trim().length >= 2 ? searchByKeyword(products, query) : []),
    [products, query],
  );
  if (query.trim().length < 2) {
    return <EmptyState message="Escribí al menos 2 letras para buscar." />;
  }
  return <ResultsGrid results={results} />;
}

function PlateResults({
  products,
  vehicle,
  error,
}: {
  products: CatalogProduct[];
  vehicle: SpecPartsPlateResponse | null;
  error: string | null;
}) {
  const results = useMemo(
    () => (vehicle ? filterByPlateVehicle(products, vehicle) : []),
    [products, vehicle],
  );

  if (error) {
    return <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>;
  }
  if (!vehicle) {
    return <EmptyState message="Ingresá una patente para buscar los productos compatibles." />;
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
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
      <ResultsGrid results={results} />
    </div>
  );
}

function VehicleResults({
  products,
  brand,
  model,
  year,
}: {
  products: CatalogProduct[];
  brand: string;
  model: string;
  year: string;
}) {
  const results = useMemo(
    () =>
      brand
        ? searchByVehicle(products, {
            brand,
            model: model || undefined,
            year: year ? parseInt(year, 10) : undefined,
          })
        : [],
    [products, brand, model, year],
  );
  if (!brand) return <EmptyState message="Elegí una marca para empezar." />;
  return <ResultsGrid results={results} />;
}

function CodeResults({
  products,
  query,
}: {
  products: CatalogProduct[];
  query: string;
}) {
  const results = useMemo(
    () => (query.trim().length >= 2 ? searchByCode(products, query) : []),
    [products, query],
  );
  if (query.trim().length < 2) {
    return <EmptyState message="Escribí al menos 2 caracteres del código." />;
  }
  return <ResultsGrid results={results} />;
}

type SortCol = "diamMenor" | "diamMayor" | "largo" | "code";

function MeasuresResults({
  products,
  type,
}: {
  products: CatalogProduct[];
  type: MeasureType;
}) {
  const [sortCol, setSortCol] = useState<SortCol>("diamMenor");
  const [sortAsc, setSortAsc] = useState(true);

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
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-500">
        <span className="font-bold text-[#0a2b3d]">{sorted.length}</span>{" "}
        {sorted.length === 1 ? "producto" : "productos"}
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-full text-xs">
          <thead className="bg-primary text-white">
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
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={`${type}-${row.code}`}
                className="border-b border-gray-50 transition hover:bg-primary/5"
              >
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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
/*  FILTERS SIDEBAR (placeholder)                                              */
/* ========================================================================== */

function FiltersSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const content = (
    <div className="flex flex-col gap-5 p-4">
      <div>
        <h2 className="text-sm font-black text-[#0a2b3d]">Filtros</h2>
        <p className="mt-0.5 text-[11px] text-gray-500">
          Próximamente: filtrar por categoría, tipo de producto y compatibilidad.
        </p>
      </div>
      <FilterGroup label="Categoría">
        <FilterStub items={["Suspensión", "Dirección", "Transmisión"]} />
      </FilterGroup>
      <FilterGroup label="Tipo de producto">
        <FilterStub
          items={["Fuelle Suspensión", "Fuelle Cremallera", "Tope Amortiguador", "Kit Fuelle Semieje"]}
        />
      </FilterGroup>
      <FilterGroup label="Marca vehículo">
        <FilterStub items={["Ford", "Chevrolet", "Fiat", "Volkswagen", "Toyota", "Renault"]} />
      </FilterGroup>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-[192px] max-h-[calc(100vh-220px)] overflow-y-auto rounded-lg border border-gray-100 bg-white">
          {content}
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
            {content}
          </div>
        </div>
      ) : null}
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-500">
        {label}
      </h3>
      {children}
    </div>
  );
}

function FilterStub({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <input
            type="checkbox"
            disabled
            className="h-3.5 w-3.5 rounded border-gray-300 opacity-60"
          />
          <span className="text-xs text-gray-400">{item}</span>
        </li>
      ))}
    </ul>
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

function ResultsGrid({ results }: { results: CatalogProduct[] }) {
  if (results.length === 0) {
    return <EmptyState message="No se encontraron productos." />;
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-500">
        <span className="font-bold text-[#0a2b3d]">{results.length}</span>{" "}
        {results.length === 1 ? "producto" : "productos"} encontrados
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
