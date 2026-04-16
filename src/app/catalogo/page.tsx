import type { Metadata } from "next";

import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { listCatalog } from "@/lib/api/specparts";
import type { CatalogProduct } from "@/types/specparts";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Buscador de productos Griffo: fuelles, topes de amortiguador y repuestos. Buscá por patente, vehículo, código, palabra o medidas.",
  alternates: { canonical: "/catalogo" },
  openGraph: {
    title: "Catálogo — Griffo",
    description: "Buscá productos Griffo por patente, vehículo, código, palabra o medidas.",
    url: "/catalogo",
  },
};

export default async function CatalogoPage() {
  let products: CatalogProduct[] = [];
  let loadError: string | null = null;
  try {
    products = await listCatalog();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Error al cargar el catálogo";
  }

  return (
    <section className="container mx-auto max-w-6xl px-5 pt-8 pb-16">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Catálogo</p>
        <h1 className="mt-1 text-3xl font-black text-[#0a2b3d]">Encontrá tu producto Griffo</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Más de 370 productos de suspensión, dirección y transmisión.
          Buscá por patente, vehículo, código, palabra clave o medidas.
        </p>
      </header>

      {loadError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          <p className="font-bold">No pudimos cargar el catálogo en este momento.</p>
          <p className="mt-1 text-xs">
            Probá de nuevo en unos minutos. Si el problema persiste, contactanos en{" "}
            <a href="/contacto" className="underline">
              /contacto
            </a>
            .
          </p>
        </div>
      ) : (
        <CatalogSearch products={products} />
      )}
    </section>
  );
}
