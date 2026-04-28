import Link from "next/link";
import {
  formatARS,
  formatDate,
} from "@/data/mock-b2b";
import { getAccountStatusForClient } from "@/lib/b2b/account-status";
import { getCurrentClient } from "@/lib/b2b/current-client";
import {
  classifyComp,
  computeNormalizedSaldo,
  isLikelyPago,
  normalizeAmounts,
} from "@/lib/b2b/movement-classifier";
import { ComprobantePdfButton } from "@/components/cuenta/ComprobantePdfButton";
import type { BejermanAccountStatusItem } from "@/types/bejerman";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cuenta corriente" };

const COMP_LABEL: Record<string, string> = {
  FC: "Factura",
  ND: "Nota de débito",
  NC: "Nota de crédito",
  RE: "Recibo",
  RC: "Recibo",
  RB: "Recibo",
  REC: "Recibo",
  COB: "Cobranza",
  CBR: "Cobranza",
  PA: "Pago",
};

type Filtro = "todos" | "FC" | "NC" | "RE";

function matchesFilter(item: BejermanAccountStatusItem, filtro: Filtro): boolean {
  if (filtro === "todos") return true;
  const cat = classifyComp(item.comp);
  if (filtro === "FC") return cat === "factura" || cat === "nota_debito";
  if (filtro === "NC") return cat === "nota_credito";
  if (filtro === "RE") return isLikelyPago(item);
  return true;
}

/** Codes que sí tienen PDF descargable en GetComprobante. */
const PDF_AVAILABLE_COMPS = new Set(["FC", "NC", "ND", "RC"]);

