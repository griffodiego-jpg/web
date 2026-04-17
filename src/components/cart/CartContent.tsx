"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useMockSession } from "@/lib/mock-session";

export function CartContent() {
  const { items, ready, setQuantity, removeItem, clear, count } = useCart();
  const { isLoggedIn } = useMockSession();

  if (!ready) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
        Cargando…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <h2 className="text-lg font-black text-[#0a2b3d]">
          Tu carrito está vacío
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {isLoggedIn
            ? "Entrá al catálogo y agregá productos para armar tu pedido."
            : "Ingresá como cliente B2B para armar pedidos desde el catálogo."}
        </p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <Link
            href="/catalogo"
            className="inline-block px-5 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition"
          >
            Ir al catálogo
          </Link>
          {!isLoggedIn && (
            <Link
              href="/cuenta/login"
              className="inline-block px-5 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold rounded-lg transition"
            >
              Acceso clientes
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {count} {count === 1 ? "producto" : "productos"} en el carrito
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-red-600 hover:underline font-semibold"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {items.map((it) => (
            <li key={it.productCode} className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 shrink-0 rounded-md bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
                {it.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="text-[10px] text-gray-400">Sin imagen</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/catalogo/${it.slug}`}
                  className="font-black text-primary text-lg hover:underline"
                >
                  {it.productCode}
                </Link>
                <p className="text-xs font-bold uppercase tracking-wide text-[#0a2b3d] line-clamp-1">
                  {it.name}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <div className="inline-flex items-center rounded-md border border-gray-300">
                  <button
                    type="button"
                    aria-label="Disminuir"
                    onClick={() => setQuantity(it.productCode, it.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 font-bold text-gray-700"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={it.quantity}
                    onChange={(e) => {
                      const v = parseInt(e.target.value || "0", 10);
                      setQuantity(it.productCode, Number.isNaN(v) ? 0 : v);
                    }}
                    className="w-14 h-8 text-center text-sm font-bold outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Aumentar"
                    onClick={() => setQuantity(it.productCode, it.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 font-bold text-gray-700"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Quitar del carrito"
                  onClick={() => removeItem(it.productCode)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 transition"
                  title="Quitar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Los precios finales y el total se calculan cuando confirmás el pedido.
        </p>
        <div className="flex items-center gap-2">
          <Link
            href="/catalogo"
            className="px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold rounded-lg transition text-sm"
          >
            Seguir comprando
          </Link>
          {isLoggedIn ? (
            <button
              type="button"
              disabled
              title="Disponible cuando esté activa la integración con Bejerman"
              className="px-5 py-2 bg-primary text-white font-bold rounded-lg text-sm opacity-60 cursor-not-allowed"
            >
              Confirmar pedido
            </button>
          ) : (
            <Link
              href="/cuenta/login"
              className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition text-sm"
            >
              Ingresar para confirmar
            </Link>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        🚧 El carrito todavía no se envía al ERP. Cuando la integración esté
        activa, el botón "Confirmar pedido" dispara{" "}
        <code className="px-1 py-0.5 bg-gray-100 rounded">POST /ERP/order</code>
        .
      </p>
    </div>
  );
}
