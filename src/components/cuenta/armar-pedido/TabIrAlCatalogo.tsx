"use client";

import Link from "next/link";

/**
 * Tab "Ir al buscador" — panel informativo que explica qué ofrece el
 * catálogo público + CTA para ir a `/catalogo`. Desde ahí el cliente
 * puede buscar por patente, vehículo o medidas y agregar al mismo
 * carrito que el resto de los tabs.
 */
export function TabIrAlCatalogo() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-700">
        Si todavía no sabés el código exacto o querés buscar por otros
        criterios, el buscador online del catálogo te deja encontrar
        productos de 5 formas. Todo lo que agregues va al mismo
        carrito.
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <ModoBusqueda
          icon="🔍"
          titulo="Por palabra"
          descripcion="Escribí cualquier palabra: vehículo, código, medida, etc."
        />
        <ModoBusqueda
          icon="🚗"
          titulo="Por patente"
          descripcion="Ingresá la patente argentina y te muestra qué le encaja."
        />
        <ModoBusqueda
          icon="🚙"
          titulo="Por vehículo"
          descripcion="Elegí marca → modelo → año."
        />
        <ModoBusqueda
          icon="📏"
          titulo="Por medidas"
          descripcion="Diámetros y largo (fuelle cremallera, semieje, tope)."
        />
      </ul>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg text-sm transition"
        >
          Ir al buscador del catálogo
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M17 7H9M17 7v8" />
          </svg>
        </Link>
        <p className="text-xs text-gray-500">
          Se abre en el catálogo público. Los productos que agregues
          aparecen acá en el carrito.
        </p>
      </div>
    </div>
  );
}

function ModoBusqueda({
  icon,
  titulo,
  descripcion,
}: {
  icon: string;
  titulo: string;
  descripcion: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <div>
        <p className="font-bold text-[#0a2b3d] text-sm">{titulo}</p>
        <p className="text-xs text-gray-600">{descripcion}</p>
      </div>
    </li>
  );
}
