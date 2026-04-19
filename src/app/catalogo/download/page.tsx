import type { Metadata } from "next";
import { AssetImage } from "@/components/AssetImage";
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

// Dinámica: usamos headers() para chequear qué archivos existen y
// leemos overrides de Redis. No tiene sentido prerenderizar porque
// los archivos/URLs cambian en vivo desde el admin.
export const dynamic = "force-dynamic";

const secciones = [
  { id: "catalogo-pdf", label: "Catálogo de productos en PDF" },
  { id: "material-producto", label: "Material por producto" },
  { id: "material-catalogar", label: "Material para catalogar" },
];

export default async function DescargasPage() {
  const { catalogoGeneralPdf, materialPorProducto, recursosGated } =
    await resolveDescargas();

  const productos =
    navigation.find((i) => i.label === "Productos destacados")?.children ?? [];

  return (
    <>
      {/* Nav interna sticky con anchors — avisa que hay 3 bloques abajo */}
      <nav
        aria-label="Secciones de descargas"
        className="bg-primary-dark py-2 sticky top-14 z-[5] overflow-x-auto shadow"
      >
        <ul className="container mx-auto max-w-6xl px-5 flex lg:justify-center items-center gap-6 lg:gap-10 whitespace-nowrap text-sm">
          {secciones.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-white hover:text-accent transition py-2 block font-semibold"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container mx-auto max-w-6xl px-5 pt-8 pb-16 space-y-14">
        {/* 1. Catálogo de productos en PDF */}
        <section id="catalogo-pdf" className="scroll-mt-32">
          <SectionHeader
            title="Catálogo de productos en PDF"
            subtitle="Descargá el catálogo oficial Griffo con el listado completo de productos."
          />
          <div className="mt-5">
            {catalogoGeneralPdf ? (
              <CatalogoGeneralCard href={catalogoGeneralPdf} />
            ) : (
              <EmptyState text="Todavía no se subió el catálogo general." />
            )}
          </div>
        </section>

        {/* 2. Material por producto */}
        <section id="material-producto" className="scroll-mt-32">
          <SectionHeader
            title="Material por producto"
            subtitle="Flyer en PDF y video para redes sociales de cada producto destacado."
          />
          {materialPorProducto.some((m) => m.available) ? (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productos.map((p) => {
                const slug = p.href.split("/").pop()!;
                const detalle = productosDetalle[slug];
                const material = materialPorProducto.find(
                  (m) => m.slug === slug
                );
                if (!material || !material.available) return null;
                return (
                  <MaterialCard
                    key={slug}
                    nombre={p.label}
                    imagen={detalle?.image}
                    flyer={material.flyer}
                    videoRrss={material.videoRrss}
                  />
                );
              })}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState text="Todavía no se subió material de producto." />
            </div>
          )}
        </section>

        {/* 3. Material para catalogar — recursos gated. Siempre se
            muestran los forms (capturan leads aunque el archivo no esté
            todavía disponible). */}
        <section id="material-catalogar" className="scroll-mt-32">
          <SectionHeader
            title="Material para catalogar"
            subtitle="Completá el formulario una vez por recurso y te damos acceso inmediato a la descarga."
          />
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recursosGated.map((r) => (
              <RecursoGatedCard key={r.id} recurso={r} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="border-l-4 border-accent pl-4">
      <h2 className="text-xl lg:text-2xl font-bold text-[#0a2b3d] leading-tight uppercase">
        {title}
      </h2>
      <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}

function CatalogoGeneralCard({ href }: { href: string }) {
  return (
    <a
      href={href}
      download
      className="group flex flex-col sm:flex-row items-stretch bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="sm:w-56 aspect-[4/3] sm:aspect-auto bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-6">
        <PdfIcon />
      </div>
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
        <p className="text-xs uppercase tracking-wide text-accent font-bold">
          Catálogo completo · PDF
        </p>
        <h3 className="mt-1 text-lg lg:text-xl font-bold text-[#0a2b3d] group-hover:text-primary transition">
          Catálogo general Griffo
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Todos los productos, códigos y aplicaciones en un solo archivo.
        </p>
        <span className="mt-3 inline-flex items-center gap-2 text-sm text-primary font-semibold group-hover:gap-3 transition-all">
          <DownloadIcon />
          Descargar PDF
        </span>
      </div>
    </a>
  );
}

function MaterialCard({
  nombre,
  imagen,
  flyer,
  videoRrss,
}: {
  nombre: string;
  imagen?: string;
  flyer?: string;
  videoRrss?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="px-3 pt-3 pb-1">
        <h3 className="font-bold text-sm text-[#0a2b3d] leading-tight">
          {nombre}
        </h3>
      </div>
      <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
        {imagen ? (
          <AssetImage
            src={imagen}
            alt={nombre}
            bare
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <PlaceholderIcon />
        )}
      </div>
      <ul className="border-t border-gray-100 divide-y divide-gray-100">
        <DownloadRow href={flyer} label="Flyer" sub="PDF" />
        <DownloadRow href={videoRrss} label="Video para redes" sub="MP4" />
      </ul>
    </div>
  );
}

function DownloadRow({
  href,
  label,
  sub,
}: {
  href?: string;
  label: string;
  sub: string;
}) {
  if (!href) return null;
  return (
    <li>
      <a
        href={href}
        download
        className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-800 hover:bg-primary/5 hover:text-primary transition group"
      >
        <span className="font-medium">
          {label}
          <span className="ml-2 text-[10px] uppercase text-gray-400 group-hover:text-primary/70">
            {sub}
          </span>
        </span>
        <span className="text-primary group-hover:translate-y-0.5 transition-transform">
          <DownloadIcon />
        </span>
      </a>
    </li>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

function RecursoGatedCard({
  recurso,
}: {
  recurso: RecursoGated & { available: boolean };
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-primary/5 border-b border-gray-200 p-5">
        <div className="flex items-start gap-3">
          <span className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white">
            <LockIcon />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-accent font-bold">
              {recurso.tipo} · registro previo
            </p>
            <h3 className="mt-0.5 text-lg font-bold text-[#0a2b3d] leading-tight">
              {recurso.titulo}
            </h3>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-700">{recurso.descripcion}</p>
      </div>
      <div className="p-5">
        <RegistroDescargaForm
          recursoId={recurso.id}
          recursoTitulo={recurso.titulo}
          fileUrl={recurso.fileUrl}
          available={recurso.available}
        />
      </div>
    </div>
  );
}

function PdfIcon() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="5"
        fontWeight="700"
        fill="white"
        stroke="none"
      >
        PDF
      </text>
    </svg>
  );
}

function DownloadIcon() {
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
      stroke="currentColor"
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

function PlaceholderIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-gray-300"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}
