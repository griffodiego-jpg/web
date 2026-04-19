"use client";

import { useB2BPreferences } from "@/lib/b2b-preferences";
import { formatARSNeto, getMockCompraPrice } from "@/lib/mock-prices";

/**
 * Muestra el precio de un producto aplicando las preferencias del usuario
 * (modo compra vs PVP + margen). Siempre agrega "+ IVA".
 *
 * Hoy usa precios mock determinísticos. Cuando esté activa la integración
 * con Bejerman, se pasa `compraPrice` desde el padre (traído de
 * POST /ERP/prices) y el componente mantiene la lógica de display.
 */
export function ProductPrice({
  productCode,
  compraPrice,
  size = "md",
}: {
  productCode: string;
  /** Override opcional para cuando tengamos precio real del ERP. */
  compraPrice?: number;
  size?: "sm" | "md" | "lg";
}) {
  const { prefs, ready } = useB2BPreferences();
  const base = compraPrice ?? getMockCompraPrice(productCode);
  const value =
    prefs.priceMode === "pvp" && ready
      ? base * (1 + prefs.marginPct / 100)
      : base;

  const priceClass =
    size === "lg"
      ? "text-2xl"
      : size === "sm"
        ? "text-sm"
        : "text-lg";
  const labelClass =
    size === "lg" ? "text-[11px]" : size === "sm" ? "text-[9px]" : "text-[10px]";

  const label =
    prefs.priceMode === "pvp" && ready
      ? "PVP sugerido"
      : "Precio de compra";

  return (
    <div className="flex flex-col">
      <span
        className={`${labelClass} font-bold uppercase tracking-wider text-gray-500`}
      >
        {label}
      </span>
      <span className={`${priceClass} font-black text-[#0a2b3d] leading-none`}>
        {formatARSNeto(value)}
      </span>
    </div>
  );
}
