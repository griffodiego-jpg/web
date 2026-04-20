"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { getDisplayApplication } from "@/lib/catalog/display";
import type { SpecPartsProduct } from "@/types/specparts";

/**
 * Tab "Por código" — grilla tipo Excel. Cada fila es un producto:
 *   [Código con autocomplete] [Info metadata] [Cantidad] [Quitar]
 *
 * Al seleccionar un código se muestran línea + ubicación + lado +
 * marcas compatibles para que el cliente confirme que eligió el
 * producto correcto. Después carga cantidad y agrega otra fila si
 * quiere.
 */

interface CatalogLite {
  code: string;
  slug: string;
  name: string;
  image?: string;
  linea: string;
  ubicacion: string;
  lado: string;
  marcas: string[];
  marcasExtra: number;
}

const HIDE_BRANDS = new Set(["AGRALE", "IVECO", "UNIVERSAL"]);

function buildLite(p: SpecPartsProduct): CatalogLite {
  const disp = getDisplayApplication(p);
  const brandSet = new Set<string>();
  for (const v of p.vehicles ?? []) {
    const b = (v.brand ?? "").toUpperCase().trim();
    if (b && !HIDE_BRANDS.has(b)) brandSet.add(b);
  }
  const allBrands = [...brandSet].sort((a, b) => a.localeCompare(b));
  return {
    code: p.code,
    slug: p.slug,
    name: (p.product ?? "").toString(),
    image: p.pictures?.[0]?.image_url,
    linea: (p.category ?? "").toString().toUpperCase(),
    ubicacion: disp.ubicaciones.join(" · "),
    lado: disp.lados.join(" · "),
    marcas: allBrands.slice(0, 3),
    marcasExtra: Math.max(0, allBrands.length - 3),
  };
}

