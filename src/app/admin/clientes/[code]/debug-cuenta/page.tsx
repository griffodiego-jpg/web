import Link from "next/link";
import { getClientAccountStatus } from "@/lib/api/bejerman";
import {
  categorizeAccountItems,
  countCompCodes,
  isLikelyPago,
} from "@/lib/b2b/movement-classifier";
import { loadClientByCode } from "@/lib/b2b/client-loader";
import type { BejermanAccountStatusItem } from "@/types/bejerman";

export const dynamic = "force-dynamic";

type Params = Promise<{ code: string }>;

function formatARS(value: number): string {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  });
}

export async function generateMetadata({ params }: { params: Params }) {
  const { code } = await params;
  return { title: `Debug cuenta — ${code}` };
}

export default async function DebugCuentaPage({ params }: { params: Params }) {
  const { code } = await params;
  const client = await loadClientByCode(code);

  let items: BejermanAccountStatusItem[] = [];
  let fetchError: string | null = null;
  try {
    items = await getClientAccountStatus(code);
  } catch (err) {
    items = [];
    fetchError = err instanceof Error ? err.message : String(err);
  }

  const codes = countCompCodes(items);
  const cat = categorizeAccountItems(items);
  const totalDebe = items.reduce((a, x) => a + x.debe, 0);
  const totalHaber = items.reduce((a, x) => a + x.haber, 0);
  const saldo = totalDebe - totalHaber;
  const pagos = items.filter(isLikelyPago);

  return (
    <div className="max-w-5xl space-y-6">
      <nav className="text-xs text-gray-500">
        <Link href="/admin/clientes" className="hover:text-primary">
          Clientes B2B
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/admin/clientes/${encodeURIComponent(code)}`}
          className="hover:text-primary"
        >
          {client?.name ?? code}
        </Link>
        <span className="mx-2">/</span>
        <span>Debug cuenta corriente</span>
      </nav>

      <header>
        <h1 className="text-2xl font-black text-[#0a2b3d]">
          Debug cuenta corriente
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Inspección de lo que devuelve el middleware del ERP para este
          cliente. Útil para diagnosticar por qué no aparecen pagos o el
          saldo no cuadra.
        </p>
      </header>

      {fetchError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="font-bold text-red-900">Error al consultar el ERP</p>
          <pre className="mt-2 text-xs text-red-800 bg-red-100 p-3 rounded overflow-x-auto whitespace-pre-wrap">
            {fetchError}
          </pre>
        </div>
      ) : null}

      {/* Totales */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Kpi label="Movimientos" value={items.length.toString()} />
        <Kpi label="Total debe" value={formatARS(totalDebe)} />
        <Kpi
          label="Total haber"
          value={formatARS(totalHaber)}
          tone={totalHaber < 0 ? "warn" : "ok"}
          hint={totalHaber < 0 ? "⚠ sumatoria negativa — irregular" : undefined}
        />
        <Kpi
          label="Saldo calculado"
          value={formatARS(saldo)}
          tone={saldo > 0 ? "warn" : "ok"}
        />
      </section>

      {/* Categorías */}
      <section>
        <h2 className="text-lg font-bold text-[#0a2b3d] mb-3">
          Por categoría (clasificación heurística)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <CatBox label="Facturas" items={cat.factura} />
          <CatBox label="Notas débito" items={cat.nota_debito} />
          <CatBox label="Notas crédito" items={cat.nota_credito} />
          <CatBox label="Pagos (incluye heurística)" items={pagos} tone="ok" />
          <CatBox label="Sin clasificar" items={cat.otro} tone="warn" />
        </div>
      </section>

      {/* Tabla de códigos */}
      <section>
        <h2 className="text-lg font-bold text-[#0a2b3d] mb-3">
          Todos los códigos <code className="text-xs font-mono">comp</code> que
          devolvió el ERP
        </h2>
        {codes.length === 0 ? (
          <p className="text-sm text-gray-500">
            El ERP no devolvió ningún comprobante para este cliente.
          </p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">comp</th>
                  <th className="px-4 py-3 font-semibold">Categoría</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Σ Debe
                  </th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Σ Haber
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {codes.map((c) => {
                  const cls = classifyLabel(c.comp);
                  return (
                    <tr key={c.comp} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-primary">
                        {c.comp}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{cls}</td>
                      <td className="px-4 py-3 text-right">{c.count}</td>
                      <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">
                        {c.debe !== 0 ? formatARS(c.debe) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">
                        {c.haber !== 0 ? formatARS(c.haber) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-gray-500">
        Si ves códigos en &quot;Sin clasificar&quot; o la columna haber es
        negativa, es probable que el middleware del ERP tenga un bug —
        pasale esta info al técnico.
      </p>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "neutral";
  hint?: string;
}) {
  const cls =
    tone === "warn"
      ? "text-amber-700"
      : tone === "ok"
        ? "text-emerald-700"
        : "text-[#0a2b3d]";
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
        {label}
      </p>
      <p className={`text-xl font-black mt-1 ${cls}`}>{value}</p>
      {hint ? (
        <p className="text-[10px] text-amber-700 font-semibold mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

function CatBox({
  label,
  items,
  tone = "neutral",
}: {
  label: string;
  items: Array<{ debe: number; haber: number }>;
  tone?: "ok" | "warn" | "neutral";
}) {
  const debe = items.reduce((a, x) => a + x.debe, 0);
  const haber = items.reduce((a, x) => a + x.haber, 0);
  const bg =
    tone === "warn"
      ? "bg-amber-50 border-amber-200"
      : tone === "ok"
        ? "bg-emerald-50 border-emerald-200"
        : "bg-white border-gray-200";
  return (
    <div className={`border rounded-xl p-3 ${bg}`}>
      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-600">
        {label}
      </p>
      <p className="text-2xl font-black text-[#0a2b3d] mt-1">{items.length}</p>
      <p className="text-[10px] text-gray-600 mt-1">
        D {formatARS(debe)} · H {formatARS(haber)}
      </p>
    </div>
  );
}

function classifyLabel(comp: string): string {
  // Reutiliza classifyComp para etiquetar. Importar incurre en un ciclo
  // si lo hacemos al top; inline acá.
  const s = (comp ?? "").trim().toUpperCase();
  if (/^(FC|FA|FACT|INV)/.test(s)) return "Factura";
  if (/^(ND|DB)/.test(s)) return "Nota de débito";
  if (/^(NC|CR|CRED)/.test(s)) return "Nota de crédito";
  if (/^(RE|RB|RC|COB|PA|CBR|CX|REC)/.test(s)) return "Pago / Recibo";
  return "(sin clasificar)";
}
