"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Error boundary global de App Router. Captura errores no manejados
 * en cualquier ruta y muestra una pantalla de fallback con opción de
 * reintentar y links a las secciones principales.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.error("[App error]", error);
    }
  }, [error]);

  return (
    <div className="container mx-auto max-w-3xl px-5 py-20 text-center">
      <p className="text-primary text-7xl lg:text-8xl font-black leading-none">
        Ups
      </p>
      <div className="mt-3 mx-auto h-1 w-20 bg-accent rounded-full" aria-hidden />
      <h1 className="mt-6 text-3xl lg:text-4xl font-black text-[#0a2b3d] uppercase tracking-tight">
        Algo salió mal
      </h1>
      <p className="mt-4 text-gray-700 text-lg">
        Tuvimos un inconveniente al cargar esta página. Probá de nuevo o
        volvé al inicio. Si el problema persiste, escribinos.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 px-8 py-2.5 uppercase bg-primary text-white font-bold rounded-full border border-primary hover:bg-white hover:text-primary transition"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-2.5 uppercase bg-white text-primary font-bold rounded-full border border-primary hover:bg-primary hover:text-white transition"
        >
          Volver al inicio
        </Link>
        <Link
          href="/contacto"
          className="inline-flex items-center gap-2 px-8 py-2.5 uppercase bg-white text-[#0a2b3d] font-bold rounded-full border border-[#0a2b3d] hover:bg-[#0a2b3d] hover:text-white transition"
        >
          Contactanos
        </Link>
      </div>

      {error?.digest ? (
        <p className="mt-10 text-xs text-gray-500 font-mono">
          Código de referencia: {error.digest}
        </p>
      ) : null}
    </div>
  );
}
