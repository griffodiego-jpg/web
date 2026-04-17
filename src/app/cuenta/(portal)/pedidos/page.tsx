import Link from "next/link";
import { formatARS, formatDate, mockOrders } from "@/data/mock-b2b";

export const metadata = { title: "Mis pedidos" };

export default function PedidosPage() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#0a2b3d]">Mis pedidos</h2>
          <p className="text-sm text-gray-600 mt-1">
            Historial completo de pedidos enviados al ERP.
          </p>
        </div>
        <Link
          href="/catalogo"
          className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-lg transition"
        >
          + Armar pedido nuevo
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">ERP ID</th>
              <th className="px-4 py-3 font-semibold">Ref. web</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold text-right">Ítems</th>
              <th className="px-4 py-3 font-semibold text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockOrders.map((o) => (
              <tr key={o.platformOrderId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-700">
                  {o.erpOrderId}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {o.platformOrderId}
                </td>
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {formatDate(o.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={o.status} />
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {o.itemCount}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#0a2b3d] whitespace-nowrap">
                  {formatARS(o.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        🚧 Los pedidos reales se van a crear cuando esté activa la
        integración con Bejerman. Por ahora son datos de ejemplo.
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const palette: Record<string, string> = {
    Pendiente: "bg-gray-100 text-gray-700",
    "Pendiente de aprobación": "bg-amber-50 text-amber-800 border-amber-200",
    Aprobado: "bg-blue-50 text-blue-800 border-blue-200",
    "En preparación": "bg-blue-50 text-blue-800 border-blue-200",
    Despachado: "bg-indigo-50 text-indigo-800 border-indigo-200",
    Entregado: "bg-emerald-50 text-emerald-800 border-emerald-200",
    Cancelado: "bg-red-50 text-red-800 border-red-200",
    Confirmado: "bg-blue-50 text-blue-800 border-blue-200",
  };
  const cls = palette[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}
    >
      {status}
    </span>
  );
}
