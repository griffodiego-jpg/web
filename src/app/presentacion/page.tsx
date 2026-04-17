import type { Metadata } from "next";
import Link from "next/link";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { productosDetalle } from "@/data/productos";
import { resolveDescargas } from "@/lib/descargas-store";
import { siteConfig } from "@/lib/site-config";

/**
 * Página hub para el QR de packaging — reemplaza el Blazor viejo en
 * presentaciongriffo.azurewebsites.net. Pensada para mobile primero
 * (la gran mayoría llega escaneando un QR con el celular).
 *
 * Estructura:
 *   1. Hero compacto con logo + tagline.
 *   2. 3 acciones rápidas (ver catálogo, PDF, WhatsApp).
 *   3. Grid de videos (los productos destacados que tienen youtubeId).
 *   4. Grid de accesos al sitio (institucional + productos + contacto).
 */

export const metadata: Metadata = {
  title: "Presentación",
  description:
    "Accedé rápido al catálogo, videos de producto y canales de contacto de Griffo.",
  alternates: { canonical: "/presentacion" },
  openGraph: {
    title: "Presentación Griffo",
    description:
      "Catálogo, videos y contacto. Todos los recursos Griffo en un solo lugar.",
    url: "/presentacion",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

type VideoCard = {
  slug: string;
  title: string;
  youtubeId: string;
};

export default async function PresentacionPage() {
  const { catalogoGeneralPdf } = await resolveDescargas();

  const videos: VideoCard[] = Object.entries(productosDetalle)
    .filter(([, p]) => !!p.youtubeId)
    .map(([slug, p]) => ({
      slug,
      title: p.title,
      youtubeId: p.youtubeId!,
    }));

  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(
    "Hola, estoy escaneando el QR de Griffo y tengo una consulta."
  )}`;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark text-white">
        <div className="absolute inset-0 opacity-10" aria-hidden>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="container mx-auto max-w-5xl px-5 py-14 lg:py-20 relative">
          <div className="flex flex-col items-center text-center gap-5">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/10 backdrop-blur border border-white/20 px-4 py-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Desde 1968
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-black leading-tight">
              Impulsamos soluciones
            </h1>
            <p className="max-w-xl text-sm lg:text-base text-white/90">
              Todos los recursos de Griffo en un solo lugar: catálogo completo,
              videos de producto y canales de contacto directo.
            </p>
          </div>
        </div>
      </section>

      {/* ACCIONES RÁPIDAS */}
      <section className="container mx-auto max-w-5xl px-5 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickAction
            href="/catalogo"
            title="Catálogo online"
            subtitle="Buscá por patente, vehículo o código"
            icon="search"
            primary
          />
          <QuickAction
            href={catalogoGeneralPdf ?? "/catalogo/download"}
            title="Catálogo PDF"
            subtitle={catalogoGeneralPdf ? "Descarga directa" : "Ver descargas"}
            icon="pdf"
            download={!!catalogoGeneralPdf}
            external={!!catalogoGeneralPdf && /^https?:\/\//.test(catalogoGeneralPdf)}
          />
          <QuickAction
            href={whatsappUrl}
            title="WhatsApp"
            subtitle="Consulta directa con el equipo"
            icon="whatsapp"
            external
          />
        </div>
      </section>

      {/* VIDEOS */}
      <section
        aria-labelledby="presentacion-videos"
        className="container mx-auto max-w-5xl px-5 py-14"
      >
        <div className="border-l-4 border-accent pl-4 mb-6">
          <h2
            id="presentacion-videos"
            className="text-xl lg:text-2xl font-bold text-[#0a2b3d] leading-tight uppercase"
          >
            Videos de producto
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Instalación, demos y aplicaciones de los productos destacados.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((v) => (
            <article
              key={v.slug}
              className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition"
            >
              <div className="aspect-video bg-black overflow-hidden">
                <YouTubeEmbed videoId={v.youtubeId} title={v.title} />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-[#0a2b3d] leading-tight">
                  {v.title}
                </h3>
                <Link
                  href={`/productos/${v.slug}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-primary font-semibold group-hover:gap-2 transition-all"
                >
                  Ver ficha completa
                  <ArrowIcon />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* EXPLORAR SITIO */}
      <section className="bg-gray-50 py-14">
        <div className="container mx-auto max-w-5xl px-5">
          <div className="border-l-4 border-accent pl-4 mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-[#0a2b3d] leading-tight uppercase">
              Explorá el sitio
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Más sobre Griffo y cómo trabajamos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <ExploreCard
              href="/productos"
              title="Productos destacados"
              desc="Máquina montadora, fuelles universales, extractor y más."
            />
            <ExploreCard
              href="/desarrollo-a-medida"
              title="Desarrollo a medida"
              desc="Piezas de caucho diseñadas para tu aplicación."
            />
            <ExploreCard
              href="/distribuidores"
              title="Distribuidores"
              desc="Dónde comprar productos Griffo en Argentina."
            />
            <ExploreCard
              href="/garantia"
              title="Garantía"
              desc="2 años en todos los productos Griffo."
            />
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="container mx-auto max-w-5xl px-5 py-14 text-center">
        <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">
          ¿Necesitás algo más?
        </p>
        <h2 className="mt-2 text-2xl lg:text-3xl font-black text-[#0a2b3d]">
          Contactá directamente con el equipo
        </h2>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-6 py-3 font-bold text-sm uppercase hover:bg-primary-dark transition"
          >
            Formulario de contacto
          </Link>
          <a
            href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary text-primary px-6 py-3 font-bold text-sm uppercase hover:bg-primary hover:text-white transition"
          >
            Llamar
          </a>
        </div>
      </section>
    </>
  );
}

