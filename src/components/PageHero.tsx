import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Hero simple usado en la cabecera de cada página interna.
 * Muestra breadcrumb + título + bajada.
 */
export function PageHero({
  title,
  lead,
  breadcrumb = [],
}: {
  title: string;
  lead?: string;
  breadcrumb?: { label: string; href?: string }[];
}) {
  return (
    <section className="bg-primary text-white py-14 px-5">
      <div className="container mx-auto max-w-5xl">
        {breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-3 text-sm opacity-90">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:underline">
                  Inicio
                </Link>
              </li>
              {breadcrumb.map((b, i) => (
                <li key={i} className="flex items-center gap-1">
                  <span>/</span>
                  {b.href ? (
                    <Link href={b.href} className="hover:underline">
                      {b.label}
                    </Link>
                  ) : (
                    <span>{b.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tight">
          {title}
        </h1>
        {lead && (
          <p className="mt-3 text-lg lg:text-xl max-w-3xl opacity-95">{lead}</p>
        )}
      </div>
    </section>
  );
}

/**
 * Marcador de página en construcción.
 * Se usa en las secciones cuyo contenido todavía no está replicado.
 */
export function ComingSoon({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-3xl px-5 py-16 text-center">
      <div className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-semibold uppercase tracking-wide">
        En construcción
      </div>
      <h2 className="mt-4 text-2xl lg:text-3xl font-bold">{title}</h2>
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
