import Link from "next/link";
import { notFound } from "next/navigation";
import { getPedido } from "@/lib/pedidos";
import { mockCurrentClient, formatARS, formatDate } from "@/data/mock-b2b";
import { PedidoStatusPill } from "@/components/cuenta/PedidoStatusPill";
import { CancelarPedidoButton } from "@/components/cuenta/CancelarPedidoButton";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  return { title: `Pedido ${id}` };
}

export default async function PedidoDetallePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const { id } = await params;
  const pedido = await getPedido(id);
  if (!pedido) notFound();

  /* Guardia mock: el pedido tiene que ser del cliente logueado. Cuando
     Firebase esté vivo, comparar contra el token en vez del mock. */
  if (pedido.clientId !== mockCurrentClient.client_id) {
    notFound();
  }

  const { nuevo } = await searchParams;
  const esNuevo = nuevo === "1";
  const puedeCancelar = pedido.status === "procesando";
  const totalItems = pedido.items.reduce((a, x) => a + x.quantity, 0);

  return (
    <div className="max-w-4xl space-y-6">
      <nav className="text-xs text-gray-500">
        <Link href="/cuenta/pedidos" className="hover:text-primary">
          Mis pedidos
        </Link>
        <span className="mx-2">/</span>
        <span className="font-mono">{pedido.id}</span>
      </nav>

      {esNuevo && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
          <p className="font-bold text-emerald-900">
            ✓ Recibimos tu pedido
          </p>
          <p className="text-sm text-emerald-800 mt-1">
            Te mandamos un email de confirmación. Te vamos avisando por mail
            cuando pase a preparación y cuando se despache.
          </p>
        </div>
      )}

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Pedido
          </p>
          <h2 className="font-mono text-2xl font-black text-[#0a2b3d]">
            {pedido.id}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Creado el {formatDate(pedido.createdAt)}
            {pedido.warehouseDescription && (
              <>
                {" · "}Sucursal:{" "}
                <strong className="text-[#0a2b3d]">
                  {pedido.warehouseDescription}
                </strong>
              </>
            )}
          </p>
        </div>
        <PedidoStatusPill status={pedido.status} />
      </header>

      {/* Info extra según estado */}
      {pedido.status === "en_preparacion" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoBox label="Número de pedido">
            <span className="font-mono">{pedido.erpOrderNumber ?? "—"}</span>
          </InfoBox>
          <InfoBox label="Fecha de despacho">
            {pedido.estimatedDispatchDate
              ? formatDate(pedido.estimatedDispatchDate)
              : "A confirmar"}
          </InfoBox>
        </div>
      )}

      {pedido.status === "entregado" && pedido.invoice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
          <p className="text-xs uppercase tracking-wider font-bold text-emerald-900 mb-1">
            Factura emitida
          </p>
          <p className="font-mono font-black text-emerald-900">
            {pedido.invoice.label}
          </p>
          <p className="text-xs text-emerald-800 mt-1">
            Descargá el PDF desde tu sección de{" "}
            <Link href="/cuenta/facturas" className="underline">
              Facturas
            </Link>
            .
          </p>
        </div>
      )}

      {pedido.status === "cancelado" && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4">
          <p className="text-xs uppercase tracking-wider font-bold text-red-900 mb-1">
            Pedido cancelado
          </p>
          {pedido.cancelledAt && (
            <p className="text-sm text-red-800">
              El {formatDate(pedido.cancelledAt)}
              {pedido.cancelReason ? ` — ${pedido.cancelReason}` : ""}.
            </p>
          )}
        </div>
      )}

      {/* Ítems */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <p className="font-bold text-[#0a2b3d]">
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
              <th className="px-4 py-3 font-semibold text-right">Cantidad</th>
              <th className="px-4 py-3 font-semibold text-right">Unitario</th>
              <th className="px-4 py-3 font-semibold text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pedido.items.map((it) => (
              <tr key={it.productCode} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-primary font-bold">
                  <Link
                    href={`/catalogo/${it.slug}`}
                    className="hover:underline"
                  >
                    {it.productCode}
                  </Link>
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
              <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-700">
                Total estimado (+ IVA)
              </td>
              <td className="px-4 py-3 text-right font-black text-lg text-[#0a2b3d] whitespace-nowrap">
                {formatARS(pedido.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      {/* Acciones */}
      {puedeCancelar && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-gray-500">
            Podés cancelar el pedido mientras esté en estado{" "}
            <b>Procesando</b>. Una vez que pase a <b>En preparación</b>, ya
            no vas a poder cancelarlo desde acá.
          </p>
          <CancelarPedidoButton pedidoId={pedido.id} />
        </div>
      )}

      <p className="text-xs text-gray-500 pt-2">
        El total definitivo lo confirma Griffo al facturar. Los precios
        acá son los de tu lista al momento de confirmar.
      </p>
    </div>
  );
}

function InfoBox({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
        {label}
      </p>
      <p className="text-[#0a2b3d] font-bold mt-1">{children}</p>
    </div>
  );
}
