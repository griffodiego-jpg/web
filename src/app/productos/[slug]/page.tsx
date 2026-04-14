import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero, ComingSoon } from "@/components/PageHero";
import { navigation } from "@/lib/site-config";

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
  return { title: producto?.label ?? "Producto" };
}

export default async function ProductoDetallePage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const producto = findProducto(slug);
  if (!producto) notFound();

  return (
    <>
      <PageHero
        title={producto.label}
        breadcrumb={[
          { label: "Productos destacados", href: "/productos" },
          { label: producto.label },
        ]}
      />
      <ComingSoon title={`Detalle de ${producto.label}`} />
    </>
  );
}
