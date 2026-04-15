import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Cabecera estándar de página interna.
 *
 * Muestra:
 *   - breadcrumb pequeño arriba (opcional)
 *   - título dominante en negro corporativo (text-6xl font-black)
 *   - línea accent celeste como divisor
 *   - lead / subtítulo (opcional)
 *
 * Diseñado para ocupar poco espacio vertical pero ser visualmente
 * dominante — aprovecha mejor el viewport que el patrón anterior.
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
    <section className="container mx-auto max-w-6xl px-5 pt-8 pb-6">
      {breadcrumb.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="mb-3 text-xs uppercase tracking-wide text-gray-500 font-semibold"
        >
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-primary transition">
                Inicio
              </Link>
            </li>
            {breadcrumb.map((b, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="opacity-50">/</span>
                {b.href ? (
                  <Link
                    href={b.href}
                    className="hover:text-primary transition"
                  >
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-[#0a2b3d]">{b.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0a2b3d] uppercase tracking-tight leading-none">
        {title}
      </h1>
      <div
        aria-hidden
        className="mt-3 h-1 w-20 bg-accent rounded-full"
      />
      {lead && (
        <p className="mt-5 text-base lg:text-lg text-gray-700 max-w-3xl">
          {lead}
        </p>
      )}
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
