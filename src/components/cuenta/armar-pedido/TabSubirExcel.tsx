"use client";

import { useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { PedidoParsePreview } from "./PedidoParsePreview";
import type { ParsedPedido } from "@/lib/excel/parse-pedido";

/**
 * Tab "Subir Excel" — botón para bajar el modelo + dropzone para subir.
 * Parsea server-side y muestra preview antes de agregar al carrito.
 */
export function TabSubirExcel() {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ParsedPedido | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setPreview(null);
    setFilename(file.name);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/b2b/pedidos/parse", {
        method: "POST",
        body: fd,
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
    setFilename("");
  }

  return (
    <div className="space-y-4">
      {/* Paso 1: bajar modelo */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div>
          <p className="font-bold text-blue-900">
            1. Bajate el Excel modelo
          </p>
          <p className="text-xs text-blue-800 mt-0.5">
            Tiene todos los códigos del catálogo, línea, tipo y demás
            info para ayudarte. Completá la columna CANTIDAD (amarilla)
            y guardalo.
          </p>
        </div>
        <a
          href="/api/b2b/pedidos/excel-modelo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg text-sm whitespace-nowrap transition"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Descargar modelo (XLSX)
        </a>
      </div>

      {/* Paso 2: subir */}
      <div>
        <p className="font-bold text-[#0a2b3d] mb-2">
          2. Subí el archivo completado
        </p>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
            dragging
              ? "border-primary bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-primary/50 hover:bg-blue-50/50"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              // Reseteamos para poder subir el mismo archivo dos veces
              e.target.value = "";
            }}
          />
          {loading ? (
            <div className="text-sm text-gray-600 font-semibold">
              Procesando {filename}…
            </div>
          ) : (
            <>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-gray-400"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="mt-2 text-sm font-semibold text-[#0a2b3d]">
                Arrastrá el archivo acá o hacé click para seleccionar
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Formatos: .xlsx, .xls, .csv · Máx 5 MB
              </p>
            </>
          )}
        </div>
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
          onCancel={() => {
            setPreview(null);
            setFilename("");
          }}
        />
      )}
    </div>
  );
}
