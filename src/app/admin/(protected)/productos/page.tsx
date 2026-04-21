import { productosDetalle } from "@/data/productos";
import { navigation } from "@/lib/site-config";

export default function AdminProductosPage() {
  const navProductos =
    navigation.find((i) => i.label === "Productos destacados")?.children ?? [];

  return (
    <div>
      <h1 className="text-2xl font-black text-[#0a2b3d] mb-2">
        Productos destacados
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Editá los links de compra de cada producto.
      </p>

      <div className="space-y-4">
        {navProductos.map((p) => {
          const slug = p.href.split("/").pop()!;
          const detalle = productosDetalle[slug];
          return (
            <div
              key={slug}
              className="bg-white rounded-lg shadow p-5 flex flex-col lg:flex-row lg:items-center gap-4"
            >
              <div className="flex-1">
                <h2 className="font-bold text-[#0a2b3d]">{p.label}</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  slug: <code className="bg-gray-100 px-1 rounded">{slug}</code>
                </p>
                {detalle?.codigo && (
                  <p className="text-xs text-gray-500">
                    Código: {detalle.codigo}
                  </p>
                )}
              </div>

              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Link de compra (Mercado Libre)
                </label>
                <input
                  type="url"
                  defaultValue={detalle?.cta?.url ?? ""}
                  placeholder="https://listado.mercadolibre.com.ar/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition shrink-0 cursor-pointer">
                Guardar
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Para guardar cambios en vivo, conectar Vercel KV (ver TASKS.md).
        Por ahora muestra los datos del código fuente.
      </p>
    </div>
  );
}
