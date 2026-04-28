"use client";

import { useState } from "react";

/**
 * Botón para descargar el PDF de un comprobante (FC, NC, ND, RC) desde
 * `GET /api/b2b/comprobante`. Hace fetch en lugar de `<a target="_blank">`
 * para mostrar errores amigables (no JSON crudo) cuando el ERP devuelve
 * 404 o 4xx (típico de recibos donde Bejerman no tiene el PDF).
 */
export function ComprobantePdfButton({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "loading" | "no-pdf" | "error">(
    "idle",
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function handleClick() {
    setState("loading");
    setErrMsg(null);
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const obj = URL.createObjectURL(blob);
        window.open(obj, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(obj), 10_000);
        setState("idle");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (res.status === 404) {
        setState("no-pdf");
      } else {
        setState("error");
        setErrMsg(data.error ?? `Error ${res.status}`);
      }
    } catch (e) {
      setState("error");
      setErrMsg(e instanceof Error ? e.message : "Error de red");
    }
  }

  if (state === "no-pdf") {
    return (
      <span
        className="inline-block text-[10px] text-gray-400"
        title="El ERP no tiene PDF emitido para este comprobante. Pedíselo a Griffo si lo necesitás."
      >
        Sin PDF
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "loading"}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-primary text-primary hover:bg-primary hover:text-white font-bold text-[10px] transition disabled:opacity-50"
        title="Descargar PDF"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {state === "loading" ? "…" : "PDF"}
      </button>
      {state === "error" && errMsg && (
        <span className="text-[9px] text-red-700 max-w-[160px] text-right">
          {errMsg}
        </span>
      )}
    </div>
  );
}
