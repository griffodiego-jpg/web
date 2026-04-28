"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearCartStorage } from "@/lib/cart";

/**
 * Botón "Loguear como" del admin. Flujo:
 *   1. POST /api/admin/clientes/impersonate → setea cookie server-side.
 *   2. Seedea localStorage con los datos del cliente para que el header
 *      público muestre el estado "logueado" con el nombre correcto.
 *   3. Redirige a /cuenta — el portal lee la cookie y renderiza los
 *      datos del cliente impersonado.
 *
 * Para salir: `ImpersonationBanner` → DELETE /api/admin/clientes/impersonate.
 */
export function ImpersonateButton({
  code,
  label = "Loguear como",
  variant = "solid",
}: {
  code: string;
  label?: string;
  variant?: "solid" | "link";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handle() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/clientes/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Error ${res.status}`);
      }
      const data = (await res.json()) as {
        client: { client_id: string; name: string; email: string };
      };
      // Limpiamos el carrito por si quedó algo de la sesión anterior
      // (admin que estaba viendo a otro cliente, o un cliente real que
      // cerró sesión sin desloguearse).
      clearCartStorage();
      window.localStorage.setItem(
        "griffo:b2b:session",
        JSON.stringify({
          email: data.client.email,
          clientId: data.client.client_id,
          clientName: data.client.name,
          impersonated: true,
          loggedAt: new Date().toISOString(),
        }),
      );
      window.dispatchEvent(new Event("b2b-session-change"));
      router.push("/cuenta");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error desconocido");
      setLoading(false);
    }
  }

  const cls =
    variant === "link"
      ? "text-xs font-semibold text-primary hover:underline disabled:opacity-50"
      : "inline-flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 transition disabled:opacity-50";

  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={handle} disabled={loading} className={cls}>
        {variant === "solid" && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
        {loading ? "Entrando..." : label}
      </button>
      {err ? <p className="text-[10px] text-red-600">{err}</p> : null}
    </div>
  );
}
