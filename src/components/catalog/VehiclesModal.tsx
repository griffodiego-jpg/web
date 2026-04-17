"use client";

import { useEffect } from "react";

import type { SpecPartsVehicle } from "@/types/specparts";

type Props = {
  open: boolean;
  onClose: () => void;
  productCode: string;
  productName: string;
  vehicles: SpecPartsVehicle[];
};

export function VehiclesModal({ open, onClose, productCode, productName, vehicles }: Props) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const grouped = groupVehiclesByBrand(vehicles);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vehicles-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-xl font-black leading-tight text-primary">{productCode}</p>
            <p className="text-xs font-bold uppercase tracking-wide text-[#0a2b3d]">
              {productName}
            </p>
            <p id="vehicles-modal-title" className="mt-1 text-[11px] text-gray-500">
              {vehicles.length} {vehicles.length === 1 ? "vehículo compatible" : "vehículos compatibles"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-gray-500 transition hover:bg-gray-100 hover:text-[#0a2b3d]"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="flex flex-col gap-4">
            {Object.entries(grouped).map(([brand, list]) => (
              <li key={brand}>
                <h3 className="text-sm font-black text-[#0a2b3d]">{brand}</h3>
                <ul className="mt-1 flex flex-col gap-0.5 pl-0">
                  {list.map((v, i) => (
                    <li key={`${brand}-${i}`} className="text-xs text-gray-700">
                      <span className="font-semibold">{v.master_model || v.model}</span>
                      {v.version ? <span className="text-gray-500"> — {v.version}</span> : null}
                      {v.sold_from_year && v.sold_until_year ? (
                        <span className="text-gray-400">
                          {" "}
                          ({v.sold_from_year}–{v.sold_until_year})
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function groupVehiclesByBrand(vehicles: SpecPartsVehicle[]): Record<string, SpecPartsVehicle[]> {
  const out: Record<string, SpecPartsVehicle[]> = {};
  for (const v of vehicles) {
    const brand = v.brand || "Otros";
    if (!out[brand]) out[brand] = [];
    out[brand].push(v);
  }
  return out;
}
