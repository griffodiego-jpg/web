"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type CatalogStatus = {
  /** ok = conectado; slow = funcionando con demoras o datos parciales; down = no disponible. */
  level: "ok" | "slow" | "down";
  productCount: number;
  checkedAt: string;
};

type Props = {
  status: CatalogStatus;
};

const CONFIG = {
  ok: {
    label: "Conectado",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-700",
  },
  slow: {
    label: "Con demoras",
    dotClass: "bg-amber-500",
    textClass: "text-amber-700",
  },
  down: {
    label: "No disponible",
    dotClass: "bg-red-500",
    textClass: "text-red-700",
  },
} as const;

export function StatusBadge({ status }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const btnRef = useRef<HTMLButtonElement>(null);

  const cfg = CONFIG[status.level];
  const checkedAt = new Date(status.checkedAt);

  const handleRecheck = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Estado del catálogo: ${cfg.label}`}
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-bold transition hover:border-gray-300"
      >
        <span className="relative flex h-2 w-2">
          {status.level === "ok" ? (
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${cfg.dotClass} opacity-60`} />
          ) : null}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.dotClass}`} />
        </span>
        <span className={cfg.textClass}>{cfg.label}</span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="dialog"
            className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${cfg.dotClass}`} />
              <p className={`text-sm font-black ${cfg.textClass}`}>{cfg.label}</p>
            </div>

            <dl className="mt-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <dt className="text-gray-500">Productos</dt>
                <dd className="font-bold text-[#0a2b3d]">{status.productCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Última verificación</dt>
                <dd className="font-bold text-[#0a2b3d]">
                  {checkedAt.toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
            </dl>

            {status.level !== "ok" ? (
              <p className="mt-3 text-[11px] leading-relaxed text-gray-600">
                {status.level === "down"
                  ? "El catálogo no está respondiendo. Volvé a verificar en unos minutos."
                  : "El catálogo responde pero podría mostrar datos incompletos."}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleRecheck}
              disabled={isPending}
              className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-[11px] font-bold text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {isPending ? "Verificando..." : "Volver a verificar"}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
