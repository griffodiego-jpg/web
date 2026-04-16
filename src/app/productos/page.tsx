import type { Metadata } from "next";
import Link from "next/link";
import { AssetImage } from "@/components/AssetImage";
import { navigation } from "@/lib/site-config";
import { productosDetalle } from "@/data/productos";

export const metadata: Metadata = {
  title: "Productos destacados",
  description:
    "Conocé los productos destacados de Griffo: fuelles, kits, herramientas y accesorios para la industria automotriz.",
  alternates: { canonical: "/productos" },
};

export default function ProductosPage() {
  const productos =
    navigation.find((i) => i.label === "Productos destacados")?.children ?? [];

  return (
    <section className="container mx-auto max-w-6xl px-5 pt-10 pb-16">
      <p className="text-gray-600 text-lg max-w-2xl mb-10">
        Nuestra línea de productos para mecánicos, distribuidores y talleres.
        Hacé click en cualquier producto para ver el detalle completo.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((p) => {
          const slug = p.href.split("/").pop()!;
          const detalle = productosDetalle[slug];
          return (
            <Link
              key={p.href}
              href={p.href}
              className="group block bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Imagen del producto */}
              <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center p-6 overflow-hidden">
                {detalle?.image ? (
                  <AssetImage
                    src={detalle.image}
                    alt={p.label}
                    bare
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-gray-300 text-sm text-center">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="mx-auto mb-2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                    Imagen próximamente
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5 border-t border-gray-100">
                <h2 className="font-bold text-lg text-[#0a2b3d] group-hover:text-primary transition">
                  {p.label}
                </h2>
                {detalle?.tagline && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {detalle.tagline}
                  </p>
                )}
                {detalle?.codigo && (
                  <p className="mt-2 text-xs text-gray-400">
                    Código: {detalle.codigo}
                  </p>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-semibold group-hover:gap-2 transition-all">
                  Ver detalle
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
