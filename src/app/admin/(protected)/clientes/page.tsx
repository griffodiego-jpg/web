import Link from "next/link";

import { ImpersonateButton } from "@/components/admin/ImpersonateButton";
import { PriceListSelector } from "@/components/admin/PriceListSelector";
import { loadAllClients } from "@/lib/b2b/client-loader";
import { listAllPriceLists } from "@/lib/price-lists";
import type { BejermanClient } from "@/types/bejerman";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clientes B2B" };

export default async function ClientesPage() {
  const [{ clients, source, error }, priceLists] = await Promise.all([
    loadAllClients(),
    listAllPriceLists(),
  ]);
  const knownCodes = priceLists.map((l) => l.code);

  const assigned = clients.filter((c) => c.priceListCode).length;
  const total = clients.length;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-[#0a2b3d]">Clientes B2B</h1>
        <p className="text-sm text-gray-600 mt-1">
          Listado de clientes habilitados para el portal{" "}
          <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">/cuenta</code>
          . Asigná la lista de precios desde la columna &quot;Lista&quot;
          (auto-guarda). Las opciones del menú salen de las listas que ya
          subiste en{" "}
          <Link
            href="/admin/listas-precios"
            className="text-primary font-semibold hover:underline"
          >
            Listas de precios
          </Link>
          .
        </p>
      </header>

      {source === "mock" ? <MockBanner error={error} /> : null}

      {total > 0 && (
        <div className="mb-4 text-xs text-gray-600">
          <span className="font-semibold text-[#0a2b3d]">{assigned}</span> de{" "}
          <span className="font-semibold text-[#0a2b3d]">{total}</span> clientes
          tienen lista asignada.
        </div>
      )}

      {clients.length === 0 ? (
        <EmptyBox />
      ) : (
        <ClientsTable clients={clients} knownCodes={knownCodes} />
      )}
    </div>
  );
}

function ClientsTable({
  clients,
  knownCodes,
}: {
  clients: BejermanClient[];
  knownCodes: string[];
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {clients.length} cliente{clients.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Código</th>
              <th className="px-5 py-3 font-semibold">Razón social</th>
              <th className="px-5 py-3 font-semibold">CUIT</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Lista</th>
              <th className="px-5 py-3 font-semibold">Dep.</th>
              <th className="px-5 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map((c) => (
              <tr key={c.client_id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-mono text-xs text-gray-700">
                  {c.client_id}
                </td>
                <td className="px-5 py-3 font-medium text-[#0a2b3d]">
                  <Link
                    href={`/admin/clientes/${encodeURIComponent(c.client_id)}`}
                    className="hover:underline"
                  >
                    {c.name || <span className="text-gray-400">—</span>}
                  </Link>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-gray-700">
                  {c.cuit || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-5 py-3 text-gray-700">
                  {c.email || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-5 py-3">
                  <PriceListSelector
                    clientCode={c.client_id}
                    initialPriceListCode={c.priceListCode}
                    knownCodes={knownCodes}
                  />
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {c.warehouses?.length > 0 ? (
                    <span title={c.warehouses.map((w) => w.description).join(", ")}>
                      {c.warehouses.length}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/clientes/${encodeURIComponent(c.client_id)}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Ver detalle
                    </Link>
                    <ImpersonateButton code={c.client_id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyBox() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
      <p className="text-gray-700">Sin clientes para mostrar.</p>
    </div>
  );
}

function MockBanner({ error }: { error?: string }) {
  return (
    <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-bold">Mostrando clientes de ejemplo</p>
      <p className="mt-1">
        La API del ERP aún no devuelve clientes reales — falta conectar{" "}
        <code className="bg-amber-100 px-1 rounded">BEJERMAN_EMAIL</code> y{" "}
        <code className="bg-amber-100 px-1 rounded">BEJERMAN_PASSWORD</code> en
        Vercel, o el endpoint no tiene datos todavía. Cuando eso se active, esta
        lista pasa a venir en vivo.
      </p>
      {error ? (
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer hover:underline">
            Detalle técnico del error
          </summary>
          <pre className="mt-1 bg-amber-100 p-2 rounded whitespace-pre-wrap">
            {error}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
