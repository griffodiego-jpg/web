import Link from "next/link";
import { BannerCarousel, type Banner } from "@/components/BannerCarousel";
import { siteConfig } from "@/lib/site-config";

// Banners del home. Soporta imagen o hero de texto (fallback).
// Cuando tengamos los banners finales reemplazamos por { image: "/banners/..." }.
const banners: Banner[] = [
  {
    id: "buscador-patente",
    href: siteConfig.externalCatalog,
    alt: "Nuevo: Buscador por patente",
    external: true,
    title: "Nuevo! Buscador por Patente",
    subtitle:
      "Encontrá el repuesto exacto en segundos. También podés buscar por vehículo, número de pieza, palabra o medidas.",
  },
];

type FeatureCard = {
  title: string;
  image: string;
  href: string;
  cta: string;
  external?: boolean;
};

const featureCards: FeatureCard[] = [
  {
    title: "Productos",
    image: "/products/producto-card.jpg",
    href: "/productos",
    cta: "Ver todos",
  },
  {
    title: "Catálogo",
    image: "/products/catalogo-card.jpg",
    href: siteConfig.externalCatalogLogin,
    cta: "Ir al catálogo",
    external: true,
  },
  {
    title: "Lanzamientos",
    image: "/products/lanzamiento-card.jpg",
    href: "/novedades",
    cta: "Ver todos",
  },
];

export default function HomePage() {
  return (
    <>
      <BannerCarousel banners={banners} />

      <section className="py-12">
        <h2 className="sr-only">Destacados</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-5 lg:px-10">
          {featureCards.map((card) => (
            <FeatureCardTile key={card.title} card={card} />
          ))}
        </div>
      </section>
    </>
  );
}

function FeatureCardTile({ card }: { card: FeatureCard }) {
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    card.external ? (
      <a
        href={card.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden shadow-lg hover:shadow-xl transition"
      >
        {children}
      </a>
    ) : (
      <Link
        href={card.href}
        className="group block overflow-hidden shadow-lg hover:shadow-xl transition"
      >
        {children}
      </Link>
    );

  return (
    <Wrapper>
      <article className="relative bg-gray-800 min-h-[340px] flex flex-col">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat bg-gray-800"
          style={{ backgroundImage: `url(${card.image})` }}
          aria-hidden
        />
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition" />

        {/* Título centrado */}
        <div className="relative flex-1 flex items-center justify-center p-10">
          <h3 className="text-white text-3xl lg:text-4xl font-black uppercase tracking-wide drop-shadow-md">
            {card.title}
          </h3>
        </div>

        {/* Barra inferior azul con el CTA */}
        <div className="relative bg-primary group-hover:bg-primary-dark transition text-white text-center py-3.5 font-bold uppercase tracking-wider text-sm">
          {card.cta}
        </div>
      </article>
    </Wrapper>
  );
}
