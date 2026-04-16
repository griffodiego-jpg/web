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

const TABS: { key: TabKey; label: string; hint: string }[] = [
  { key: "palabra", label: "Palabra", hint: "Ej: fiat gol amortiguador" },
  { key: "patente", label: "Patente", hint: "Ej: AC923HI" },
  { key: "vehiculo", label: "Vehículo", hint: "Marca → Modelo → Año" },
  { key: "codigo", label: "Código", hint: "Ej: 076-35" },
  { key: "medidas", label: "Medidas", hint: "Diámetros y largos" },
];

export function CatalogSearch({ products }: Props) {
  const [tab, setTab] = useState<TabKey>("palabra");
  const vehicleTree = useMemo(() => buildVehicleTree(products), [products]);

  return (
    <div className="flex flex-col gap-6">
      <nav
        role="tablist"
        aria-label="Tipos de búsqueda"
        className="flex flex-wrap gap-2 border-b border-gray-100 pb-1"
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${t.key}`}
              id={`tab-${t.key}`}
              onClick={() => setTab(t.key)}
              type="button"
              className={[
                "rounded-t-lg px-4 py-2 text-sm font-bold transition",
                active
                  ? "border-b-2 border-accent bg-white text-primary"
                  : "border-b-2 border-transparent text-gray-500 hover:text-primary",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "palabra" ? <KeywordSearch products={products} /> : null}
        {tab === "patente" ? <PlateSearch products={products} /> : null}
        {tab === "vehiculo" ? (
          <VehicleSearch products={products} tree={vehicleTree} />
        ) : null}
        {tab === "codigo" ? <CodeSearch products={products} /> : null}
        {tab === "medidas" ? <MeasuresSearch products={products} /> : null}
      </div>
    </div>
  );
}

/* ========================================================================== */
/*  KEYWORD                                                                    */
/* ========================================================================== */

function KeywordSearch({ products }: { products: CatalogProduct[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(
    () => (query.trim().length >= 2 ? searchByKeyword(products, query) : []),
    [products, query],
  );

  return (
    <div className="flex flex-col gap-4">
      <FormHeader title="Búsqueda libre" hint="Escribí cualquier palabra — marca, modelo, código, categoría." />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ej: fiat gol, amortiguador delantero, 076-35..."
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        autoFocus
      />
      {query.trim().length >= 2 ? <ResultsGrid results={results} /> : null}
    </div>
  );
}

/* ========================================================================== */
/*  PLATE                                                                      */
/* ========================================================================== */

function PlateSearch({ products }: { products: CatalogProduct[] }) {
  const [plate, setPlate] = useState("");
  const [vehicle, setVehicle] = useState<SpecPartsPlateResponse | null>(null);
  const [results, setResults] = useState<CatalogProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = plate.trim().toUpperCase();
    if (!q) return;
    setError(null);
    setVehicle(null);
    setResults([]);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/catalog/plate?plate=${encodeURIComponent(q)}`);
        const data = (await res.json()) as SpecPartsPlateResponse;
        if (!res.ok || data.error || !data.brand) {
          setError(data.error || "No se encontró vehículo para esa patente");
          return;
        }
        setVehicle(data);
        setResults(filterByPlateVehicle(products, data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al buscar la patente");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <FormHeader title="Buscar por patente" hint="Ingresá la patente argentina del vehículo." />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          placeholder="Ej: AC923HI"
          maxLength={10}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-base uppercase focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {isPending ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {vehicle ? (
        <div className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Vehículo identificado</p>
          <p className="text-sm font-bold text-[#0a2b3d]">
            {vehicle.brand} {vehicle.master_model ?? vehicle.model}
          </p>
          {vehicle.version || vehicle.sold_from_year ? (
            <p className="text-xs text-gray-600">
              {vehicle.version ?? ""} {vehicle.sold_from_year ? `(${vehicle.sold_from_year})` : ""}
            </p>
          ) : null}
        </div>
      ) : null}

      {vehicle ? <ResultsGrid results={results} /> : null}
    </div>
  );
}

/* ========================================================================== */
/*  VEHICLE (cascade)                                                          */
/* ========================================================================== */

function VehicleSearch({
  products,
  tree,
}: {
  products: CatalogProduct[];
  tree: ReturnType<typeof buildVehicleTree>;
}) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  const models = brand ? tree.modelsByBrand[brand] ?? [] : [];
  const years = brand && model ? tree.yearsByBrandModel[`${brand}|${model}`] ?? [] : [];

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

  return (
    <div className="flex flex-col gap-4">
      <FormHeader title="Buscar por vehículo" hint="Seleccioná marca, modelo y año (opcional)." />
      <div className="grid gap-3 sm:grid-cols-3">
        <SelectField
          label="Marca"
          value={brand}
          onChange={(v) => {
            setBrand(v);
            setModel("");
            setYear("");
          }}
          options={[{ label: "Seleccioná marca", value: "" }, ...tree.brands.map((b) => ({ label: b, value: b }))]}
        />
        <SelectField
          label="Modelo"
          value={model}
          disabled={!brand}
          onChange={(v) => {
            setModel(v);
            setYear("");
          }}
          options={[
            { label: brand ? "Seleccioná modelo" : "Primero marca", value: "" },
            ...models.map((m) => ({ label: m, value: m })),
          ]}
        />
        <SelectField
          label="Año (opcional)"
          value={year}
          disabled={!model}
          onChange={setYear}
          options={[
            { label: model ? "Todos los años" : "Primero modelo", value: "" },
            ...years.map((y) => ({ label: String(y), value: String(y) })),
          ]}
        />
      </div>
      {brand ? <ResultsGrid results={results} /> : null}
    </div>
  );
}

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
      <span className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:text-gray-400"
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
/*  CODE                                                                       */
/* ========================================================================== */

function CodeSearch({ products }: { products: CatalogProduct[] }) {
  const [code, setCode] = useState("");
  const results = useMemo(
    () => (code.trim().length >= 2 ? searchByCode(products, code) : []),
    [products, code],
  );

  return (
    <div className="flex flex-col gap-4">
      <FormHeader title="Buscar por código" hint="Ingresá el código GRIFFO del producto." />
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Ej: 076-35"
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {code.trim().length >= 2 ? <ResultsGrid results={results} /> : null}
    </div>
  );
}

/* ========================================================================== */
/*  MEASURES                                                                   */
/* ========================================================================== */

const MEASURE_TABS: { key: MeasureType; label: string }[] = [
  { key: "direccion", label: "Fuelle Dirección" },
  { key: "transmision", label: "Fuelle Transmisión" },
  { key: "tope", label: "Tope Amortiguador" },
];

type SortCol = "diamMenor" | "diamMayor" | "largo" | "code";

function MeasuresSearch({ products }: { products: CatalogProduct[] }) {
  const [type, setType] = useState<MeasureType>("direccion");
  const [sortCol, setSortCol] = useState<SortCol>("diamMenor");
  const [sortAsc, setSortAsc] = useState(true);

  const rows = useMemo(() => buildMeasureRows(products, type), [products, type]);

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      if (sortCol === "code") {
        return sortAsc ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code);
      }
      const key = sortCol === "diamMenor" ? "diamMenorNum" : sortCol === "diamMayor" ? "diamMayorNum" : "largoNum";
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
    <div className="flex flex-col gap-4">
      <FormHeader title="Buscar por medidas" hint="Tabla con las medidas físicas de fuelles y topes." />
      <div className="flex flex-wrap gap-2">
        {MEASURE_TABS.map((t) => {
          const active = type === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setType(t.key)}
              className={[
                "rounded-lg border-2 px-3 py-2 text-xs font-bold transition",
                active
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 bg-white text-gray-500 hover:border-primary",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500">
        {sorted.length} {sorted.length === 1 ? "producto" : "productos"}
      </p>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
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
              <MeasureTableRow key={`${type}-${row.code}`} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MeasureTableRow({ row }: { row: MeasureRow }) {
  return (
    <tr className="border-b border-gray-50 transition hover:bg-primary/5">
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
/*  SHARED                                                                     */
/* ========================================================================== */

function FormHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h2 className="text-lg font-black text-[#0a2b3d]">{title}</h2>
      <p className="text-xs text-gray-500">{hint}</p>
    </div>
  );
}

function ResultsGrid({ results }: { results: CatalogProduct[] }) {
  if (results.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
        No se encontraron productos.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-500">
        {results.length} {results.length === 1 ? "producto encontrado" : "productos encontrados"}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
