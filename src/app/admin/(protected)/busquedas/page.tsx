import type { Metadata } from "next";
import Link from "next/link";

import { BusquedasView } from "@/components/admin/BusquedasView";
import { getZeroResultStats } from "@/lib/search-log";

export const metadata: Metadata = {
  title: "Búsquedas",
};

// Dynamic: el log cambia con cada búsqueda del público.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function BusquedasPage() {
  const rows = await getZeroResultStats(200, true);

  return (
    <div>
      <h1 className="text-3xl font-black text-[#0a2b3d]">Búsquedas</h1>
      <p className="mt-2 max-w-3xl text-sm text-gray-600">
        Lo que la gente busca en el catálogo. Está en dos lugares
        complementarios:
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Card 1 — Esta página: zero-results */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <h2 className="text-base font-black text-amber-900">
              Búsquedas sin resultados
            </h2>
          </div>
          <p className="mt-2 text-sm text-amber-900/80">
            Cada vez que alguien busca algo en{" "}
            <span className="font-mono">/catalogo</span> y no aparece nada,
            queda registrado acá. Sirve para detectar demanda real:{" "}
            <strong>
              productos que la gente pide y no fabricamos, o están con un
              nombre que no encuentran
            </strong>
            . Datos abajo en la tabla.
          </p>
        </div>

        {/* Card 2 — GA4: ranking de exitosas */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h2 className="text-base font-black text-blue-900">
              Búsquedas con resultados (Google Analytics)
            </h2>
          </div>
          <p className="mt-2 text-sm text-blue-900/80">
            Las búsquedas que sí encuentran productos (las exitosas, las más
            comunes, en qué tab) se loguean automáticamente en GA4.
          </p>
          <a
            href="https://analytics.google.com/analytics/web/#/p/reports/explorer?params=_u..nav%3Dmaui%26_r.explorerCard..hideHighlightFilter%3Dtrue&r=event-search"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
          >
            Abrir Google Analytics ↗
          </a>
          <details className="mt-3 text-xs text-blue-900/80">
            <summary className="cursor-pointer font-bold">
              Cómo encontrar las estadísticas en GA4
            </summary>
            <ol className="ml-4 mt-2 list-decimal space-y-1">
              <li>
                Entrá a Google Analytics con la cuenta de Griffo (property{" "}
                <span className="font-mono">G-FR8KN76LQ2</span>).
              </li>
              <li>
                Sidebar → <strong>Informes</strong> →{" "}
                <strong>Interacción</strong> → <strong>Eventos</strong>.
              </li>
              <li>
                Buscá el evento <span className="font-mono">search</span> →
                click → arriba aparece el ranking de queries
                (<span className="font-mono">search_term</span>) con su volumen.
              </li>
              <li>
                El evento <span className="font-mono">view_search_results</span>{" "}
                te separa búsquedas con resultados vs sin (parámetro{" "}
                <span className="font-mono">results_count</span>).
              </li>
              <li>
                <span className="font-mono">select_item</span> = clicks a
                productos desde el catálogo.{" "}
                <span className="font-mono">view_item</span> = vistas del
                detalle del producto.
              </li>
            </ol>
            <p className="mt-2">
              ⏱️ <strong>Latencia:</strong> los eventos custom (search,
              search_term) suelen aparecer en GA4 con un delay de 24-48 hs la
              primera vez. Después es tiempo casi-real.
            </p>
          </details>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-black text-[#0a2b3d]">
          Búsquedas sin resultados — registro en vivo
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Top 200 queries con cero resultados, ordenadas por frecuencia.
          Marcá una como <strong>resuelta</strong> cuando agregues el
          producto / la sinónimo / la categoría que la gente buscaba; queda
          archivada (la podés ver con el toggle).
        </p>

        <BusquedasView rows={rows} />

        <p className="mt-4 text-xs text-gray-400">
          ↪ Complementario: los reportes detallados de productos faltantes
          (con foto, vehículo, código OEM, etc.) los manda la gente desde el
          banner &quot;¿No encontraste el producto?&quot; y aparecen en{" "}
          <Link
            href="/admin/leads"
            className="text-primary underline hover:text-primary/80"
          >
            Formularios → tab Sugerencias
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
