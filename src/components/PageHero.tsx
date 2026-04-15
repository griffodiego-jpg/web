import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Marcador de página en construcción.
 * Se usa en las secciones cuyo contenido todavía no está replicado.
 * El "título" de la página vive en el navbar resaltado (estado activo),
 * no en un hero dentro del cuerpo.
 */
export function ComingSoon({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-3xl px-5 py-20 text-center">
      <div className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-semibold uppercase tracking-wide">
        En construcción
      </div>
      <h2 className="mt-4 text-3xl lg:text-4xl font-black text-[#0a2b3d]">
        {title}
      </h2>
      <p className="mt-3 text-gray-600">
        Estamos trabajando en esta sección. Pronto vas a poder encontrar acá
        toda la información.
      </p>
      {children && <div className="mt-8 text-left">{children}</div>}
      <Link
        href="/"
        className="inline-block mt-8 px-6 py-2 uppercase bg-black text-white font-bold rounded-full border border-black hover:bg-white hover:text-black transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
