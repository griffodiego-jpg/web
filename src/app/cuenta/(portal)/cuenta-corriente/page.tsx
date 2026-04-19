import {
  computeSaldo,
  formatARS,
  formatDate,
  mockAccountStatus,
} from "@/data/mock-b2b";

export const metadata = { title: "Cuenta corriente" };

const COMP_LABEL: Record<string, string> = {
  FC: "Factura",
  ND: "Nota de débito",
  NC: "Nota de crédito",
  RE: "Recibo",
};

export default function CuentaCorrientePage() {
  const saldo = computeSaldo(mockAccountStatus);
  const debe = mockAccountStatus.reduce((a, x) => a + x.debe, 0);
  const haber = mockAccountStatus.reduce((a, x) => a + x.haber, 0);

  // Saldo running para la tabla (más viejo → más nuevo).
  const sorted = [...mockAccountStatus].sort(
    (a, b) => new Date(a.emision).getTime() - new Date(b.emision).getTime(),
  );
  let running = 0;
  const withRunning = sorted.map((item) => {
    running += item.debe - item.haber;
    return { ...item, saldo: running };
  });
  // Mostramos más nuevo primero.
  withRunning.reverse();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#0a2b3d]">Cuenta corriente</h2>
        <p className="text-sm text-gray-600 mt-1">
          Movimientos de tu cuenta (más recientes arriba).
        </p>
      </div>

      {/* Resumen de saldos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Saldo actual
          </p>
          <p
            className={`text-3xl font-black mt-2 ${
              saldo > 0 ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            {formatARS(saldo)}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {saldo > 0 ? "Pendiente de pago" : "Al día"}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Total debe
          </p>
          <p className="text-2xl font-black mt-2 text-[#0a2b3d]">
            {formatARS(debe)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Total haber
          </p>
          <p className="text-2xl font-black mt-2 text-[#0a2b3d]">
            {formatARS(haber)}
          </p>
        </div>
      </div>

      {/* Movimientos */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200">
          <p className="text-sm font-semibold text-[#0a2b3d]">
            {withRunning.length} movimientos
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Comprobante</th>
                <th className="px-4 py-3 font-semibold">Vencimiento</th>
                <th className="px-4 py-3 font-semibold text-right">Debe</th>
                <th className="px-4 py-3 font-semibold text-right">Haber</th>
                <th className="px-4 py-3 font-semibold text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {withRunning.map((r, idx) => {
                const numero = `${r.compLetra}${r.puntoVenta}-${r.compNro}`;
                return (
                  <tr key={`${numero}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {formatDate(r.emision)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {COMP_LABEL[r.comp] ?? r.comp}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#0a2b3d]">
                      {numero}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {r.vencimiento ? formatDate(r.vencimiento) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-[#0a2b3d] whitespace-nowrap">
                      {r.debe > 0 ? formatARS(r.debe) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-700 whitespace-nowrap">
                      {r.haber > 0 ? formatARS(r.haber) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#0a2b3d] whitespace-nowrap">
                      {formatARS(r.saldo)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        🚧 Los saldos reales se van a traer de Bejerman vía{" "}
        <code className="px-1 py-0.5 bg-gray-100 rounded">
          GET /ERP/ClientAccountStatus/{"{client_code}"}
        </code>
        .
      </div>
    </div>
  );
}
