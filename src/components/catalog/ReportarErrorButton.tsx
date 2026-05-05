"use client";

import { useState } from "react";

import { ReportarErrorModal } from "./ReportarErrorModal";

type Props = {
  productoCode: string;
  productoSlug?: string;
  /** Variante visual: "link" (sutil, color gris/accent) o "button" (más prominente). */
  variant?: "link" | "button";
  className?: string;
};

export function ReportarErrorButton({
  productoCode,
  productoSlug,
  variant = "link",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);

  const baseCls =
    variant === "button"
      ? "inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-900 hover:bg-amber-100 transition"
      : "inline-flex items-center gap-1 text-xs font-medium text-gray-500 underline decoration-dotted underline-offset-2 hover:text-amber-700 hover:decoration-solid transition";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${baseCls} ${className}`}
      >
        <span aria-hidden="true">⚠️</span>
        ¿Ves un error? Reportá
      </button>
      <ReportarErrorModal
        open={open}
        onClose={() => setOpen(false)}
        productoCode={productoCode}
        productoSlug={productoSlug}
      />
    </>
  );
}
