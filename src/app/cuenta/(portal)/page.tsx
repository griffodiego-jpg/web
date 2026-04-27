import Link from "next/link";
import { formatARS } from "@/data/mock-b2b";
import { getAccountStatusForClient } from "@/lib/b2b/account-status";
import { computeNormalizedSaldo } from "@/lib/b2b/movement-classifier";
import { hasUnseenPriceList } from "@/lib/price-lists";
import { getCurrentClient } from "@/lib/b2b/current-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Resumen" };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function ResumenPage() {
  const client = await getCurrentClient();
  const { items, source } = await getAccountStatusForClient(client.client_id);
  // Mismo cálculo normalizado que /cuenta/cuenta-corriente — para que el
  // saldo del resumen coincida con el del detalle (RC y CG vienen con
  // haber negativo y necesitan el flip para no inflar la deuda).
  const { saldo } = computeNormalizedSaldo(items);
  const hayDeuda = saldo > 0;
  const disponible = source !== "unavailable";

  const { hasNew, list } = await hasUnseenPriceList(
    client.client_id,
    client.priceListCode,
  );

  return (
    <div className="max-w-2xl space-y-4">
      {hasNew && list && (
        <Link
          href="/cuenta/listas"
          className="block bg-accent/10 border-2 border-accent rounded-xl p-4 hover:bg-accent/20 transition"
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-lg">
              🎉
            </div>
            <div className="flex-1">
              <p className="font-black text-[#0a2b3d]">
                Nueva lista de precios disponible
              </p>
              <p className="text-sm text-gray-700 mt-0.5">
                {list.name} — publicada el {formatDate(list.uploadedAt)}.
              </p>
              <p className="text-xs text-primary font-bold mt-2">
                Ver mi lista →
              </p>
            </div>
          </div>
        </Link>
      )}

      <Link
        href="/cuenta/cuenta-corriente"
        className="block bg-white border border-gray-200 rounded-xl p-8 hover:border-primary/40 hover:shadow-sm transition"
      >
        <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">
          Saldo en cuenta corriente
        </p>
        {disponible ? (
          <>
            <p
              className={`text-5xl font-black mt-3 ${
                hayDeuda ? "text-amber-700" : "text-emerald-700"
              }`}
            >
              {formatARS(saldo)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {hayDeuda ? "Pendiente de pago" : "Tu cuenta está al día"}
              <span className="text-primary font-bold ml-3">
                Ver movimientos →
              </span>
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-black mt-3 text-gray-400">—</p>
            <p className="text-sm text-gray-600 mt-2">
              Todavía no se activó la integración con el ERP para este
              cliente.
              <span className="text-primary font-bold ml-3">Ver más →</span>
            </p>
          </>
        )}
      </Link>
    </div>
  );
}
