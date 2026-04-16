import Link from "next/link";
import { distribuidores } from "@/data/distribuidores";
import { productosDetalle } from "@/data/productos";

export default function AdminDashboard() {
  const totalDist = distribuidores.length;
  const totalProd = Object.keys(productosDetalle).length;

  return (
    <div>
      <h1 className="text-3xl font-black text-[#0a2b3d]">Dashboard</h1>
      <p className="mt-2 text-gray-500">
        Panel de administración de Griffo
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Distribuidores"
          value={totalDist}
          href="/admin/distribuidores"
          color="bg-primary"
        />
        <StatCard
          label="Productos con detalle"
          value={totalProd}
          href="/admin/productos"
          color="bg-primary-dark"
        />
        <StatCard
          label="Banners"
          value="—"
          href="/admin/banners"
          color="bg-accent"
        />
      </div>

      <div className="mt-12 bg-white rounded-lg shadow p-6">
        <h2 className="font-bold text-lg text-[#0a2b3d] mb-4">
          Acciones rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/distribuidores"
            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition"
          >
            + Agregar distribuidor
          </Link>
          <Link
            href="/admin/productos"
            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition"
          >
            Editar links de compra
          </Link>
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-300 transition"
          >
            Ver sitio público ↗
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  color,
}: {
  label: string;
  value: number | string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition p-6 group"
    >
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-2 text-4xl font-black text-[#0a2b3d]">{value}</p>
      <div
        className={`mt-4 h-1 w-12 ${color} rounded-full group-hover:w-20 transition-all`}
      />
    </Link>
  );
}
