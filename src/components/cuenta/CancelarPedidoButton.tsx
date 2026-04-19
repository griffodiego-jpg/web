"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Botón para cancelar un pedido. Solo válido si el pedido está en estado
 * `procesando` (el server valida de nuevo, el botón acá sólo se muestra
 * cuando el padre ya chequeó). Pide confirmación.
 */
export function CancelarPedidoButton({ pedidoId }: { pedidoId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/b2b/pedidos/${pedidoId}/cancelar`, {
        method: "POST",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cancelar");
      setSubmitting(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="px-4 py-2 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold rounded-lg transition text-sm"
      >
        Cancelar pedido
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error && (
        <p className="text-xs text-red-700 font-semibold">{error}</p>
      )}
      <span className="text-xs text-gray-700">¿Seguro?</span>
      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md text-xs disabled:opacity-60"
      >
        {submitting ? "Cancelando…" : "Sí, cancelar"}
      </button>
      <button
        type="button"
        onClick={() => {
          setConfirming(false);
          setError(null);
        }}
        disabled={submitting}
        className="px-3 py-1.5 text-gray-600 hover:text-[#0a2b3d] font-bold rounded-md text-xs"
      >
        No
      </button>
    </div>
  );
}
