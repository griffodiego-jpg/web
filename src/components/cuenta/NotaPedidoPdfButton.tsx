"use client";

import { useState } from "react";

/**
 * Botón para bajar la Nota de Pedido (NP) del ERP. Hace la request con
 * fetch en lugar de `<a target="_blank">` para poder mostrar errores
 * amigables en vez de JSON crudo cuando el endpoint falla.
 */
export function NotaPedidoPdfButton({ erpOrderId }: { erpOrderId: string }) {
  const [state, setState] = useState<
    "idle" | "loading" | "error-temporal" | "error-permanente"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleClick() {
    setState("loading");
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/b2b/nota-pedido?erpOrderId=${encodeURIComponent(erpOrderId)}`,
      );
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener,noreferrer");
        // Liberamos el objectURL después que el browser lo abrió.
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
        setState("idle");
        return;
      }
      // 404 = endpoint no soporta NP → error permanente.
      // 5xx = problema transitorio de la API → sugerimos reintentar.
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      const msg = data.error ?? `Error ${res.status}`;
      if (res.status === 404) {
        setState("error-permanente");
        setErrorMsg(
          "La descarga de la Nota de Pedido todavía no está disponible desde el ERP. Escribinos a ventas@griffo.com.ar y te la pasamos.",
        );
      } else {
        setState("error-temporal");
        setErrorMsg(msg);
      }
    } catch (e) {
      setState("error-temporal");
      setErrorMsg(e instanceof Error ? e.message : "Error de red");
    }
  }

  if (state === "error-permanente") {
    return (
      <span
        className="inline-block text-[10px] text-gray-400 whitespace-nowrap"
        title={errorMsg ?? undefined}
      >
        No disponible
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "loading"}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-primary text-primary hover:bg-primary hover:text-white font-bold text-[10px] transition whitespace-nowrap disabled:opacity-50"
        title="Descargar Nota de Pedido"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {state === "loading" ? "…" : "Ver pedido"}
      </button>
      {state === "error-temporal" && errorMsg && (
        <span className="text-[9px] text-red-700 max-w-[160px] text-right">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
