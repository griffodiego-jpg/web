import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ProductGallery } from "@/components/catalog/ProductGallery";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/StructuredData";
import { getFeaturedSlug } from "@/data/featured-products";
import { getProductBySlug, listCatalog } from "@/lib/api/specparts";
import {
  getAttrValues,
  getMercadoLibreUrl,
  getProductLocations,
} from "@/lib/catalog/utils";
import { SITE_URL } from "@/lib/site-url";
import type { SpecPartsAttribute, SpecPartsVehicle } from "@/types/specparts";

export const revalidate = 1800;
export const dynamicParams = true;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  try {
    const products = await listCatalog();
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

  const featuredSlug = getFeaturedSlug(product.code);
  if (featuredSlug) {
    redirect(`/productos/${featuredSlug}`);
  }

  const primaryImage = product.pictures?.[0]?.image_url ?? "";
  const meliUrl = getMercadoLibreUrl(product);
  const productUrl = `${SITE_URL}/catalogo/${slug}`;

  const vehiclesByBrand = groupVehiclesByBrand(product.vehicles ?? []);
  const attributes = product.attributes ?? [];

  // Aplicación: atributos que dicen cómo se monta (Posición / Ubicación / Lado).
  // Consolidamos valores repetidos (ej. dos attrs 'Lado' con distintos valores).
  const ubicaciones = getProductLocations(product);
  const lados = getAttrValues(product, "lado").filter(
    (v) => !ubicaciones.includes(v),
  );

  // Medidas: el resto de los atributos (diámetros, largos, pliegues, tipo, etc.).
  // Excluimos los que ya mostramos como Aplicación y los de 'Componentes'.
  const isAplicacion = (name: string) => {
    const n = name.toLowerCase();
    return /ubicaci|posici|eje|montaje|lado/.test(n);
  };
  const isComponente = (name: string) => name.toLowerCase().includes("component");

  const medidas = attributes.filter(
    (a) => !isAplicacion(a.name) && !isComponente(a.name),
  );
  const componenteAttr = attributes.find((a) => isComponente(a.name));

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

      {/* ==== Bloque principal (arriba del fold) ==== */}
      <div className="grid gap-6 md:grid-cols-[2fr_3fr] md:gap-8">
        {/* Columna izq: imagen (acotada en altura para no empujar el resto) */}
        <div className="md:max-h-[440px]">
          <ProductGallery
            pictures={product.pictures ?? []}
            alt={product.description || product.product}
          />
        </div>

        {/* Columna der: info ordenada por importancia */}
        <div className="flex flex-col gap-4">
          {/* 1. Código + producto + categoría */}
          <header>
            <span className="inline-block rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
              {product.category}
            </span>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-3xl font-black leading-none text-primary">
                {product.code}
              </h1>
              <p className="text-base font-bold uppercase tracking-wide text-[#0a2b3d]">
                {product.product}
              </p>
            </div>
            {product.description ? (
              <p className="mt-1 text-sm text-gray-600">{product.description}</p>
            ) : null}
          </header>

          {/* 3. Aplicación: pills compactos */}
          {ubicaciones.length > 0 || lados.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {ubicaciones.map((v) => (
                <Pill key={`u-${v}`} label="Ubicación" value={v} />
              ))}
              {lados.length > 0 ? (
                <Pill label="Lado" value={lados.join(" · ")} />
              ) : null}
            </div>
          ) : null}

          {/* 4. CTA MercadoLibre arriba del fold */}
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

          {/* 5. Medidas técnicas compactas */}
          {medidas.length > 0 ? (
            <section>
              <h2 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Medidas
              </h2>
              <dl className="divide-y divide-gray-100 rounded-lg border border-gray-100 bg-white">
                {medidas.map((a, i) => (
                  <MedidaRow key={`${a.name}-${i}`} attr={a} />
                ))}
              </dl>
            </section>
          ) : null}

          {/* 6. Componentes del kit (si aplica) */}
          {componenteAttr ? (
            <p className="text-xs text-gray-500">
              <span className="font-bold uppercase tracking-wide">{componenteAttr.name}: </span>
              <span className="font-semibold text-[#0a2b3d]">
                {componenteAttr.value} {componenteAttr.unit}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      {/* 7. Vehículos compatibles (abajo, scrolleable) */}
      {Object.keys(vehiclesByBrand).length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
            Vehículos compatibles ({product.vehicles?.length ?? 0})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(vehiclesByBrand).map(([brand, vehicles]) => (
              <div key={brand} className="rounded-lg border border-gray-100 bg-white p-3">
                <h3 className="text-xs font-black text-[#0a2b3d]">{brand}</h3>
                <ul className="mt-1.5 space-y-0.5">
                  {vehicles.map((v, i) => (
                    <li key={`${v.model}-${i}`} className="text-[11px] text-gray-600">
                      {v.master_model || v.model}
                      {v.version ? ` ${v.version}` : ""}{" "}
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

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/10 bg-primary/5 px-2.5 py-1 text-xs">
      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span className="font-bold text-[#0a2b3d]">{value}</span>
    </span>
  );
}

function MedidaRow({ attr }: { attr: SpecPartsAttribute }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-1.5 text-xs">
      <dt className="uppercase tracking-wide text-gray-500">{attr.name}</dt>
      <dd className="text-right font-bold text-[#0a2b3d]">
        {attr.value}
        {attr.unit ? ` ${attr.unit}` : ""}
      </dd>
    </div>
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
