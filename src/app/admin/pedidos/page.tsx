import Link from "next/link";
import { listPedidosAll, listPedidosByStatus } from "@/lib/pedidos";
import type { PedidoStatus } from "@/types/pedido";
import { PedidoStatusPill } from "@/components/cuenta/PedidoStatusPill";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pedidos B2B" };

const STATUS_TABS: Array<{ key: PedidoStatus | "todos"; label: string }> = [
  { key: "todos", label: "Todos" },
  { key: "procesando", label: "Procesando" },
  { key: "en_preparacion", label: "En preparación" },
  { key: "entregado", label: "Entregados" },
  { key: "cancelado", label: "Cancelados" },
];

function formatARS(value: number): string {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const activeStatus = STATUS_TABS.find((t) => t.key === estado)?.key ?? "todos";

  const pedidos =
    activeStatus === "todos"
      ? await listPedidosAll(500)
      : await listPedidosByStatus(activeStatus, 500);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-[#0a2b3d]">Pedidos B2B</h1>
        <p className="text-sm text-gray-600 mt-1">
          Pedidos que los clientes armaron desde el portal. Acá los cargás
          en Bejerman, ponés el nº de nota y actualizás el estado.
        </p>
      </header>

      {/* Tabs de filtro por estado */}
      <nav className="flex gap-1 mb-5 overflow-x-auto border-b border-gray-200">
        {STATUS_TABS.map((tab) => {
          const active = activeStatus === tab.key;
          const href = tab.key === "todos" ? "/admin/pedidos" : `/admin/pedidos?estado=${tab.key}`;
          return (
            <Link
              key={tab.key}
              href={href}
              className={`px-4 py-2 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
                active
                  ? "border-primary text-[#0a2b3d] font-black"
                  : "border-transparent text-gray-600 hover:text-[#0a2b3d]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {pedidos.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-[#0a2b3d] font-bold">
            {activeStatus === "todos"
              ? "Todavía no hay pedidos cargados."
              : `No hay pedidos en estado "${STATUS_TABS.find((t) => t.key === activeStatus)?.label}".`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {pedidos.length} pedido{pedidos.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID web</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Nº nota</th>
                  <th className="px-4 py-3 font-semibold text-right">Ítems</th>
                  <th className="px-4 py-3 font-semibold text-right">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pedidos.map((p) => {
                  const totalItems = p.items.reduce((a, x) => a + x.quantity, 0);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">
                        {p.id}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#0a2b3d]">{p.clientName}</p>
                        <p className="text-xs text-gray-500 font-mono">
                          {p.clientId}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {formatDateTime(p.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <PedidoStatusPill status={p.status} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {p.erpOrderNumber ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {totalItems}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#0a2b3d] whitespace-nowrap">
                        {formatARS(p.total)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/pedidos/${p.id}`}
                          className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
                        >
                          Abrir →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
