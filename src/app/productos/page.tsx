/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
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
    <section className="container mx-auto max-w-6xl px-5 pt-8 pb-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {productos.map((p) => {
          const slug = p.href.split("/").pop()!;
          const detalle = productosDetalle[slug];
          return (
            <Link
              key={p.href}
              href={p.href}
              className="group block bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Título arriba — visible antes de scrollear a la imagen */}
              <div className="px-3 pt-3 pb-1">
                <h2 className="font-bold text-sm text-[#0a2b3d] group-hover:text-primary transition leading-tight">
                  {p.label}
                </h2>
                {detalle?.codigo && (
                  <p className="mt-0.5 text-[10px] text-gray-400 leading-tight">
                    Cód. {detalle.codigo}
                  </p>
                )}
              </div>

              {/* Imagen — <img> nativo para evitar el bug del AssetImage
                  bare en contenedores chicos (skeleton que no transiciona). */}
              <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center p-2 overflow-hidden">
                {detalle?.image ? (
                  <img
                    src={detalle.image}
                    alt={p.label}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-gray-300"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                )}
              </div>

              {/* CTA abajo */}
              <div className="px-3 pb-3 pt-1 border-t border-gray-100">
                <span className="inline-flex items-center gap-1 text-xs text-primary font-semibold group-hover:gap-2 transition-all">
                  Ver detalle
                  <svg
                    width="14"
                    height="14"
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
