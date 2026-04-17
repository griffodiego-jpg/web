import Link from "next/link";
import { AssetImage } from "@/components/AssetImage";
import type { Novedad } from "@/lib/novedades";

/**
 * Card de novedad — grande, pensada para que entre harta info sin
 * sentirse apretada. Muestra hasta 12 vehículos antes de truncar.
 * Si es un producto destacado, el link va a /productos/[slug]; sino,
 * al catálogo o al detalle de la novedad.
 */
export function NovedadCard({ novedad }: { novedad: Novedad }) {
  const detalleHref = novedad.destacadoSlug
    ? `/productos/${novedad.destacadoSlug}`
    : `/catalogo/${novedad.catalogoSlug}`;

  // Agrupamos vehículos por marca para compactar visualmente.
  const grouped = groupByBrand(novedad.vehiculos);
  const maxBrands = 6;
  const shownBrands = grouped.slice(0, maxBrands);
  const hiddenCount = grouped.slice(maxBrands).reduce(
    (acc, b) => acc + b.models.length,
    0
  );

  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Header con badge del tipo + fecha */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <TipoBadge tipo={novedad.tipo} />
        <time
          className="text-xs text-gray-400 font-semibold uppercase tracking-wide"
          dateTime={novedad.fecha.toISOString()}
        >
          {formatFecha(novedad.fecha)}
        </time>
      </div>

      <div className="flex flex-col md:flex-row gap-5 p-5 pt-2">
        {/* Imagen a la izquierda (desktop) */}
        {novedad.imagen && (
          <div className="md:w-48 shrink-0 bg-gray-50 rounded-lg p-3 flex items-center justify-center aspect-square md:aspect-auto md:h-48">
            <AssetImage
              src={novedad.imagen}
              alt={novedad.titulo}
              bare
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}

        {/* Contenido */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Código grande */}
          <p className="text-primary font-mono font-black text-2xl leading-none">
            {novedad.code}
          </p>

          {/* Título + línea */}
          <h3 className="mt-2 font-bold text-lg text-[#0a2b3d] leading-tight">
            {novedad.titulo}
          </h3>
          {novedad.linea && (
            <p className="mt-1 text-xs uppercase tracking-wide text-accent font-bold">
              {novedad.linea}
            </p>
          )}

          {/* Descripción */}
          {novedad.descripcion && (
            <p className="mt-3 text-sm text-gray-700 leading-relaxed line-clamp-3">
              {novedad.descripcion}
            </p>
          )}

          {/* Vehículos compatibles — agrupados por marca, hasta 6 marcas */}
          {grouped.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
                {novedad.tipo === "aplicacion"
                  ? "Nuevas aplicaciones"
                  : "Vehículos compatibles"}
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {shownBrands.map((g) => (
                  <li
                    key={g.brand}
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 rounded-full px-3 py-1"
                  >
                    <span className="font-bold text-[#0a2b3d]">{g.brand}</span>
                    <span className="text-gray-600">
                      ({g.models.slice(0, 4).join(" · ")}
                      {g.models.length > 4 ? ` +${g.models.length - 4}` : ""})
                    </span>
                  </li>
                ))}
                {hiddenCount > 0 && (
                  <li className="text-xs text-gray-500 self-center">
                    +{hiddenCount} vehículos más
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link
              href={detalleHref}
              className="inline-flex items-center gap-1.5 text-sm text-primary font-bold hover:gap-2 transition-all"
            >
              {novedad.destacadoSlug
                ? "Ver producto destacado"
                : "Ver en catálogo"}
              <ArrowIcon />
            </Link>
            <span className="text-gray-300">·</span>
            <Link
              href={`/novedades/${encodeURIComponent(novedad.code)}`}
              className="text-sm text-gray-500 hover:text-primary transition"
            >
              Ver novedad
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function TipoBadge({ tipo }: { tipo: "lanzamiento" | "aplicacion" }) {
  if (tipo === "lanzamiento") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
        <SparkIcon />
        Lanzamiento
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
      <CarIcon />
      Nueva aplicación
    </span>
  );
}

function groupByBrand(vehicles: Novedad["vehiculos"]) {
  const map = new Map<string, Set<string>>();
  for (const v of vehicles) {
    if (!v.brand) continue;
    const key = v.brand.toUpperCase();
    if (!map.has(key)) map.set(key, new Set());
    const label = v.master_model || v.model;
    if (label) map.get(key)!.add(label);
  }
  return Array.from(map.entries())
    .map(([brand, models]) => ({
      brand,
      models: Array.from(models).sort(),
    }))
    .sort((a, b) => b.models.length - a.models.length);
}

function formatFecha(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 2z" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h.5A1.5 1.5 0 0 1 21 12.5v4a1.5 1.5 0 0 1-1.5 1.5H19v1a1 1 0 0 1-2 0v-1H7v1a1 1 0 0 1-2 0v-1h-.5A1.5 1.5 0 0 1 3 16.5v-4A1.5 1.5 0 0 1 4.5 11H5zm2.1 0h9.8l-1-3H8.1l-1 3zm-.6 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm11 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
    </svg>
  );
}
