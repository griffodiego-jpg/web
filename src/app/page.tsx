import Image from "next/image";
import Link from "next/link";
import { BannerCarousel } from "@/components/BannerCarousel";
import { TrustStrip } from "@/components/TrustStrip";
import { listActiveBanners } from "@/lib/banners-store";

// ISR — el carousel cambia cuando el admin edita banners. Las APIs de
// save/delete/reorder hacen revalidatePath("/") para refresh inmediato.
export const revalidate = 3600;

type FeatureCard = {
  title: string;
  image: string;
  href: string;
  cta: string;
  external?: boolean;
};

const featureCards: FeatureCard[] = [
  {
    title: "Productos Destacados",
    image: "/products/producto-card.jpg",
    href: "/productos",
    cta: "Ver todos",
  },
  {
    title: "Catálogo online",
    image: "/products/catalogo-card.jpg",
    href: "/catalogo",
    cta: "Ir al catálogo",
  },
  {
    title: "Lanzamientos",
    image: "/products/lanzamiento-card.webp",
    href: "/novedades",
    cta: "Ver todos",
  },
];

export default async function HomePage() {
  // Los banners activos vienen del admin (Redis). Si está vacío, el
  // carousel cae al buscador de patente built-in por default.
  const banners = await listActiveBanners();

  return (
    <>
      <BannerCarousel banners={banners} />

      <TrustStrip />

      <section className="py-10 lg:py-12">
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
      <article className="relative bg-gray-700 min-h-[340px] flex flex-col items-center justify-center p-10 gap-5">
        <Image
          src={card.image}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover grayscale-[85%] brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition duration-500"
        />
        <div
          className="absolute inset-0 bg-black/55 group-hover:bg-black/30 transition duration-500"
          aria-hidden
        />

        <h3 className="relative text-white text-3xl lg:text-4xl font-black uppercase tracking-wide drop-shadow-md text-center">
          {card.title}
        </h3>
        <span className="relative inline-flex items-center justify-center px-8 py-2.5 uppercase bg-black text-white text-sm font-bold rounded-full border border-black group-hover:bg-white group-hover:text-black transition duration-300">
          {card.cta}
        </span>
      </article>
    </Wrapper>
  );
}
