import { getClients } from "@/lib/api/bejerman";
import type { BejermanClient } from "@/types/bejerman";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clientes B2B" };

async function loadClients(): Promise<
  | { ok: true; clients: BejermanClient[] }
  | { ok: false; error: string }
> {
  try {
    const clients = await getClients();
    return { ok: true, clients };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { ok: false, error };
  }
}

export default async function ClientesPage() {
  const result = await loadClients();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-[#0a2b3d]">Clientes B2B</h1>
        <p className="text-sm text-gray-600 mt-1">
          Listado en vivo desde el ERP Griffo ({" "}
          <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">
            GET /ERP/Clients
          </code>
          ). Se actualiza en cada carga.
        </p>
      </header>

      {!result.ok ? (
        <ErrorBox message={result.error} />
      ) : result.clients.length === 0 ? (
        <EmptyBox />
      ) : (
        <ClientsTable clients={result.clients} />
      )}
    </div>
  );
}

function ClientsTable({ clients }: { clients: BejermanClient[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {clients.length} cliente{clients.length === 1 ? "" : "s"} encontrados
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Código</th>
              <th className="px-5 py-3 font-semibold">Razón social</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Depósitos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map((c) => (
              <tr key={c.client_id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-mono text-xs text-gray-700">
                  {c.client_id}
                </td>
                <td className="px-5 py-3 font-medium text-[#0a2b3d]">
                  {c.name || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-5 py-3 text-gray-700">
                  {c.email || <span className="text-gray-400">—</span>}
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
      <p className="text-gray-700">
        La API respondió OK pero devolvió 0 clientes.
      </p>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  const missingCreds = message.includes("BEJERMAN_EMAIL");
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <h2 className="font-bold text-amber-900 mb-2">
        No se pudo conectar con el ERP
      </h2>
      <pre className="text-xs text-amber-800 bg-amber-100 p-3 rounded overflow-x-auto whitespace-pre-wrap">
        {message}
      </pre>
      {missingCreds && (
        <div className="mt-4 text-sm text-amber-900 space-y-2">
          <p className="font-semibold">Faltan credenciales en Vercel.</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Vercel → Settings → Environment Variables (los 3 scopes:
              Production, Preview, Development).
            </li>
            <li>
              Agregar <code className="bg-amber-100 px-1">BEJERMAN_EMAIL</code>{" "}
              y <code className="bg-amber-100 px-1">BEJERMAN_PASSWORD</code>.
            </li>
            <li>Redeploy (o esperar al próximo push).</li>
          </ol>
        </div>
      )}
    </div>
  );
}