function lineaBadge(linea: string): string {
  const l = linea.toLowerCase();
  if (l.includes("susp")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (l.includes("direc"))
    return "bg-purple-100 text-purple-800 border-purple-200";
  if (l.includes("trans"))
    return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

interface Row {
  id: number;
  query: string;
  selected: CatalogLite | null;
  quantity: number;
}

let rowCounter = 0;
const newRow = (): Row => ({
  id: ++rowCounter,
  query: "",
  selected: null,
  quantity: 1,
});

const INITIAL_ROWS = 5;

export function TabGrillaCodigo() {
  const { addItem } = useCart();
  const [catalog, setCatalog] = useState<CatalogLite[] | null>(null);
  const [rows, setRows] = useState<Row[]>(() =>
    Array.from({ length: INITIAL_ROWS }, newRow),
  );
  const [added, setAdded] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/catalog/products", {
          cache: "force-cache",
        });
        const data = (await res.json()) as { products?: SpecPartsProduct[] };
        if (cancel) return;
        setCatalog((data.products ?? []).map(buildLite));
      } catch {
        setCatalog([]);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  function updateRow(id: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()]);
  }

  function removeRow(id: number) {
    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      return filtered.length === 0 ? [newRow()] : filtered;
    });
  }

  function clearAll() {
    setRows(Array.from({ length: INITIAL_ROWS }, newRow));
    setError(null);
    setAdded(null);
  }

  const validRows = useMemo(
    () => rows.filter((r) => r.selected && r.quantity > 0),
    [rows],
  );

  function handleSubmit() {
    setError(null);
    if (validRows.length === 0) {
      setError(
        "Seleccioná al menos un producto y poné una cantidad mayor a 0.",
      );
      return;
    }
    // Validamos que si escribieron un código pero no seleccionaron,
    // les avisemos (evita el "creía que lo había agregado").
    const unresolved = rows.filter(
      (r) => r.query.trim() !== "" && !r.selected,
    );
    if (unresolved.length > 0) {
      setError(
        `Hay ${unresolved.length} fila${unresolved.length === 1 ? "" : "s"} con código sin seleccionar. Elegí de la lista o borrá el texto.`,
      );
      return;
    }

    for (const r of validRows) {
      if (!r.selected) continue;
      addItem(
        {
          productCode: r.selected.code,
          slug: r.selected.slug,
          name: r.selected.name,
          image: r.selected.image,
        },
        Math.max(1, Math.floor(r.quantity)),
      );
    }
    setAdded(validRows.length);
    clearAll();
    setTimeout(() => setAdded(null), 3500);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-700">
          Ingresá un código por fila. Seleccionalo de la lista que aparece
          para cargar la info del producto, después poné la cantidad.
          Cuando termines, <strong>Agregar al carrito</strong>.
        </p>
      </div>

      {/* Grilla */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1.6fr_90px_40px] gap-0 bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-wider font-bold text-gray-500">
          <div className="px-3 py-2">Código</div>
          <div className="px-3 py-2">Información del producto</div>
          <div className="px-3 py-2 text-right">Cantidad</div>
          <div className="px-2 py-2"></div>
        </div>

        <div className="divide-y divide-gray-100">
          {rows.map((row) => (
            <GridRow
              key={row.id}
              row={row}
              catalog={catalog}
              onChange={(patch) => updateRow(row.id, patch)}
              onRemove={() => removeRow(row.id)}
            />
          ))}
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addRow}
            className="px-3 py-1.5 border-2 border-dashed border-gray-300 text-gray-700 hover:border-primary hover:text-primary font-bold rounded-lg text-xs transition"
          >
            + Agregar fila
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="px-3 py-1.5 text-gray-600 hover:text-[#0a2b3d] font-bold text-xs"
          >
            Vaciar grilla
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">
            {validRows.length}{" "}
            {validRows.length === 1 ? "producto listo" : "productos listos"}
          </span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={validRows.length === 0}
            className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            + Agregar {validRows.length > 0 ? validRows.length : ""} al carrito
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
      {added != null && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 font-semibold">
          ✓ Se agregaron {added}{" "}
          {added === 1 ? "producto" : "productos"} al carrito.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Fila de la grilla                                                          */
/* -------------------------------------------------------------------------- */

function GridRow({
  row,
  catalog,
  onChange,
  onRemove,
}: {
  row: Row;
  catalog: CatalogLite[] | null;
  onChange: (patch: Partial<Row>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cierra el dropdown al clickear afuera
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = useMemo(() => {
    if (!catalog) return [];
    const q = row.query.trim().toUpperCase();
    if (!q) return [];
    const exact: CatalogLite[] = [];
    const prefix: CatalogLite[] = [];
    const sub: CatalogLite[] = [];
    for (const p of catalog) {
      const code = p.code.toUpperCase();
      if (code === q) exact.push(p);
      else if (code.startsWith(q)) prefix.push(p);
      else if (code.includes(q)) sub.push(p);
    }
    return [...exact, ...prefix, ...sub].slice(0, 6);
  }, [catalog, row.query]);

  const { selected } = row;

  function handleSelect(p: CatalogLite) {
    onChange({ query: p.code, selected: p });
    setOpen(false);
  }

  function handleChange(value: string) {
    onChange({ query: value, selected: null });
    setOpen(true);
  }

  return (
    <div className="grid grid-cols-[1fr_1.6fr_90px_40px] gap-0 items-start">
      {/* Código + autocomplete */}
      <div ref={containerRef} className="relative px-2 py-2">
        <input
          ref={inputRef}
          type="text"
          value={row.query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={catalog ? "Ej: 076-35" : "Cargando…"}
          disabled={!catalog}
          className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm font-mono focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
          autoComplete="off"
        />
        {open && suggestions.length > 0 && (
          <ul className="absolute z-20 left-2 right-2 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[320px] overflow-y-auto">
            {suggestions.map((p) => (
              <li
                key={p.code}
                onClick={() => handleSelect(p)}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0 flex items-start gap-2"
              >
                {p.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={p.image}
                    alt=""
                    className="w-8 h-8 object-contain shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-mono font-bold text-primary">
                      {p.code}
                    </p>
                    {p.linea && (
                      <span
                        className={`text-[9px] uppercase font-bold px-1 py-0.5 rounded border ${lineaBadge(p.linea)}`}
                      >
                        {p.linea}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-600 uppercase truncate">
                    {p.name}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {row.query && !selected && !open && suggestions.length === 0 && catalog && (
          <p className="text-[10px] text-amber-700 mt-1">
            No encontramos ese código.
          </p>
        )}
      </div>

      {/* Info del producto seleccionado */}
      <div className="px-3 py-2 min-w-0">
        {selected ? (
          <div className="flex items-start gap-2">
            {selected.image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={selected.image}
                alt={selected.code}
                className="w-8 h-8 object-contain shrink-0 bg-white rounded border border-gray-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-bold text-[#0a2b3d] uppercase truncate">
                  {selected.name}
                </p>
                {selected.linea && (
                  <span
                    className={`text-[9px] uppercase font-bold px-1 py-0.5 rounded border whitespace-nowrap ${lineaBadge(selected.linea)}`}
                  >
                    {selected.linea}
                  </span>
                )}
              </div>
              {(selected.ubicacion || selected.lado) && (
                <p className="text-[10px] text-gray-600 mt-0.5">
                  {selected.ubicacion && (
                    <>
                      <span className="text-gray-400">Ubic:</span>{" "}
                      <strong>{selected.ubicacion}</strong>
                    </>
                  )}
                  {selected.ubicacion && selected.lado && " · "}
                  {selected.lado && (
                    <>
                      <span className="text-gray-400">Lado:</span>{" "}
                      <strong>{selected.lado}</strong>
                    </>
                  )}
                </p>
              )}
              {selected.marcas.length > 0 && (
                <p className="text-[10px] text-gray-600 mt-0.5 truncate">
                  <span className="text-gray-400">Marcas:</span>{" "}
                  <strong>
                    {selected.marcas.join(" · ")}
                    {selected.marcasExtra > 0
                      ? ` +${selected.marcasExtra}`
                      : ""}
                  </strong>
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-gray-400 italic py-1.5">
            Seleccioná un código para ver su información.
          </p>
        )}
      </div>

      {/* Cantidad */}
      <div className="px-2 py-2">
        <input
          type="number"
          min={1}
          value={row.quantity}
          onChange={(e) => {
            const v = parseInt(e.target.value || "1", 10);
            onChange({ quantity: Number.isNaN(v) || v < 1 ? 1 : v });
          }}
          disabled={!selected}
          className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm text-right font-semibold focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>

      {/* Quitar */}
      <div className="px-1 py-2 flex items-center justify-center">
        <button
          type="button"
          onClick={onRemove}
          aria-label="Quitar fila"
          className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-600 transition"
          title="Quitar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
