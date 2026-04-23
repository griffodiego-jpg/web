/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { RegistroDescargaForm } from "@/components/RegistroDescargaForm";
import type { RecursoGated } from "@/data/descargas";
import { productosDetalle } from "@/data/productos";
import { resolveDescargas } from "@/lib/descargas-store";
import { navigation } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Descargas",
  description:
    "Descargá el catálogo general Griffo, material comercial por producto (flyers y videos) y recursos para distribuidores (banco de imágenes y base de datos).",
  alternates: { canonical: "/catalogo/download" },
};

export const dynamic = "force-dynamic";

export default async function DescargasPage() {
  const { catalogoGeneralPdf, materialPorProducto, recursosGated } =
    await resolveDescargas();

  const productos =
    navigation.find((i) => i.label === "Productos destacados")?.children ?? [];

  return (
    <div className="container mx-auto max-w-4xl px-5 py-6 lg:py-10">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden divide-y divide-gray-100">
        {/* 1. Catálogo general */}
        {catalogoGeneralPdf ? (
          <ListRow
            imagen="/products/catalogo-card.jpg"
            titulo="Catálogo de productos"
            subtitulo="PDF · todos los productos y aplicaciones"
          >
            <DownloadButton href={catalogoGeneralPdf} label="Descargar PDF" />
          </ListRow>
        ) : null}

        {/* 2. Material por producto */}
        {productos.map((p) => {
          const slug = p.href.split("/").pop()!;
          const detalle = productosDetalle[slug];
          const material = materialPorProducto.find((m) => m.slug === slug);
          if (!material || !material.available) return null;
          return (
            <ListRow
              key={slug}
              imagen={detalle?.image}
              titulo={p.label}
              subtitulo="Material comercial"
            >
              {material.flyer ? (
                <DownloadButton href={material.flyer} label="Flyer" />
              ) : null}
              {material.videoRrss ? (
                <DownloadButton href={material.videoRrss} label="Video" />
              ) : null}
            </ListRow>
          );
        })}

        {/* 3. Recursos gated */}
        {recursosGated.map((r) => (
          <GatedRow key={r.id} recurso={r} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Piezas ---------- */

function ListRow({
  imagen,
  titulo,
  subtitulo,
  children,
}: {
  imagen?: string;
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 p-4 hover:bg-gray-50 transition">
      <div className="shrink-0 w-16 h-16 rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100">
        {imagen ? (
          <img
            src={imagen}
            alt={titulo}
            className="w-full h-full object-contain p-1"
            loading="lazy"
          />
        ) : (
          <DocIcon />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#0a2b3d] text-sm leading-tight">
          {titulo}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{subtitulo}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
        {children}
      </div>
    </div>
  );
}

function DownloadButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-md text-xs font-bold transition whitespace-nowrap"
    >
      <DownloadIcon />
      {label}
    </a>
  );
}

function GatedRow({
  recurso,
}: {
  recurso: RecursoGated & { available: boolean };
}) {
  return (
    <details className="group">
      <summary className="flex flex-wrap sm:flex-nowrap items-center gap-4 p-4 hover:bg-gray-50 transition cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="shrink-0 w-16 h-16 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-center">
          <LockIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#0a2b3d] text-sm leading-tight">
            {recurso.titulo}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {recurso.tipo} · requiere registro
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-md text-xs font-bold transition">
          Registrarme
          <ChevronIcon />
        </span>
      </summary>
      <div className="border-t border-gray-100 bg-gray-50/70 p-5">
        <p className="mb-4 text-sm text-gray-700 max-w-2xl">
          {recurso.descripcion}
        </p>
        <RegistroDescargaForm
          recursoId={recurso.id}
          recursoTitulo={recurso.titulo}
          fileUrl={recurso.fileUrl}
          available={recurso.available}
        />
      </div>
    </details>
  );
}

/* ---------- Íconos ---------- */

function DownloadIcon() {
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
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-primary-value)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="transition-transform group-open:rotate-180"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9ca3af"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
