"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { PedidoParsePreview } from "./PedidoParsePreview";
import type { ParsedPedido } from "@/lib/excel/parse-pedido";

/**
 * Tab "Pegar varios" — textarea para pegar código + cantidad por línea.
 * Se parsea server-side via /api/b2b/pedidos/parse y se muestra preview
 * antes de agregar al carrito.
 */
export function TabPegarVarios() {
  const { addItem } = useCart();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ParsedPedido | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleProcesar() {
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const res = await fetch("/api/b2b/pedidos/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        result?: ParsedPedido;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.result) {
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      setPreview(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (!preview) return;
    for (const it of preview.valid) {
      addItem(
        {
          productCode: it.productCode,
          slug: it.slug,
          name: it.name,
          image: it.image,
        },
        it.quantity,
      );
    }
    setPreview(null);
    setText("");
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="bulk-input"
          className="block text-xs font-semibold text-[#0a2b3d] mb-1 uppercase tracking-wider"
        >
          Pegá códigos + cantidades — uno por línea
        </label>
        <textarea
          id="bulk-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={`076-35  10
950-32B  5
AB 25-40  25
955-32  2`}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-mono focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-y"
        />
        <p className="text-xs text-gray-500 mt-1">
          Formato aceptado:{" "}
          <code className="bg-gray-100 px-1 rounded">código cantidad</code>
          {" "}— separados por espacios, tabs o comas. El código puede tener
          espacios internos (ej. <code className="bg-gray-100 px-1 rounded">AB 25-40</code>).
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleProcesar}
          disabled={loading || !text.trim()}
          className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Procesando…" : "Procesar → Preview"}
        </button>
        {preview && (
          <button
            type="button"
            onClick={() => {
              setText("");
              setPreview(null);
            }}
            className="px-4 py-2 text-gray-600 hover:text-[#0a2b3d] font-bold text-sm"
          >
            Limpiar
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {preview && (
        <PedidoParsePreview
          preview={preview}
          onConfirm={handleConfirm}
          onCancel={() => setPreview(null)}
        />
      )}
    </div>
  );
}
