import { listAllPriceLists } from "@/lib/price-lists";
import { loadAllClients } from "@/lib/b2b/client-loader";
import { PriceListsAdmin } from "@/components/admin/PriceListsAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Listas de precios" };

export default async function ListasPreciosPage() {
  const [lists, { clients }] = await Promise.all([
    listAllPriceLists(),
    loadAllClients(),
  ]);

  // Cuántos clientes usan cada code.
  const clientsByCode = new Map<string, number>();
  for (const c of clients) {
    const code = (c.priceListCode ?? "").trim().toUpperCase();
    if (!code) continue;
    clientsByCode.set(code, (clientsByCode.get(code) ?? 0) + 1);
  }

  // Códigos únicos que aparecen en clientes (para sugerir al subir).
  const clientCodes = [...new Set(
    clients
      .map((c) => (c.priceListCode ?? "").trim().toUpperCase())
      .filter(Boolean),
  )].sort();

  // Códigos asignados a clientes pero sin archivo subido — alerta
  // amarilla arriba de la tabla.
  const codesConArchivo = new Set(lists.map((l) => l.code));
  const codesFaltantes = clientCodes.filter((c) => !codesConArchivo.has(c));

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-[#0a2b3d]">
          Listas de precios
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Subí el Excel de cada lista por código (ej.{" "}
          <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">
            LISTA3
          </code>
          ). Cada cliente ve la lista que matchea su{" "}
          <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">
            priceListCode
          </code>{" "}
          en Bejerman. Subir un archivo nuevo con el mismo código reemplaza
          la versión anterior y (opcional) notifica a los clientes por mail.
        </p>
      </header>

      {codesFaltantes.length > 0 && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">
            Falta subir {codesFaltantes.length} lista
            {codesFaltantes.length === 1 ? "" : "s"}
          </p>
          <p className="mt-1">
            Hay clientes con estos códigos asignados pero sin archivo
            cargado. Mientras tanto entran a su portal y no ven nada.
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {codesFaltantes.map((c) => (
              <li
                key={c}
                className="font-mono text-xs bg-amber-100 px-2 py-0.5 rounded font-bold"
              >
                {c}
                <span className="ml-1 font-normal text-amber-800">
                  ({clientsByCode.get(c) ?? 0} cliente
                  {(clientsByCode.get(c) ?? 0) === 1 ? "" : "s"})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <PriceListsAdmin
        lists={lists}
        clientsByCode={Object.fromEntries(clientsByCode)}
        knownClientCodes={clientCodes}
      />
    </div>
  );
}
