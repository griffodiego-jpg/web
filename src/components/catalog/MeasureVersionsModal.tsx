"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import type { MeasureVersion } from "@/lib/catalog/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Código base del grupo (ej. '162'). */
  baseCode: string;
  versions: MeasureVersion[];
};

export function MeasureVersionsModal({ open, onClose, baseCode, versions }: Props) {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Versiones del código ${baseCode}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
              Versiones del código
            </p>
            <p className="text-2xl font-black leading-tight text-primary">{baseCode}</p>
            <p className="mt-0.5 text-[11px] text-gray-500">
              {versions.length} versiones disponibles. Elegí una para ver el detalle.
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
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {versions.map((v) => (
              <li key={v.code}>
                <Link
                  href={`/catalogo/${v.productSlug}`}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition hover:border-accent hover:shadow-sm"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-50">
                    {v.imageUrl ? (
                      <Image
                        src={v.imageUrl}
                        alt={v.product}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[9px] text-gray-400">
                        Sin foto
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black leading-none text-primary">{v.code}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[#0a2b3d]">
                      {v.product}
                    </p>
                    {v.description ? (
                      <p className="mt-0.5 truncate text-[11px] text-gray-500">
                        {v.description}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[11px] font-bold text-accent">Ver detalle →</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
