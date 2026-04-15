import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/PageHero";
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
      {/* Breadcrumb inline — sin ocupar mucho espacio */}
      <nav
        aria-label="Breadcrumb"
        className="container mx-auto max-w-6xl px-5 pt-6 text-xs uppercase tracking-wide text-gray-500 font-semibold"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-primary transition">
              Inicio
            </Link>
          </li>
          <li className="opacity-50">/</li>
          <li>
            <Link
              href="/productos"
              className="hover:text-primary transition"
            >
              Productos destacados
            </Link>
          </li>
          <li className="opacity-50">/</li>
          <li className="text-[#0a2b3d]">{producto.label}</li>
        </ol>
      </nav>
      <ComingSoon title={`Detalle de ${producto.label}`} />
    </>
  );
}
