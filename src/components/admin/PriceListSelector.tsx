"use client";

import { useState } from "react";

/**
 * Selector inline para asignar el código de lista de precios a un
 * cliente. Auto-guarda al cambiar. El admin de listas vive en
 * `/admin/listas-precios`; las opciones acá son los códigos ya
 * cargados (lo pasa el server) más una opción "Otro…" para
 * tipear uno nuevo a mano.
 */
export function PriceListSelector({
  clientCode,
  initialPriceListCode,
  knownCodes,
}: {
  clientCode: string;
  initialPriceListCode?: string;
  knownCodes: string[];
}) {
  const [value, setValue] = useState(initialPriceListCode ?? "");
  const [custom, setCustom] = useState(
    initialPriceListCode && !knownCodes.includes(initialPriceListCode)
      ? initialPriceListCode
      : "",
  );
  const [mode, setMode] = useState<"select" | "custom">(
    initialPriceListCode && !knownCodes.includes(initialPriceListCode)
      ? "custom"
      : "select",
  );
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<"saved" | "error" | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function persist(next: string) {
    setBusy(true);
    setFeedback(null);
    setErrMsg(null);
    try {
      const res = await fetch("/api/admin/clientes/lista-precios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: clientCode, priceListCode: next }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      setFeedback("saved");
      setTimeout(() => setFeedback(null), 2500);
    } catch (e) {
      setFeedback("error");
      setErrMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  function onSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    if (v === "__custom__") {
      setMode("custom");
      return;
    }
    setMode("select");
    setValue(v);
    void persist(v);
  }

  function onCustomBlur() {
    const v = custom.trim().toUpperCase();
    if (v === value) return;
    setValue(v);
    void persist(v);
  }

  function onCustomKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  }

  return (
    <div className="flex items-center gap-2">
      {mode === "select" ? (
        <select
          value={value}
          onChange={onSelectChange}
          disabled={busy}
          className="px-2 py-1 border border-gray-300 rounded text-xs font-mono bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none disabled:opacity-50 min-w-[110px]"
        >
          <option value="">— Sin asignar —</option>
          {knownCodes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value="__custom__">Otro…</option>
        </select>
      ) : (
        <input
          type="text"
          autoFocus
          value={custom}
          onChange={(e) => setCustom(e.target.value.toUpperCase())}
          onBlur={onCustomBlur}
          onKeyDown={onCustomKeyDown}
          placeholder="LISTA…"
          disabled={busy}
          className="px-2 py-1 border border-gray-300 rounded text-xs font-mono bg-white uppercase focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none disabled:opacity-50 w-[110px]"
        />
      )}
      <span className="w-4 text-xs">
        {busy ? (
          <span className="text-gray-400">…</span>
        ) : feedback === "saved" ? (
          <span className="text-emerald-600 font-bold" title="Guardado">
            ✓
          </span>
        ) : feedback === "error" ? (
          <span
            className="text-red-600 font-bold cursor-help"
            title={errMsg ?? "Error"}
          >
            !
          </span>
        ) : null}
      </span>
    </div>
  );
}
