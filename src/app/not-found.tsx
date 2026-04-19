import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "La página que buscás no existe o fue movida.",
  robots: { index: false, follow: true },
};

/**
 * Página 404 custom.
 *
 * Prioriza que el usuario no se vaya: le ofrece un buscador directo al
 * catálogo (donde la gran mayoría está tratando de llegar), botón al
 * home, y quick links a las secciones más populares.
 */
export default function NotFound() {
  return (
    <div className="container mx-auto max-w-3xl px-5 py-16 lg:py-20 text-center">
      {/* Número 404 grande */}
      <p className="text-primary text-7xl lg:text-8xl font-black leading-none">
        404
      </p>
      <div
        className="mt-3 mx-auto h-1 w-20 bg-accent rounded-full"
        aria-hidden
      />
      <h1 className="mt-6 text-2xl lg:text-3xl font-black text-[#0a2b3d] uppercase tracking-tight">
        Página no encontrada
      </h1>
      <p className="mt-3 text-gray-600">
        La página que buscás no existe o fue movida. Probá buscar el producto
        en el catálogo o volvé al inicio.
      </p>

      {/* Buscador → manda directo a /catalogo con la query */}
      <form
        action="/catalogo"
        method="GET"
        className="mt-8 max-w-xl mx-auto flex gap-2"
      >
        <input
          type="search"
          name="q"
          placeholder="Buscá un producto, vehículo o código..."
          aria-label="Buscar en el catálogo"
          className="flex-1 min-w-0 rounded-full border border-gray-300 px-5 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
        />
        <button
          type="submit"
          className="shrink-0 inline-flex items-center gap-2 rounded-full bg-primary text-white px-5 py-3 font-bold text-sm uppercase hover:bg-primary-dark transition"
        >
          <SearchIcon />
          Buscar
        </button>
      </form>

      {/* CTAs principales */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2 text-sm uppercase bg-white text-primary font-bold rounded-full border border-primary hover:bg-primary hover:text-white transition"
        >
          Volver al inicio
        </Link>
        <Link
          href="/contacto"
          className="inline-flex items-center gap-2 px-6 py-2 text-sm uppercase bg-white text-[#0a2b3d] font-bold rounded-full border border-gray-300 hover:bg-gray-100 transition"
        >
          Contactanos
        </Link>
      </div>

      {/* Quick links a secciones populares */}
      <div className="mt-14 pt-8 border-t border-gray-200">
        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-4">
          Quizás te interese
        </p>
        <ul className="flex flex-wrap justify-center gap-2">
          {QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-block px-4 py-2 text-sm font-semibold text-[#0a2b3d] bg-gray-100 rounded-full hover:bg-primary hover:text-white transition"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const QUICK_LINKS = [
  { label: "Catálogo online", href: "/catalogo" },
  { label: "Productos destacados", href: "/productos" },
  { label: "Empresa", href: "/empresa" },
  { label: "Distribuidores", href: "/distribuidores" },
  { label: "Desarrollo a medida", href: "/desarrollo-a-medida" },
  { label: "Garantía", href: "/garantia" },
];

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
