"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Banner rojo que se muestra en el portal cuando el admin está
 * "logueado como" un cliente. El botón "Salir de la vista" borra la
 * cookie server-side, limpia localStorage y redirige al admin.
 */
export function ImpersonationBanner({ clientName }: { clientName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function exit() {
    setLoading(true);
    try {
      await fetch("/api/admin/clientes/impersonate", { method: "DELETE" });
      window.localStorage.removeItem("griffo:b2b:session");
      window.dispatchEvent(new Event("b2b-session-change"));
      router.push("/admin/clientes");
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="bg-red-600 text-white">
      <div className="max-w-6xl mx-auto px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="font-bold">
          Vista de admin — estás viendo el portal como{" "}
          <span className="underline">{clientName}</span>
        </p>
        <button
          type="button"
          onClick={exit}
          disabled={loading}
          className="rounded-md bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wide text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {loading ? "Saliendo..." : "Salir de la vista"}
        </button>
      </div>
    </div>
  );
}
