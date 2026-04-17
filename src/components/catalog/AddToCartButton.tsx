"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";

interface Props {
  productCode: string;
  slug: string;
  name: string;
  image?: string;
  compact?: boolean;
}

/**
 * Botón "Agregar al carrito" con selector de cantidad inline.
 *
 * Flujo:
 *   1. Si el producto no está en el carrito → botón único "Agregar".
 *      Al apretarlo se expande en [- 1 +] [Agregar] para que el usuario
 *      elija la cantidad sin navegar fuera de la página.
 *   2. Si el producto ya está → muestra [- N +] directamente, donde N
 *      es la cantidad actual en el carrito. Tocar los controles actualiza
 *      la cantidad en tiempo real.
 *   3. Todos los eventos hacen stopPropagation para no disparar la
 *      navegación al detalle que hay en la tarjeta contenedora.
 */
export function AddToCartButton({
  productCode,
  slug,
  name,
  image,
  compact,
}: Props) {
  const { getQuantity, addItem, setQuantity } = useCart();
  const currentQty = getQuantity(productCode);
  const [expanded, setExpanded] = useState(false);
  const [draftQty, setDraftQty] = useState(1);

  const stop = (fn: () => void) => (e: React.SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    fn();
  };

  // Si ya tiene cantidad → mostrar controles siempre
  if (currentQty > 0) {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 rounded-md border border-primary bg-white text-primary"
      >
        <button
          type="button"
          aria-label="Disminuir cantidad"
          onClick={stop(() => setQuantity(productCode, currentQty - 1))}
          className="w-7 h-7 flex items-center justify-center hover:bg-primary hover:text-white rounded-l-md font-bold text-sm"
        >
          −
        </button>
        <span
          className={`min-w-[28px] text-center font-bold ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {currentQty}
        </span>
        <button
          type="button"
          aria-label="Aumentar cantidad"
          onClick={stop(() => setQuantity(productCode, currentQty + 1))}
          className="w-7 h-7 flex items-center justify-center hover:bg-primary hover:text-white rounded-r-md font-bold text-sm"
        >
          +
        </button>
      </div>
    );
  }

  // Si todavía no tiene cantidad y no está expandido → botón inicial
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={stop(() => {
          setDraftQty(1);
          setExpanded(true);
        })}
        className={`inline-flex items-center gap-1 rounded-md bg-primary hover:bg-primary-dark text-white font-bold transition whitespace-nowrap ${
          compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
        }`}
      >
        <svg
          width={compact ? "12" : "14"}
          height={compact ? "12" : "14"}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        Agregar
      </button>
    );
  }

  // Expandido → selector de cantidad + confirmar
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1"
    >
      <div className="inline-flex items-center rounded-md border border-gray-300 bg-white">
        <button
          type="button"
          aria-label="Disminuir"
          onClick={stop(() => setDraftQty((q) => Math.max(1, q - 1)))}
          className="w-6 h-7 flex items-center justify-center hover:bg-gray-100 rounded-l-md font-bold text-sm text-gray-700"
        >
          −
        </button>
        <input
          type="number"
          min={1}
          value={draftQty}
          onChange={(e) => {
            const v = parseInt(e.target.value || "1", 10);
            setDraftQty(Number.isNaN(v) || v < 1 ? 1 : v);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-10 h-7 text-center text-xs font-bold outline-none"
        />
        <button
          type="button"
          aria-label="Aumentar"
          onClick={stop(() => setDraftQty((q) => q + 1))}
          className="w-6 h-7 flex items-center justify-center hover:bg-gray-100 rounded-r-md font-bold text-sm text-gray-700"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={stop(() => {
          addItem({ productCode, slug, name, image }, draftQty);
          setExpanded(false);
        })}
        className="px-2 py-1 rounded-md bg-primary hover:bg-primary-dark text-white font-bold text-[10px] whitespace-nowrap transition"
      >
        OK
      </button>
      <button
        type="button"
        aria-label="Cancelar"
        onClick={stop(() => setExpanded(false))}
        className="w-6 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
    </div>
  );
}
