"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Preferencias del cliente B2B para la visualización de precios en el
 * catálogo. Persisten en localStorage (mientras no haya auth real).
 * Cuando haya auth + Firestore, mover a un doc del usuario — la API
 * del hook queda igual, sólo cambia el storage backend.
 *
 * - priceMode:
 *   · "compra" → mostrar el precio neto del distribuidor (viene de
 *     /ERP/prices).
 *   · "pvp" → precio de compra * (1 + marginPct / 100). Útil para que
 *     el distribuidor vea de un vistazo a qué precio final puede
 *     vender el producto.
 * - marginPct: margen en porcentaje. 0-1000 (sin tope pero clampeado
 *   por sanidad en la UI).
 */

export type PriceMode = "compra" | "pvp";

export interface B2BPreferences {
  priceMode: PriceMode;
  marginPct: number;
}

const STORAGE_KEY = "griffo:b2b:prefs";
const DEFAULT_PREFS: B2BPreferences = {
  priceMode: "compra",
  marginPct: 30,
};

function readStorage(): B2BPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<B2BPreferences>;
    return {
      priceMode: parsed.priceMode === "pvp" ? "pvp" : "compra",
      marginPct:
        typeof parsed.marginPct === "number" && parsed.marginPct >= 0
          ? parsed.marginPct
          : DEFAULT_PREFS.marginPct,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function useB2BPreferences(): {
  prefs: B2BPreferences;
  setPriceMode: (mode: PriceMode) => void;
  setMarginPct: (pct: number) => void;
  ready: boolean;
} {
  const [prefs, setPrefs] = useState<B2BPreferences>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPrefs(readStorage());
    setReady(true);
  }, []);

  const save = useCallback((next: B2BPreferences) => {
    setPrefs(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      // Notificamos a otras pestañas / a componentes que escuchan en la
      // misma pestaña (storage event no dispara local por default).
      window.dispatchEvent(new CustomEvent("b2b-prefs-change", { detail: next }));
    } catch {
      /* storage lleno o deshabilitado — tolerar */
    }
  }, []);

  // Sincroniza con cambios en otras pestañas o componentes.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setPrefs(readStorage());
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<B2BPreferences>).detail;
      if (detail) setPrefs(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("b2b-prefs-change", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("b2b-prefs-change", onCustom as EventListener);
    };
  }, []);

  return {
    prefs,
    ready,
    setPriceMode: (priceMode: PriceMode) => save({ ...prefs, priceMode }),
    setMarginPct: (marginPct: number) =>
      save({ ...prefs, marginPct: Math.max(0, marginPct) }),
  };
}

/**
 * Aplica el modo de precio elegido por el usuario. Usalo en ProductCard /
 * detalle de producto cuando haya precios reales en el catálogo.
 */
export function displayPrice(
  basePriceCompra: number,
  prefs: B2BPreferences,
): number {
  if (prefs.priceMode === "pvp") {
    return basePriceCompra * (1 + prefs.marginPct / 100);
  }
  return basePriceCompra;
}