/* Acción rápida: 3 cards prominentes debajo del hero */
function QuickAction({
  href,
  title,
  subtitle,
  icon,
  primary,
  external,
  download,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: "search" | "pdf" | "whatsapp";
  primary?: boolean;
  external?: boolean;
  download?: boolean;
}) {
  const classes = `group flex items-center gap-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 border ${
    primary
      ? "bg-primary text-white border-primary-dark hover:-translate-y-0.5"
      : "bg-white text-[#0a2b3d] border-gray-200 hover:-translate-y-0.5"
  }`;

  const content = (
    <>
      <span
        className={`shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full ${
          primary ? "bg-white/15 text-white" : "bg-primary/10 text-primary"
        }`}
      >
        {icon === "search" && <SearchIcon />}
        {icon === "pdf" && <PdfIcon />}
        {icon === "whatsapp" && <WhatsAppIcon />}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-bold leading-tight">{title}</span>
        <span
          className={`block text-xs mt-0.5 ${
            primary ? "text-white/80" : "text-gray-500"
          }`}
        >
          {subtitle}
        </span>
      </span>
      <span className="shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition">
        <ArrowIcon />
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }
  if (download) {
    return (
      <a href={href} download className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

function ExploreCard({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 block"
    >
      <h3 className="font-bold text-sm text-[#0a2b3d] group-hover:text-primary transition">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">{desc}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary font-semibold group-hover:gap-2 transition-all">
        Ir
        <ArrowIcon />
      </span>
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <polyline points="9 15 12 12 15 15" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.66 15l-1.32 4.82 4.94-1.3A10 10 0 1 0 12 2Zm5.92 14.34c-.25.7-1.47 1.33-2 1.4-.55.07-1.17.1-1.87-.11-.43-.13-.99-.31-1.71-.62-3.01-1.3-4.98-4.33-5.13-4.53-.15-.2-1.24-1.65-1.24-3.15S6.79 7 7.07 6.7c.28-.3.62-.38.82-.38h.59c.19 0 .45-.07.7.53.26.62.86 2.13.94 2.28.08.16.13.34.03.55-.1.2-.16.33-.31.5-.15.18-.32.4-.46.53-.15.15-.31.3-.13.6.17.3.78 1.28 1.67 2.07 1.15 1.02 2.12 1.33 2.42 1.48.3.15.48.13.66-.08.18-.21.76-.88.96-1.19.2-.3.4-.25.68-.15.27.1 1.76.83 2.05.98.3.15.5.23.57.35.07.13.07.73-.18 1.43Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
