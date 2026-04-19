"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatARSNeto, getMockCompraPrice } from "@/lib/mock-prices";

/**
 * Tab "Por código" del armador de pedidos. Input con autocomplete sobre
 * el catálogo + cantidad + agregar. Al agregar queda en el carrito y el
 * input se resetea para seguir cargando.
 *
 * Fetch del catálogo via `/api/catalog/products` (ya existe y cachea).
 */

interface CatalogLite {
  code: string;
  slug: string;
  name: string;
  image?: string;
}

export function TabPorCodigo() {
  const { addItem, getQuantity } = useCart();
  const [catalog, setCatalog] = useState<CatalogLite[] | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CatalogLite | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/catalog/products", {
          cache: "force-cache",
        });
        const data = (await res.json()) as {
          products?: Array<{
            code: string;
            slug: string;
            product: string;
            pictures?: Array<{ image_url: string }>;
          }>;
        };
        if (cancel) return;
        const items = (data.products ?? []).map((p) => ({
          code: p.code,
          slug: p.slug,
          name: p.product,
          image: p.pictures?.[0]?.image_url,
        }));
        setCatalog(items);
      } catch {
        setCatalog([]);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const suggestions = useMemo(() => {
    if (!catalog) return [];
    const q = query.trim().toUpperCase();
    if (!q) return [];
    // Prioriza matches exactos, después prefix, después substring
    const exact: CatalogLite[] = [];
    const prefix: CatalogLite[] = [];
    const sub: CatalogLite[] = [];
    for (const p of catalog) {
      const code = p.code.toUpperCase();
      if (code === q) exact.push(p);
      else if (code.startsWith(q)) prefix.push(p);
      else if (code.includes(q)) sub.push(p);
    }
    return [...exact, ...prefix, ...sub].slice(0, 8);
  }, [catalog, query]);

  function handleSelect(p: CatalogLite) {
    setSelected(p);
    setQuery(p.code);
    setQuantity(1);
  }

  function handleAdd() {
    if (!selected) return;
    const qty = Math.max(1, Math.floor(quantity));
    addItem(
      {
        productCode: selected.code,
        slug: selected.slug,
        name: selected.name,
        image: selected.image,
      },
      qty,
    );
    setJustAdded(selected.code);
    setTimeout(() => setJustAdded(null), 1800);
    setSelected(null);
    setQuery("");
    setQuantity(1);
  }

  const alreadyInCart = selected ? getQuantity(selected.code) : 0;

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="codigo-input"
          className="block text-xs font-semibold text-[#0a2b3d] mb-1 uppercase tracking-wider"
        >
          Código del producto
        </label>
        <div className="relative">
          <input
            id="codigo-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            placeholder={catalog ? "Ej: 076-35, 950-32B…" : "Cargando catálogo…"}
            disabled={!catalog}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-mono focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
            autoComplete="off"
          />
          {suggestions.length > 0 && !selected && (
            <ul className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
              {suggestions.map((p) => (
                <li
                  key={p.code}
                  onClick={() => handleSelect(p)}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm flex items-center gap-3"
                >
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt={p.code}
                      className="w-8 h-8 object-contain shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-bold text-primary">
                      {p.code}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{p.name}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {selected && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-4">
          {selected.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.image}
              alt={selected.code}
              className="w-20 h-20 object-contain shrink-0 bg-white rounded-lg border border-blue-200"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-mono text-lg font-black text-primary">
              {selected.code}
            </p>
            <p className="text-sm font-semibold text-[#0a2b3d]">
              {selected.name}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Precio de compra:{" "}
              <strong>
                {formatARSNeto(getMockCompraPrice(selected.code))}
              </strong>
            </p>
            {alreadyInCart > 0 && (
              <p className="text-xs text-emerald-700 font-semibold mt-1">
                Ya tenés {alreadyInCart} en el carrito — se sumará.
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="inline-flex items-center rounded-md border border-gray-300 bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 font-bold text-gray-700"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => {
                  const v = parseInt(e.target.value || "1", 10);
                  setQuantity(Number.isNaN(v) || v < 1 ? 1 : v);
                }}
                className="w-14 h-8 text-center text-sm font-bold outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 font-bold text-gray-700"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg text-sm transition whitespace-nowrap"
            >
              + Agregar
            </button>
          </div>
        </div>
      )}

      {justAdded && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-sm text-emerald-900 font-semibold">
          ✓ {justAdded} agregado al carrito
        </div>
      )}

      {!selected && query && suggestions.length === 0 && catalog && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          No encontramos ningún producto que empiece con "{query}".
        </p>
      )}
    </div>
  );
}
