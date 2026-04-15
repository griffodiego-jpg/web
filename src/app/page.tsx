import Link from "next/link";
import { BuscadorPatenteBanner } from "@/components/BuscadorPatenteBanner";
import { TrustStrip } from "@/components/TrustStrip";
import { siteConfig } from "@/lib/site-config";

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
      {/*
        Banner principal: reconstrucción vectorial del "Buscador por Patente".
        Se adapta solo a todos los tamaños de pantalla (mobile/tablet/desktop).
        Envuelto en <a> para mantener el comportamiento del slide original
        (clickeable, lleva al catálogo externo).
      */}
      <a
        href={siteConfig.externalCatalog}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Nuevo buscador por patente — Ir al catálogo"
        className="block"
      >
        <BuscadorPatenteBanner />
      </a>

      <section className="py-10 lg:py-12">
        <h2 className="sr-only">Destacados</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-5 lg:px-10">
          {featureCards.map((card) => (
            <FeatureCardTile key={card.title} card={card} />
          ))}
        </div>
      </section>

      <TrustStrip />
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
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat bg-gray-800"
          style={{ backgroundImage: `url(${card.image})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition" />

        <div className="relative flex-1 flex items-center justify-center p-10">
          <h3 className="text-white text-3xl lg:text-4xl font-black uppercase tracking-wide drop-shadow-md">
            {card.title}
          </h3>
        </div>

        <div className="relative bg-primary group-hover:bg-primary-dark transition text-white text-center py-3.5 font-bold uppercase tracking-wider text-sm">
          {card.cta}
        </div>
      </article>
    </Wrapper>
  );
}
