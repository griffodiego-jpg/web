import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "La página que buscás no existe o fue movida.",
  robots: { index: false, follow: true },
};

/**
 * Página 404 custom con sugerencias de navegación hacia las secciones
 * más populares del sitio. Mejor UX que una página vacía.
 */
export default function NotFound() {
  return (
    <div className="container mx-auto max-w-3xl px-5 py-20 text-center">
      <p className="text-primary text-7xl lg:text-8xl font-black leading-none">
        404
      </p>
      <div className="mt-3 mx-auto h-1 w-20 bg-accent rounded-full" aria-hidden />
      <h1 className="mt-6 text-3xl lg:text-4xl font-black text-[#0a2b3d] uppercase tracking-tight">
        Página no encontrada
      </h1>
      <p className="mt-4 text-gray-600 text-lg">
        Parece que la página que buscás no existe, cambió de dirección o está
        temporalmente fuera de servicio.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-2.5 uppercase bg-primary text-white font-bold rounded-full border border-primary hover:bg-white hover:text-primary transition"
        >
          Volver al inicio
        </Link>
        <Link
          href="/contacto"
          className="inline-flex items-center gap-2 px-8 py-2.5 uppercase bg-white text-primary font-bold rounded-full border border-primary hover:bg-primary hover:text-white transition"
        >
          Contactanos
        </Link>
      </div>

      {/* Accesos rápidos a las secciones más populares */}
      <div className="mt-16 pt-10 border-t border-gray-200">
        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-5">
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
  { label: "Empresa", href: "/empresa" },
  { label: "Productos destacados", href: "/productos" },
  { label: "Distribuidores", href: "/distribuidores" },
  { label: "Desarrollo a medida", href: "/desarrollo-a-medida" },
  { label: "Garantía", href: "/garantia" },
  { label: "Contacto", href: "/contacto" },
];
