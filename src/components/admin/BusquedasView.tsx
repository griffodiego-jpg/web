"use client";

import { useState } from "react";

import type { ZeroResultMeta } from "@/lib/search-log";
import { BusquedasTable } from "./BusquedasTable";

export function BusquedasView({ rows }: { rows: ZeroResultMeta[] }) {
  const [showResolved, setShowResolved] = useState(false);

  const pendientes = rows.filter((r) => !r.resolved).length;
  const resueltas = rows.filter((r) => r.resolved).length;

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            Pendientes: {pendientes}
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            Resueltas: {resueltas}
          </span>
        </div>
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setShowResolved(e.target.checked)
            }
            className="h-4 w-4 rounded border-gray-300"
          />
          <span>Mostrar también las resueltas</span>
        </label>
      </div>
      <BusquedasTable rows={rows} showResolved={showResolved} />
    </div>
  );
}