export default async function CuentaCorrientePage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string; periodo?: string }>;
}) {
  const params = await searchParams;
  const filtroParam = params.filtro;
  const active: Filtro = (["todos", "FC", "NC", "RE"].includes(filtroParam ?? "")
    ? filtroParam
    : "todos") as Filtro;
  /** "12m" (últimos 12 meses, default) o "all" (histórico). */
  const periodo: "12m" | "all" = params.periodo === "all" ? "all" : "12m";

  const client = await getCurrentClient();
  const { items: accountItems, source, error } = await getAccountStatusForClient(
    client.client_id,
  );

  // Aplicamos normalización para tolerar pagos/NCs que el ERP manda
  // con monto en `debe` en vez de `haber` (u otras inversiones de
  // signo). Sin esto, los recibos suman deuda en lugar de restarla.
  const { saldo, debe, haber } = computeNormalizedSaldo(accountItems);

  // Saldo running sobre TODA la cuenta (no sobre el filtro).
  const sorted = [...accountItems].sort(
    (a, b) => new Date(a.emision).getTime() - new Date(b.emision).getTime(),
  );
  let running = 0;
  const withRunning = sorted.map((item) => {
    const n = normalizeAmounts(item);
    running += n.debe - n.haber;
    // Devolvemos también los valores normalizados para que la tabla
    // muestre los recibos en la columna correcta.
    return {
      ...item,
      debe: n.debe,
      haber: n.haber,
      saldo: running,
    };
  });
  // Filtro temporal: por default solo últimos 12 meses para evitar
  // renderizar cientos de filas de hace años. El saldo running se
  // computa sobre TODO igual — sólo recortamos la visualización.
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 12);
  const inPeriodo = (it: BejermanAccountStatusItem) =>
    periodo === "all" || new Date(it.emision) >= cutoff;

  const olderCount = accountItems.filter((x) => !inPeriodo(x)).length;

  const visible = withRunning
    .filter((x) => matchesFilter(x, active) && inPeriodo(x))
    .reverse();

  function countFor(filtro: Filtro): number {
    return accountItems
      .filter((x) => matchesFilter(x, filtro) && inPeriodo(x))
      .length;
  }

  function buildHref(nextFiltro: Filtro, nextPeriodo: "12m" | "all"): string {
    const sp = new URLSearchParams();
    if (nextFiltro !== "todos") sp.set("filtro", nextFiltro);
    if (nextPeriodo === "all") sp.set("periodo", "all");
    const qs = sp.toString();
    return qs ? `/cuenta/cuenta-corriente?${qs}` : "/cuenta/cuenta-corriente";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#0a2b3d]">Cuenta corriente</h2>
        <p className="text-sm text-gray-600 mt-1">
          Movimientos de tu cuenta. Bajás el PDF de cualquier factura o
          nota desde la misma fila.
        </p>
      </div>

      {source === "unavailable" ? (
        <UnavailableBox error={error} />
      ) : (
        <>
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

          {/* Alerta si no hay pagos registrados — probable gap del ERP */}
          {accountItems.length > 0 &&
            accountItems.filter(isLikelyPago).length === 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-bold">
                  No vemos pagos/recibos en tus movimientos
                </p>
                <p className="mt-1">
                  El ERP nos devolvió {accountItems.length} movimientos pero
                  ninguno es un pago. Es probable que el middleware no esté
                  incluyendo los recibos. Ya estamos trabajando con el técnico
                  del ERP para resolverlo — mientras tanto, si necesitás
                  confirmar un pago puntual escribinos a{" "}
                  <a
                    href="mailto:ventas@griffo.com.ar"
                    className="underline font-semibold"
                  >
                    ventas@griffo.com.ar
                  </a>
                  .
                </p>
              </div>
            )}

          {/* Filtro por tipo + toggle de periodo */}
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200">
            <nav className="flex gap-1 overflow-x-auto -mb-px">
              {(
                [
                  { key: "todos", label: "Todos los movimientos" },
                  { key: "FC", label: "Facturas" },
                  { key: "NC", label: "Notas de crédito" },
                  { key: "RE", label: "Pagos / Recibos" },
                ] as Array<{ key: Filtro; label: string }>
              ).map((f) => {
                const count = countFor(f.key);
                const isActive = active === f.key;
                const href = buildHref(f.key, periodo);
                return (
                  <Link
                    key={f.key}
                    href={href}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
                      isActive
                        ? "border-primary text-[#0a2b3d] font-black"
                      : "border-transparent text-gray-600 hover:text-[#0a2b3d]"
                  }`}
                >
                    {f.label}{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      ({count})
                    </span>
                  </Link>
                );
              })}
            </nav>
            {olderCount > 0 && (
              <Link
                href={buildHref(active, periodo === "12m" ? "all" : "12m")}
                className="px-3 py-1.5 mb-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white border border-primary rounded-md transition whitespace-nowrap"
              >
                {periodo === "12m"
                  ? `Ver historial completo (+${olderCount} más)`
                  : "Ver sólo últimos 12 meses"}
              </Link>
            )}
          </div>

          {/* Movimientos */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {visible.length === 0 ? (
              <div className="p-8 text-center text-sm">
                <p className="text-gray-700 font-semibold">
                  {accountItems.length === 0
                    ? "El ERP no devolvió movimientos para este cliente."
                    : "No hay movimientos para este filtro."}
                </p>
                {accountItems.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Puede ser que el cliente no tenga historial de cuenta
                    corriente, o que la integración con el ERP todavía no
                    esté trayendo datos. Para diagnosticar, entrá desde
                    admin a{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      /admin/clientes/{client.client_id}/debug-cuenta
                    </code>
                    .
                  </p>
                )}
              </div>
            ) : (
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
                      <th className="px-4 py-3 font-semibold text-right">PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {visible.map((r, idx) => {
                      const numero = `${r.compLetra}${r.puntoVenta}-${r.compNro}`;
                      // PDF disponible solo para FC, NC, ND y RC. Otros
                      // movimientos internos (CG, CIB, etc.) no tienen
                      // comprobante descargable.
                      const puedeDescargar =
                        r.hasPdf !== false &&
                        PDF_AVAILABLE_COMPS.has((r.comp ?? "").toUpperCase());
                      return (
                        <tr key={`${numero}-${idx}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                            {formatDate(r.emision)}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {COMP_LABEL[r.comp] ?? r.comp}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#0a2b3d]">
                            {r.comp} {numero}
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
                          <td className="px-4 py-3 text-right">
                            {puedeDescargar ? (
                              <ComprobantePdfButton
                                url={buildDownloadUrl(r, client.client_id)}
                              />
                            ) : (
                              <span
                                className="inline-block text-[10px] text-gray-400"
                                title="Este comprobante no tiene PDF descargable"
                              >
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {source === "mock" && (
        <p className="text-xs text-amber-700">
          Mostrando datos de ejemplo — cuando la API del ERP esté conectada,
          estos movimientos pasan a ser los reales.
        </p>
      )}
    </div>
  );
}

function UnavailableBox({ error }: { error?: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <p className="font-bold text-amber-900">
        No pudimos traer tu cuenta corriente
      </p>
      <p className="text-sm text-amber-800 mt-1">
        La integración con el ERP Griffo todavía no está disponible para este
        cliente. Cuando se active, acá vas a ver todos tus comprobantes con el
        saldo en tiempo real.
      </p>
      {error ? (
        <details className="mt-3 text-xs text-amber-800">
          <summary className="cursor-pointer">Detalle técnico</summary>
          <pre className="mt-1 p-2 bg-amber-100 rounded overflow-x-auto whitespace-pre-wrap">
            {error}
          </pre>
        </details>
      ) : null}
    </div>
  );
}

function buildDownloadUrl(
  r: BejermanAccountStatusItem,
  clientId: string,
): string {
  // El ERP a veces devuelve valores con espacios (ej. compLetra: " "
  // para los recibos). Hay que trimearlos antes de mandar a la URL,
  // sino el API recibe " " y rompe.
  const comp = (r.comp ?? "").trim();
  const compLetra = (r.compLetra ?? "").trim();
  const puntoVenta = (r.puntoVenta ?? "").trim();
  const compNro = (r.compNro ?? "").trim();
  const q = new URLSearchParams({
    Comp: comp,
    PuntoVenta: puntoVenta,
    CompNro: compNro,
    CodCliente: clientId,
  });
  // CompLetra siempre presente (la API la valida como [Required] aún
  // si está vacío). El cliente HTTP de Bejerman ya defaultea a "".
  if (compLetra) q.set("CompLetra", compLetra);
  return `/api/b2b/comprobante?${q.toString()}`;
}
