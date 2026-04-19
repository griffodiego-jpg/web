import { formatDate, mockPriceLists } from "@/data/mock-b2b";

export const metadata = { title: "Lista de precios" };

export default function ListasPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#0a2b3d]">
          Tu lista de precios
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Lista particular con tus precios especiales y descuentos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockPriceLists.map((l) => (
          <div
            key={l.format}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4"
          >
            <div
              className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-black text-white text-xs ${
                l.format === "PDF" ? "bg-red-500" : "bg-emerald-600"
              }`}
            >
              {l.format}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#0a2b3d]">{l.label}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Formato {l.format} · Generada el {formatDate(l.generatedAt)}
              </p>
              <button
                type="button"
                disabled
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary disabled:opacity-60 disabled:cursor-not-allowed transition"
                title="Disponible cuando la integración con el ERP esté activa"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Descargar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-900">
        <p className="font-semibold mb-1">¿Cómo se genera?</p>
        <p className="text-blue-800">
          La lista se arma combinando los códigos del catálogo Griffo con
          tus precios particulares del ERP. Se regenera automáticamente
          cada vez que cambian tus descuentos o la lista base.
        </p>
      </div>
    </div>
  );
}
