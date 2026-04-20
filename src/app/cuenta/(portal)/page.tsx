import Link from "next/link";
import { computeSaldo, formatARS, mockAccountStatus } from "@/data/mock-b2b";

export const metadata = { title: "Resumen" };

export default function ResumenPage() {
  const saldo = computeSaldo(mockAccountStatus);
  const hayDeuda = saldo > 0;

  return (
    <div className="max-w-2xl">
      <Link
        href="/cuenta/cuenta-corriente"
        className="block bg-white border border-gray-200 rounded-xl p-8 hover:border-primary/40 hover:shadow-sm transition"
      >
        <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">
          Saldo en cuenta corriente
        </p>
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
      </Link>
    </div>
  );
}
