import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssetImage } from "@/components/AssetImage";
import { ComingSoon } from "@/components/PageHero";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { navigation } from "@/lib/site-config";
import {
  productosDetalle,
  type Beneficio,
  type KitContiene,
  type Presentacion,
  type ProductoDetalle,
} from "@/data/productos";

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

function ProductoFullDetalle({ detalle }: { detalle: ProductoDetalle }) {
  return (
    <>
      <article className="container mx-auto max-w-6xl px-5 pt-4 pb-8">
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
            {detalle.tagline && (
              <p className="font-bold text-lg text-[#0a2b3d]">
                {detalle.tagline}
              </p>
            )}

            {detalle.descriptions.map((p, i) => (
              <p
                key={i}
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: p }}
              />
            ))}

            {/* Lista de features con flechas → */}
            {detalle.features && detalle.features.length > 0 && (
              <ul className="space-y-3">
                {detalle.features.map((f, i) => (
                  <li
                    key={i}
                    className="text-gray-800 leading-relaxed flex gap-2"
                  >
                    <span className="text-primary font-bold">→</span>
                    <span
                      dangerouslySetInnerHTML={{ __html: f }}
                      className="flex-1"
                    />
                  </li>
                ))}
              </ul>
            )}

            {/* Aplicación */}
            {detalle.aplicacion && (
              <h3 className="text-gray-800 font-semibold">
                {detalle.aplicacion}
              </h3>
            )}

            {/* Código */}
            {detalle.codigo && (
              <p className="text-gray-800">
                <strong>Código:</strong> {detalle.codigo}
              </p>
            )}

            {/* CTA de compra */}
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

      {/* Sección "El kit contiene" */}
      {detalle.kitContiene && <KitContieneBox kit={detalle.kitContiene} />}

      {/* Sección "Presentación" con variantes */}
      {detalle.presentacion && (
        <PresentacionBox presentacion={detalle.presentacion} />
      )}
    </>
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
          {b.label ? (
            <>
              <span className="font-bold text-[#0a2b3d]">{b.label}: </span>
              {b.text}
            </>
          ) : (
            b.text
          )}
        </dd>
      ))}
    </dl>
  );
}

function KitContieneBox({ kit }: { kit: KitContiene }) {
  return (
    <section className="bg-primary/10">
      <div className="container mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
          <div className="text-center lg:text-left">
            <h2 className="font-bold text-2xl lg:text-3xl text-primary">
              {kit.title}
            </h2>
            <ul className="list-disc list-inside space-y-2 mt-4 text-base lg:text-lg font-medium text-gray-800">
              {kit.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          {kit.image && (
            <div className="shrink-0">
              <AssetImage
                src={kit.image}
                alt={kit.title}
                bare
                className="block w-full h-auto max-w-[300px] lg:max-w-[350px] object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PresentacionBox({ presentacion }: { presentacion: Presentacion }) {
  return (
    <section className="container mx-auto max-w-6xl px-5 lg:px-20 py-14">
      <h2 className="font-bold text-2xl lg:text-3xl text-primary text-center">
        {presentacion.title}
      </h2>

      <div className="mt-10 space-y-10">
        {presentacion.modelos.map((modelo, idx) => (
          <div key={idx}>
            {idx > 0 && (
              <div className="border-t border-gray-300 mb-10" aria-hidden />
            )}
            <div className="grid lg:grid-cols-4 grid-cols-2 gap-6 place-items-center">
              {/* Nombre del modelo */}
              <div className="text-center lg:text-left col-span-2 lg:col-span-1">
                <h3 className="font-bold text-primary text-lg">
                  {modelo.nombre}
                </h3>
              </div>
              {/* Celdas */}
              {modelo.celdas.map((celda, i) => (
                <figure key={i} className="text-center">
                  <span className="block mb-2 text-primary text-sm font-semibold">
                    {celda.label}
                  </span>
                  <AssetImage
                    src={celda.image}
                    alt={`${modelo.nombre} — ${celda.label}`}
                    bare
                    className="w-full h-full max-w-[180px] max-h-[180px] object-contain aspect-square mx-auto"
                  />
                  {celda.codigo && (
                    <figcaption className="font-bold mt-2 text-[#0a2b3d]">
                      {celda.codigo}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
