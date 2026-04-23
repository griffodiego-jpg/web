import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssetImage } from "@/components/AssetImage";
import {
  BreadcrumbJsonLd,
  ProductJsonLd,
} from "@/components/StructuredData";
import { getNovedad } from "@/lib/novedades";

/** YYYY-MM → "agosto 2025" (full month para el header del detalle). */
function formatFechaMesHeader(yyyymm: string): string {
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const [y, m] = yyyymm.split("-");
  const idx = parseInt(m, 10) - 1;
  return `${meses[idx] ?? m} ${y}`;
}

type Params = Promise<{ code: string }>;

export const revalidate = 300;
export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { code } = await params;
  const novedad = await getNovedad(decodeURIComponent(code));
  if (!novedad) {
    return { title: "Novedad no encontrada" };
  }
  return {
    title: `${novedad.titulo} — ${novedad.code}`,
    description: novedad.descripcion || `${novedad.titulo} — ${novedad.code}`,
    alternates: { canonical: `/novedades/${encodeURIComponent(novedad.code)}` },
  };
}

export default async function NovedadDetallePage({
  params,
}: {
  params: Params;
}) {
  const { code } = await params;
  const novedad = await getNovedad(decodeURIComponent(code));
  if (!novedad) notFound();

  const tipoLabel =
    novedad.tipo === "lanzamiento" ? "Lanzamiento" : "Nueva aplicación";

  const detalleHref = novedad.destacadoSlug
    ? `/productos/${novedad.destacadoSlug}`
    : `/catalogo/${novedad.catalogoSlug}`;

  // Vehículos agrupados por marca para UI.
  const grouped = groupByBrand(novedad.vehiculos);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { label: "Inicio", url: "/" },
          { label: "Novedades", url: "/novedades" },
          { label: novedad.titulo, url: `/novedades/${novedad.code}` },
        ]}
      />
      <ProductJsonLd
        name={novedad.titulo}
        description={novedad.descripcion || novedad.titulo}
        image={novedad.imagen ?? "/header-icon.svg"}
        sku={novedad.code}
        url={`/novedades/${novedad.code}`}
      />

      <article className="container mx-auto max-w-4xl px-5 pt-6 pb-16">
        {/* Breadcrumb eyebrow */}
        <nav
          aria-label="Breadcrumb"
          className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-4"
        >
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-primary transition">
                Home
              </Link>
            </li>
            <li className="opacity-50">/</li>
            <li>
              <Link href="/novedades" className="hover:text-primary transition">
                Novedades
              </Link>
            </li>
            <li className="opacity-50">/</li>
            <li className="text-gray-500">{novedad.code}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white ${
              novedad.tipo === "lanzamiento" ? "bg-primary" : "bg-accent"
            }`}
          >
            {tipoLabel}
          </span>
          {/* Fecha: siempre en Lanzamientos; en Aplicaciones solo si el
              admin cargó un mes. */}
          {(novedad.tipo === "lanzamiento" || novedad.fechaMes) && (
            <time
              className="text-xs text-gray-500 font-semibold uppercase tracking-wide"
              dateTime={novedad.fecha.toISOString()}
            >
              {novedad.fechaMes
                ? formatFechaMesHeader(novedad.fechaMes)
                : novedad.fecha.toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
            </time>
          )}
        </div>

        <p className="text-primary font-mono font-black text-3xl lg:text-4xl leading-none">
          {novedad.code}
        </p>
        <h1 className="mt-2 text-2xl lg:text-3xl font-bold text-[#0a2b3d] leading-tight">
          {novedad.titulo}
        </h1>
        {novedad.linea && (
          <p className="mt-1 text-xs uppercase tracking-wide text-accent font-bold">
            {novedad.linea}
          </p>
        )}

        {/* Imagen + descripción */}
        <div className="mt-6 grid md:grid-cols-[auto_1fr] gap-6 items-start">
          {novedad.imagen && (
            <div className="bg-gray-50 rounded-lg p-5 flex items-center justify-center md:w-64 aspect-square">
              <AssetImage
                src={novedad.imagen}
                alt={novedad.titulo}
                bare
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
          <div className="space-y-4">
            {novedad.descripcion && (
              <p className="text-gray-800 leading-relaxed">
                {novedad.descripcion}
              </p>
            )}
            <Link
              href={detalleHref}
              className="inline-flex items-center gap-2 px-6 py-2.5 uppercase bg-primary text-white font-bold rounded-full border border-primary hover:bg-white hover:text-primary transition text-sm"
            >
              {novedad.destacadoSlug
                ? "Ver ficha del producto"
                : "Ver en el catálogo"}
              <ArrowIcon />
            </Link>
          </div>
        </div>

        {/* Vehículos compatibles — masonry de marcas */}
        {grouped.length > 0 && (
          <section className="mt-10">
            <h2 className="font-bold text-lg text-[#0a2b3d] uppercase tracking-wide border-l-4 border-accent pl-3 mb-4">
              {novedad.tipo === "aplicacion"
                ? "Vehículos alcanzados por esta nueva aplicación"
                : "Vehículos compatibles"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {grouped.map((g) => (
                <div
                  key={g.brand}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <p className="font-bold text-sm text-[#0a2b3d] uppercase">
                    {g.brand}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-gray-700">
                    {g.models.map((m) => (
                      <li key={m}>• {m}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}

function groupByBrand(vehicles: { brand: string; master_model: string; model: string }[]) {
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
    .sort((a, b) => a.brand.localeCompare(b.brand));
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
