"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from "react";

/**
 * Lightbox simple: click en una imagen → se abre full-screen con
 * fondo oscuro. Click en cualquier lugar o presionar Escape cierra.
 *
 * Uso: envolver cualquier <img> o <AssetImage> con este componente:
 *   <Lightbox src="/products/foto.jpg" alt="Producto">
 *     <img src="/products/foto.jpg" alt="Producto" />
 *   </Lightbox>
 */
export function Lightbox({
  src,
  alt,
  children,
}: {
  src: string;
  alt: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="cursor-zoom-in"
        role="button"
        tabIndex={0}
        aria-label={`Ampliar: ${alt}`}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
      >
        {children}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 animate-in fade-in"
          onClick={close}
          role="dialog"
          aria-label={alt}
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10 cursor-pointer"
            aria-label="Cerrar"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
