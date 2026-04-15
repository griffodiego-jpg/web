import type { Metadata } from "next";
import Link from "next/link";
import { navigation } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Productos destacados",
  description:
    "Conocé los productos destacados de Griffo: fuelles, kits y herramientas para la industria automotriz.",
};

export default function ProductosPage() {
  const productos =
    navigation.find((i) => i.label === "Productos destacados")?.children ?? [];

  return (
    <section className="container mx-auto max-w-6xl px-5 pt-10 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group block bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition"
          >
            <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
              Imagen próximamente
            </div>
            <div className="p-5">
              <h2 className="font-bold text-lg group-hover:text-primary transition">
                {p.label}
              </h2>
              <span className="mt-2 inline-block text-sm text-primary font-semibold">
                Ver detalle →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
