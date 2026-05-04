import Link from "next/link";
import { getPriceListForClient } from "@/lib/price-lists";
import { getCurrentClient } from "@/lib/b2b/current-client";
import type { PriceList } from "@/types/price-list";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lista de precios" };

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function ListasPage() {
  const client = await getCurrentClient();
  const list = await getPriceListForClient(client.priceListCode);

  // Nota: la marca "vista" se setea cuando el cliente realmente
  // descarga el archivo (en `/api/b2b/lista-precios`). Si sólo entra
  // a esta página y no descarga, sigue contando como "no vista" y la
  // alerta del resumen sigue ahí.

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#0a2b3d]">
          Tu lista de precios
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          La lista que Griffo tiene asignada a tu cuenta. Se actualiza
          cuando publicamos nuevos precios — te avisamos por email.
        </p>
      </div>

      {list ? (
        <ListaCard list={list} />
      ) : (
        <EmptyState priceListCode={client.priceListCode} />
      )}
    </div>
  );
}

function ListaCard({ list }: { list: PriceList }) {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-5">
        <div className="shrink-0 w-14 h-14 rounded-lg bg-red-500 text-white flex items-center justify-center font-black text-xs">
          {list.filename.toLowerCase().endsWith(".pdf")
            ? "PDF"
            : list.filename.toLowerCase().endsWith(".csv")
              ? "CSV"
              : "XLSX"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wider">
            {list.code}
          </p>
          <h3 className="font-black text-lg text-[#0a2b3d] mt-0.5">
            {list.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Publicada el {formatDate(list.uploadedAt)}
            {list.sizeBytes > 0 ? ` · ${formatBytes(list.sizeBytes)}` : ""}
          </p>
          {list.note && (
            <p className="text-sm mt-3 p-3 rounded-lg bg-blue-50 border-l-4 border-accent text-blue-900">
              {list.note}
            </p>
          )}
          <a
            href="/api/b2b/lista-precios"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg text-sm transition"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar lista
          </a>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700">
        <p className="font-bold mb-1">¿Dudas con los precios?</p>
        <p>
          Escribinos a{" "}
          <a
            href="mailto:ventas@griffo.com.ar"
            className="text-primary font-semibold hover:underline"
          >
            ventas@griffo.com.ar
          </a>{" "}
          o usá el WhatsApp desde el sitio público.
        </p>
      </div>
    </div>
  );
}

function EmptyState({ priceListCode }: { priceListCode?: string | null }) {
  return (
    <div className="max-w-2xl bg-amber-50 border border-amber-200 rounded-xl p-6">
      <p className="font-bold text-amber-900">Lista no disponible todavía</p>
      <p className="text-sm text-amber-800 mt-2">
        {priceListCode ? (
          <>
            Tu cuenta tiene asignada la lista{" "}
            <code className="bg-amber-100 px-1 rounded font-mono">
              {priceListCode}
            </code>{" "}
            pero todavía no hay un archivo publicado para ese código. Te vamos
            a avisar por email cuando se suba.
          </>
        ) : (
          <>
            Tu cuenta no tiene asignada una lista específica. Si pensás que
            esto es un error, escribinos a{" "}
            <a
              href="mailto:ventas@griffo.com.ar"
              className="underline font-semibold"
            >
              ventas@griffo.com.ar
            </a>
            .
          </>
        )}
      </p>
      <Link
        href="/cuenta"
        className="inline-block mt-4 text-xs font-bold text-amber-900 hover:underline"
      >
        ← Volver al resumen
      </Link>
    </div>
  );
}
