import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ProductGallery } from "@/components/catalog/ProductGallery";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/StructuredData";
import { getFeaturedSlug } from "@/data/featured-products";
import { getProductBySlug, listCatalog } from "@/lib/api/specparts";
import { getMercadoLibreUrl } from "@/lib/catalog/utils";
import { SITE_URL } from "@/lib/site-url";
import type { SpecPartsVehicle } from "@/types/specparts";

export const revalidate = 1800;
export const dynamicParams = true;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  try {
    const products = await listCatalog();
    // Los destacados tienen landing propia en /productos/[slug] — no pre-renderizamos
    // sus rutas en /catalogo/[slug] para evitar duplicados de URLs en Google.
    return products
      .filter((p) => !getFeaturedSlug(p.code))
      .map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return { title: "Producto" };

  const title = `${product.code} — ${product.product}`;
  const description = product.description
    ? `${product.description}. Repuesto Griffo código ${product.code}, categoría ${product.category}.`
    : `Repuesto Griffo código ${product.code}, ${product.product}, categoría ${product.category}.`;
  const image = product.pictures?.[0]?.image_url;

  return {
    title,
    description,
    alternates: { canonical: `/catalogo/${slug}` },
    openGraph: {
      title: `${title} | Griffo`,
      description,
      url: `/catalogo/${slug}`,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function ProductoCatalogoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) notFound();

  // Si alguien entra directo a /catalogo/<slug> y el producto es uno de los
  // destacados, lo mandamos a su landing rica en /productos/<slug-destacado>.
  const featuredSlug = getFeaturedSlug(product.code);
  if (featuredSlug) {
    redirect(`/productos/${featuredSlug}`);
  }

  const primaryImage = product.pictures?.[0]?.image_url ?? "";
  const meliUrl = getMercadoLibreUrl(product);
  const productUrl = `${SITE_URL}/catalogo/${slug}`;

  const vehiclesByBrand = groupVehiclesByBrand(product.vehicles ?? []);
  const attributes = product.attributes ?? [];

  return (
    <section className="container mx-auto max-w-6xl px-5 pt-6 pb-16">
      <ProductJsonLd
        name={`${product.code} — ${product.product}`}
        description={product.description || product.product}
        image={primaryImage}
        sku={product.code}
        url={productUrl}
      />
      <BreadcrumbJsonLd
        items={[
          { label: "Inicio", url: SITE_URL },
          { label: "Catálogo", url: `${SITE_URL}/catalogo` },
          { label: product.code, url: productUrl },
        ]}
      />

      <nav className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <Link href="/catalogo" className="hover:text-primary">
          ← Volver al catálogo
        </Link>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery pictures={product.pictures ?? []} alt={product.description || product.product} />

        <div className="flex flex-col gap-4">
          <div>
            <span className="inline-block rounded-md bg-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-accent">
              {product.category}
            </span>
            <h1 className="mt-2 text-4xl font-black text-primary">{product.code}</h1>
            <p className="mt-1 text-lg font-bold text-[#0a2b3d]">{product.product}</p>
            {product.description ? (
              <p className="mt-1 text-sm text-gray-600">{product.description}</p>
            ) : null}
          </div>

          {attributes.length > 0 ? (
            <section>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                Medidas / Atributos
              </h2>
              <dl className="grid grid-cols-2 gap-2">
                {attributes.map((a, i) => (
                  <div key={`${a.name}-${i}`} className="rounded-lg bg-primary/5 p-3">
                    <dt className="text-[10px] font-bold uppercase text-gray-500">{a.name}</dt>
                    <dd className="mt-0.5 text-sm font-bold text-[#0a2b3d]">
                      {a.value} {a.unit}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {meliUrl ? (
            <a
              href={meliUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFE600] px-5 py-3 text-sm font-bold text-[#333] shadow-sm transition hover:brightness-95"
            >
              Comprar en MercadoLibre ↗
            </a>
          ) : null}
        </div>
      </div>

      {Object.keys(vehiclesByBrand).length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gray-500">
            Vehículos compatibles ({product.vehicles?.length ?? 0})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(vehiclesByBrand).map(([brand, vehicles]) => (
              <div key={brand} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-black text-[#0a2b3d]">{brand}</h3>
                <ul className="mt-2 space-y-1">
                  {vehicles.map((v, i) => (
                    <li key={`${v.model}-${i}`} className="text-xs text-gray-600">
                      {v.master_model || v.model} {v.version}{" "}
                      <span className="text-gray-400">
                        ({v.sold_from_year}–{v.sold_until_year})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function groupVehiclesByBrand(vehicles: SpecPartsVehicle[]): Record<string, SpecPartsVehicle[]> {
  const out: Record<string, SpecPartsVehicle[]> = {};
  for (const v of vehicles) {
    const brand = v.brand || "Otros";
    if (!out[brand]) out[brand] = [];
    out[brand].push(v);
  }
  return out;
}
