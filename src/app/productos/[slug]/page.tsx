import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssetImage } from "@/components/AssetImage";
import { ComingSoon } from "@/components/PageHero";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { navigation } from "@/lib/site-config";
import { productosDetalle, type Beneficio } from "@/data/productos";

type Params = Promise<{ slug: string }>;

function findProducto(slug: string) {
  const productos =
    navigation.find((i) => i.label === "Productos destacados")?.children ?? [];
  return productos.find((p) => p.href.endsWith(`/${slug}`));
}

export async function generateStaticParams() {
  const productos =
    navigation.find((i) => i.label === "Productos destacados")?.children ?? [];
  return productos.map((p) => ({
    slug: p.href.split("/").pop()!,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const producto = findProducto(slug);
  const detalle = productosDetalle[slug];
  return {
    title: detalle?.title ?? producto?.label ?? "Producto",
    description: detalle?.description,
    openGraph: detalle
      ? {
          title: detalle.title,
          description: detalle.description,
          images: [detalle.image],
          type: "article",
        }
      : undefined,
  };
}

export default async function ProductoDetallePage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const producto = findProducto(slug);
  if (!producto) notFound();

  const detalle = productosDetalle[slug];

  return (
    <>
      <Breadcrumb label={producto.label} />

      {detalle ? (
        <ProductoFullDetalle detalle={detalle} />
      ) : (
        <ComingSoon title={`Detalle de ${producto.label}`} />
      )}
    </>
  );
}

/* Breadcrumb chiquito arriba de la página */
function Breadcrumb({ label }: { label: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="container mx-auto max-w-6xl px-5 pt-6 text-xs uppercase tracking-wide text-gray-500 font-semibold"
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-primary transition">
            Home
          </Link>
        </li>
        <li className="opacity-50">/</li>
        <li>
          <Link href="/productos" className="hover:text-primary transition">
            Productos destacados
          </Link>
        </li>
        <li className="opacity-50">/</li>
        <li className="text-[#0a2b3d]">{label}</li>
      </ol>
    </nav>
  );
}

function ProductoFullDetalle({
  detalle,
}: {
  detalle: (typeof productosDetalle)[string];
}) {
  return (
    <article className="container mx-auto max-w-6xl px-5 pt-4 pb-16">
      <h1 className="text-3xl lg:text-4xl text-primary font-bold">
        {detalle.title}
      </h1>

      <div className="mt-10 grid lg:grid-cols-2 grid-cols-1 gap-8 items-start">
        {/* Imagen del producto */}
        <div className="flex justify-center lg:justify-start">
          <AssetImage
            src={detalle.image}
            alt={detalle.title}
            bare
            className="max-w-[550px] max-h-[380px] w-full h-auto object-contain"
          />
        </div>

        {/* Texto + CTA */}
        <div className="lg:p-6 space-y-5">
          <p className="font-bold text-lg text-[#0a2b3d]">{detalle.tagline}</p>
          {detalle.descriptions.map((p, i) => (
            <p
              key={i}
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: p }}
            />
          ))}
          {detalle.cta && (
            <a
              href={detalle.cta.url}
              target={detalle.cta.external ? "_blank" : undefined}
              rel={detalle.cta.external ? "noopener noreferrer" : undefined}
              className="inline-flex items-center justify-center gap-3 px-10 py-2.5 uppercase bg-primary text-white font-bold rounded-full border border-primary hover:bg-white hover:text-primary transition-all duration-300"
            >
              {detalle.cta.label}
              {detalle.cta.external && (
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
                  <path d="M7 17L17 7M17 7H9M17 7v8" />
                </svg>
              )}
            </a>
          )}
        </div>

        {/* Caja de beneficios */}
        {detalle.beneficios && detalle.beneficios.length > 0 && (
          <BeneficiosBox beneficios={detalle.beneficios} />
        )}

        {/* Video de YouTube */}
        {detalle.youtubeId && (
          <div>
            <YouTubeEmbed
              videoId={detalle.youtubeId}
              title={`${detalle.title} — Video`}
            />
          </div>
        )}
      </div>
    </article>
  );
}

function BeneficiosBox({ beneficios }: { beneficios: Beneficio[] }) {
  return (
    <dl className="bg-gray-100 p-8 lg:p-10 rounded space-y-3">
      <dt className="font-bold text-primary text-xl lg:text-2xl mb-2">
        Beneficios principales:
      </dt>
      {beneficios.map((b, i) => (
        <dd key={i} className="text-gray-800 leading-relaxed">
          <span className="font-bold text-[#0a2b3d]">{b.label}: </span>
          {b.text}
        </dd>
      ))}
    </dl>
  );
}
