import { formatARS, formatDate, mockAccountStatus } from "@/data/mock-b2b";

export const metadata = { title: "Facturas" };

export default function FacturasPage() {
  const facturas = mockAccountStatus.filter((x) => x.comp === "FC");

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-black text-[#0a2b3d]">Facturas</h2>
        <p className="text-sm text-gray-600 mt-1">
          Descargá el PDF de cada factura emitida a tu nombre.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Comprobante</th>
              <th className="px-4 py-3 font-semibold">Emisión</th>
              <th className="px-4 py-3 font-semibold">Vencimiento</th>
              <th className="px-4 py-3 font-semibold text-right">Importe</th>
              <th className="px-4 py-3 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {facturas.map((f) => {
              const numero = `${f.comp} ${f.compLetra}${f.puntoVenta}-${f.compNro}`;
              return (
                <tr key={numero} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-[#0a2b3d]">
                    {numero}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {formatDate(f.emision)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {formatDate(f.vencimiento)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#0a2b3d] whitespace-nowrap">
                    {formatARS(f.debe)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary disabled:opacity-60 disabled:cursor-not-allowed transition"
                      title="Disponible cuando la integración con el ERP esté activa"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      PDF
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        🚧 Cuando la integración esté activa, cada botón PDF descarga el
        comprobante desde Bejerman vía{" "}
        <code className="px-1 py-0.5 bg-gray-100 rounded">
          GET /ERP/GetComprobante
        </code>
        .
      </div>
    </div>
  );
}
