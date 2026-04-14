import Link from "next/link";
import { BannerCarousel, type Banner } from "@/components/BannerCarousel";
import { siteConfig } from "@/lib/site-config";

// Placeholder banners — reemplazar cuando tengamos las imágenes reales
// (van a /public/banners/).
const banners: Banner[] = [
  {
    id: 1,
    href: siteConfig.externalCatalog,
    alt: "Catálogo Griffo",
    image: "/banners/banner-1.jpg",
    external: true,
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

      <section className="py-10 mt-10">
        <h2 className="sr-only">Importantes</h2>
        <div className="flex items-stretch gap-6 flex-col lg:flex-row w-full px-5 lg:px-10">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="relative flex justify-center items-center flex-col gap-5 p-10 min-h-[270px] flex-1 bg-no-repeat bg-center bg-cover overflow-hidden bg-gray-800"
              style={{ backgroundImage: `url(${card.image})` }}
            >
              <div className="absolute inset-0 bg-black/35" aria-hidden />
              <h3 className="relative text-center font-bold text-2xl text-white">
                {card.title}
              </h3>
              {card.external ? (
                <a
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center justify-center gap-5 w-fit px-8 py-2 uppercase bg-black text-white font-bold rounded-full border border-black hover:bg-white hover:text-black transition"
                >
                  {card.cta}
                </a>
              ) : (
                <Link
                  href={card.href}
                  className="relative flex items-center justify-center gap-5 w-fit px-8 py-2 uppercase bg-black text-white font-bold rounded-full border border-black hover:bg-white hover:text-black transition"
                >
                  {card.cta}
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
