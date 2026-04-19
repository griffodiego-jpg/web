"use client";

import { useState } from "react";
import { formatARS, formatARSNeto } from "@/lib/mock-prices";
import type { ParsedPedido } from "@/lib/excel/parse-pedido";

/**
 * Preview de lo que vamos a agregar al carrito tras parsear un Excel /
 * textarea. Muestra productos válidos + errores por fila/código. El
 * cliente confirma o cancela.
 */
export function PedidoParsePreview({
  preview,
  onConfirm,
  onCancel,
}: {
  preview: ParsedPedido;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [showInvalid, setShowInvalid] = useState(false);
  const { valid, invalid } = preview;
  const total = valid.reduce((a, it) => a + it.unitPrice * it.quantity, 0);
  const totalUnidades = valid.reduce((a, it) => a + it.quantity, 0);

  if (valid.length === 0 && invalid.length === 0) {
    return (
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        No encontramos ningún código con cantidad válida para cargar.
      </p>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-black text-lg text-[#0a2b3d]">
            Revisá antes de agregar
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Todavía no se tocó el carrito. Confirmá para agregarlos.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
            ✓ {valid.length} válidos
          </span>
          {invalid.length > 0 && (
            <button
              type="button"
              onClick={() => setShowInvalid((v) => !v)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 border border-red-200 text-red-800 font-bold hover:bg-red-100"
            >
              ✗ {invalid.length} con errores ·{" "}
              {showInvalid ? "ocultar" : "ver"}
            </button>
          )}
        </div>
      </header>

      {/* Válidos */}
      {valid.length > 0 && (
        <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
          <div className="max-h-[360px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-100 text-left uppercase tracking-wider text-gray-600 text-[10px] sticky top-0">
                <tr>
                  <th className="px-3 py-2 font-bold">Código</th>
                  <th className="px-3 py-2 font-bold">Producto</th>
                  <th className="px-3 py-2 font-bold text-right">Cant.</th>
                  <th className="px-3 py-2 font-bold text-right">Unitario</th>
                  <th className="px-3 py-2 font-bold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {valid.map((it) => (
                  <tr key={it.productCode}>
                    <td className="px-3 py-2 font-mono font-bold text-primary">
                      {it.productCode}
                    </td>
                    <td className="px-3 py-2 text-[#0a2b3d]">{it.name}</td>
                    <td className="px-3 py-2 text-right">{it.quantity}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      {formatARS(it.unitPrice)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">
                      {formatARS(it.unitPrice * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-2 text-right font-bold text-[11px] uppercase tracking-wider text-gray-600"
                  >
                    Total · {totalUnidades}{" "}
                    {totalUnidades === 1 ? "unidad" : "unidades"}
                  </td>
                  <td className="px-3 py-2 text-right font-black text-[#0a2b3d] whitespace-nowrap">
                    {formatARSNeto(total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Errores */}
      {showInvalid && invalid.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-red-100 text-left uppercase tracking-wider text-red-900 text-[10px]">
              <tr>
                <th className="px-3 py-2 font-bold">Fila</th>
                <th className="px-3 py-2 font-bold">Código</th>
                <th className="px-3 py-2 font-bold">Cantidad</th>
                <th className="px-3 py-2 font-bold">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-200">
              {invalid.map((it, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 text-red-900">{it.row}</td>
                  <td className="px-3 py-2 font-mono text-red-900">
                    {it.rawCode || "—"}
                  </td>
                  <td className="px-3 py-2 text-red-900">
                    {it.rawQuantity || "—"}
                  </td>
                  <td className="px-3 py-2 text-red-800">{it.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:text-[#0a2b3d] font-bold text-sm"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={valid.length === 0}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {valid.length > 0
            ? `+ Agregar ${valid.length} ${valid.length === 1 ? "producto" : "productos"} al carrito`
            : "Nada para agregar"}
        </button>
      </div>
    </div>
  );
}
