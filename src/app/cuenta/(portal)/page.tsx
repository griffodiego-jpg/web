import Link from "next/link";
import {
  computeSaldo,
  formatARS,
  formatDate,
  mockAccountStatus,
  mockOrders,
} from "@/data/mock-b2b";

export const metadata = { title: "Resumen" };

export default function ResumenPage() {
  const saldo = computeSaldo(mockAccountStatus);
  const facturas = mockAccountStatus.filter((x) => x.comp === "FC");
  const ultimoPedido = mockOrders[0];

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Saldo en cuenta corriente"
          value={formatARS(saldo)}
          tone={saldo > 0 ? "warning" : "neutral"}
          hint={saldo > 0 ? "Pendiente de pago" : "Al día"}
          href="/cuenta/cuenta-corriente"
        />
        <StatCard
          label="Facturas emitidas (últimos 12 meses)"
          value={facturas.length.toString()}
          tone="neutral"
          hint={`Última: ${formatDate(facturas[0]?.emision ?? "")}`}
          href="/cuenta/facturas"
        />
        <StatCard
          label="Pedidos activos"
          value={mockOrders
            .filter((o) => !["Entregado", "Cancelado"].includes(o.status))
            .length.toString()}
          tone="neutral"
          hint={ultimoPedido ? `Último: ${ultimoPedido.status}` : "—"}
          href="/cuenta/pedidos"
        />
      </div>

      {/* Quick actions */}
      <section>
        <h3 className="text-lg font-black text-[#0a2b3d] mb-3">
          Accesos rápidos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionCard
            title="Armar un pedido"
            description="Por código, pegar lista o subir Excel."
            href="/cuenta/armar-pedido"
            accent
          />
          <ActionCard
            title="Buscar en catálogo"
            description="Buscá por código, vehículo, patente o medidas."
            href="/catalogo"
          />
          <ActionCard
            title="Bajar lista de precios"
            description="Tu lista particular en PDF o Excel."
            href="/cuenta/listas"
          />
          <ActionCard
            title="Última factura"
            description="Descargá el PDF del último comprobante."
            href="/cuenta/facturas"
          />
        </div>
      </section>

      {/* Últimos pedidos */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-black text-[#0a2b3d]">
            Últimos pedidos
          </h3>
          <Link
            href="/cuenta/pedidos"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Pedido</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockOrders.slice(0, 3).map((o) => (
                <tr key={o.platformOrderId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">
                    {o.erpOrderId}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#0a2b3d]">
                    {formatARS(o.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
  href,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "neutral" | "warning" | "success";
  href: string;
}) {
  const toneClass =
    tone === "warning"
      ? "text-amber-700"
      : tone === "success"
        ? "text-emerald-700"
        : "text-[#0a2b3d]";
  return (
    <Link
      href={href}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition"
    >
      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
        {label}
      </p>
      <p className={`text-2xl font-black mt-2 ${toneClass}`}>{value}</p>
      <p className="text-xs text-gray-600 mt-1">{hint}</p>
    </Link>
  );
}

function ActionCard({
  title,
  description,
  href,
  accent,
  disabled,
  disabledHint,
}: {
  title: string;
  description: string;
  href: string;
  accent?: boolean;
  disabled?: boolean;
  disabledHint?: string;
}) {
  const className = `block rounded-xl p-5 transition border ${
    disabled
      ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
      : accent
        ? "bg-primary text-white border-primary hover:bg-primary-dark"
        : "bg-white border-gray-200 hover:border-primary/40 hover:shadow-sm"
  }`;

  const content = (
    <>
      <p
        className={`font-bold ${
          disabled ? "text-gray-700" : accent ? "text-white" : "text-[#0a2b3d]"
        }`}
      >
        {title}
      </p>
      <p
        className={`text-sm mt-1 ${
          disabled
            ? "text-gray-500"
            : accent
              ? "text-white/80"
              : "text-gray-600"
        }`}
      >
        {disabled ? disabledHint : description}
      </p>
    </>
  );

  if (disabled) return <div className={className}>{content}</div>;
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
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
