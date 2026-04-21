import { distribuidores, listarProvincias } from "@/data/distribuidores";

export default function AdminDistribuidoresPage() {
  const provincias = listarProvincias();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#0a2b3d]">
            Distribuidores
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {distribuidores.length} distribuidores · {provincias.length}{" "}
            provincias de filtro
          </p>
        </div>
        <button
          type="button"
          className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition cursor-pointer"
        >
          + Agregar distribuidor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-gray-700">
                  Nombre
                </th>
                <th className="text-left px-4 py-3 font-bold text-gray-700">
                  Teléfono
                </th>
                <th className="text-left px-4 py-3 font-bold text-gray-700">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-bold text-gray-700">
                  Provincia
                </th>
                <th className="text-left px-4 py-3 font-bold text-gray-700">
                  Filtros
                </th>
                <th className="text-right px-4 py-3 font-bold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {distribuidores.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-semibold text-[#0a2b3d]">
                    {d.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.telefono}</td>
                  <td className="px-4 py-3 text-gray-600">{d.email}</td>
                  <td className="px-4 py-3 text-gray-600">{d.provincia}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">
                      {d.provinciasFiltro.length} provincias
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-primary hover:underline text-xs font-semibold mr-3 cursor-pointer">
                      Editar
                    </button>
                    <button className="text-red-500 hover:underline text-xs font-semibold cursor-pointer">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Los datos se cargan del archivo TypeScript. Para edición en vivo,
        conectar Vercel KV (ver instrucciones en TASKS.md).
      </p>
    </div>
  );
}
