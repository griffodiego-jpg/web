import Link from "next/link";
import { notFound } from "next/navigation";
import { getPedido } from "@/lib/pedidos";
import { PedidoStatusPill } from "@/components/cuenta/PedidoStatusPill";
import { AdminPedidoActions } from "@/components/admin/AdminPedidoActions";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  return { title: `Pedido ${id}` };
}

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function AdminPedidoDetallePage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const pedido = await getPedido(id);
  if (!pedido) notFound();

  const totalItems = pedido.items.reduce((a, x) => a + x.quantity, 0);

  return (
    <div className="max-w-5xl space-y-6">
      <nav className="text-xs text-gray-500">
        <Link href="/admin/pedidos" className="hover:text-primary">
          Pedidos B2B
        </Link>
        <span className="mx-2">/</span>
        <span className="font-mono">{pedido.id}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Pedido
          </p>
          <h1 className="font-mono text-2xl font-black text-[#0a2b3d]">
            {pedido.id}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Creado {formatDateTime(pedido.createdAt)} · Actualizado{" "}
            {formatDateTime(pedido.updatedAt)}
          </p>
        </div>
        <PedidoStatusPill status={pedido.status} />
      </header>

      {/* Datos del cliente */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-3">
          Cliente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Razón social</p>
            <p className="font-bold text-[#0a2b3d]">{pedido.clientName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Código ERP</p>
            <p className="font-mono font-bold text-[#0a2b3d]">
              {pedido.clientId}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <a
              href={`mailto:${pedido.clientEmail}`}
              className="font-semibold text-primary hover:underline break-all"
            >
              {pedido.clientEmail}
            </a>
          </div>
        </div>
      </section>

      {/* Info del ERP */}
      {(pedido.erpOrderNumber ||
        pedido.estimatedDispatchDate ||
        pedido.invoice) && (
        <section className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h2 className="text-xs uppercase tracking-wider font-bold text-blue-900 mb-3">
            Datos del ERP
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pedido.erpOrderNumber && (
              <div>
                <p className="text-xs text-blue-800 mb-1">Nº nota de pedido</p>
                <p className="font-mono font-bold text-blue-900">
                  {pedido.erpOrderNumber}
                </p>
              </div>
            )}
            {pedido.estimatedDispatchDate && (
              <div>
                <p className="text-xs text-blue-800 mb-1">
                  Fecha estimada de despacho
                </p>
                <p className="font-bold text-blue-900">
                  {formatDate(pedido.estimatedDispatchDate)}
                </p>
              </div>
            )}
            {pedido.invoice && (
              <div>
                <p className="text-xs text-blue-800 mb-1">Factura</p>
                <p className="font-mono font-bold text-blue-900">
                  {pedido.invoice.label}
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Emitida {formatDate(pedido.invoice.emissionDate)}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {pedido.status === "cancelado" && (
        <section className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h2 className="text-xs uppercase tracking-wider font-bold text-red-900 mb-1">
            Pedido cancelado
          </h2>
          {pedido.cancelledAt && (
            <p className="text-sm text-red-800">
              El {formatDateTime(pedido.cancelledAt)}
              {pedido.cancelReason ? ` — ${pedido.cancelReason}` : ""}.
            </p>
          )}
        </section>
      )}

      {/* Ítems */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wider font-bold text-gray-500">
            Productos
          </h2>
          <p className="text-sm text-gray-600">
            {pedido.items.length}{" "}
            {pedido.items.length === 1 ? "producto" : "productos"} ·{" "}
            {totalItems} {totalItems === 1 ? "unidad" : "unidades"}
          </p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Código</th>
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 font-semibold text-right">Cant.</th>
              <th className="px-4 py-3 font-semibold text-right">Unitario</th>
              <th className="px-4 py-3 font-semibold text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pedido.items.map((it) => (
              <tr key={it.productCode}>
                <td className="px-4 py-3 font-mono text-xs text-primary font-bold">
                  {it.productCode}
                </td>
                <td className="px-4 py-3 text-[#0a2b3d]">{it.name}</td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {it.quantity}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">
                  {formatARS(it.unitPrice)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#0a2b3d] whitespace-nowrap">
                  {formatARS(it.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right font-semibold">
                Total (+ IVA)
              </td>
              <td className="px-4 py-3 text-right font-black text-lg text-[#0a2b3d] whitespace-nowrap">
                {formatARS(pedido.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      {/* Acciones admin */}
      <AdminPedidoActions pedido={pedido} />
    </div>
  );
}
