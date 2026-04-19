"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import {
  formatARSNeto,
  getMockCompraPrice,
  formatARS,
} from "@/lib/mock-prices";
import { TabPorCodigo } from "./armar-pedido/TabPorCodigo";
import { TabPegarVarios } from "./armar-pedido/TabPegarVarios";
import { TabSubirExcel } from "./armar-pedido/TabSubirExcel";

type TabKey = "codigo" | "pegar" | "excel";

const TABS: { key: TabKey; label: string; description: string }[] = [
  {
    key: "codigo",
    label: "Por código",
    description: "Ingresá el código y cantidad, uno por vez.",
  },
  {
    key: "pegar",
    label: "Pegar varios",
    description: "Pegá una lista de códigos + cantidades de una sola vez.",
  },
  {
    key: "excel",
    label: "Subir Excel",
    description: "Descargá el modelo, completalo y subílo.",
  },
];

export function ArmarPedidoClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("codigo");
  const { items, count, setQuantity, removeItem, clear } = useCart();

  const total = items.reduce(
    (sum, it) => sum + getMockCompraPrice(it.productCode) * it.quantity,
    0,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
      {/* Panel principal */}
      <div>
        {/* Tabs */}
        <nav className="flex gap-1 border-b border-gray-200 mb-5 overflow-x-auto">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
                  active
                    ? "border-primary text-[#0a2b3d] font-black"
                    : "border-transparent text-gray-600 hover:text-[#0a2b3d]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <p className="text-xs text-gray-500 mb-4">
          {TABS.find((t) => t.key === activeTab)?.description}
        </p>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          {activeTab === "codigo" && <TabPorCodigo />}
          {activeTab === "pegar" && <TabPegarVarios />}
          {activeTab === "excel" && <TabSubirExcel />}
        </div>
      </div>

      {/* Carrito sticky al costado */}
      <aside className="lg:sticky lg:top-4 lg:self-start bg-white border border-gray-200 rounded-xl p-4">
        <header className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">
              Tu carrito
            </p>
            <p className="text-lg font-black text-[#0a2b3d]">
              {count} {count === 1 ? "unidad" : "unidades"}
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="text-[10px] text-red-600 hover:underline font-semibold"
            >
              Vaciar
            </button>
          )}
        </header>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            Tu carrito está vacío.
            <br />
            Agregá productos desde cualquiera de las 3 opciones.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto -mx-1 px-1">
              {items.map((it) => {
                const unit = getMockCompraPrice(it.productCode);
                return (
                  <li
                    key={it.productCode}
                    className="py-2 flex items-center gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs font-bold text-primary truncate">
                        {it.productCode}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {it.name}
                      </p>
                      <p className="text-[11px] text-gray-700 mt-0.5">
                        {it.quantity} × {formatARS(unit)}
                      </p>
                    </div>
                    <div className="inline-flex items-center rounded-md border border-gray-300 shrink-0">
                      <button
                        type="button"
                        aria-label="-"
                        onClick={() =>
                          setQuantity(it.productCode, it.quantity - 1)
                        }
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 text-xs font-bold text-gray-700"
                      >
                        −
                      </button>
                      <span className="min-w-[24px] text-center text-xs font-bold">
                        {it.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="+"
                        onClick={() =>
                          setQuantity(it.productCode, it.quantity + 1)
                        }
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 text-xs font-bold text-gray-700"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label="Quitar"
                      onClick={() => removeItem(it.productCode)}
                      className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-600"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="pt-3 mt-3 border-t border-gray-200">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-xs font-semibold text-gray-600">
                  Total
                </span>
                <p className="text-lg font-black text-[#0a2b3d]">
                  {formatARSNeto(total)}
                </p>
              </div>
              <Link
                href="/carrito"
                className="block w-full text-center px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition text-sm"
              >
                Ir a confirmar →
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
