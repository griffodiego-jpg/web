import type { PedidoStatus } from "@/types/pedido";

const STYLES: Record<PedidoStatus, { label: string; cls: string }> = {
  procesando: {
    label: "Pendiente de carga",
    cls: "bg-amber-50 text-amber-800 border-amber-200",
  },
  en_preparacion: {
    label: "En preparación",
    cls: "bg-blue-50 text-blue-800 border-blue-200",
  },
  entregado: {
    label: "Entregado",
    cls: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  cancelado: {
    label: "Cancelado",
    cls: "bg-red-50 text-red-800 border-red-200",
  },
};

export function PedidoStatusPill({ status }: { status: PedidoStatus }) {
  const s = STYLES[status];
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
