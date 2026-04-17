"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Botón de cerrar sesión del admin. Borra la cookie server-side y
 * redirige a /admin/login. Único flow para terminar una sesión sin
 * esperar los 7 días de expiración del cookie.
 */
export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Ignorar — igual redirigimos. Si falló, el middleware va a
      // cortar en la próxima request de /admin/*.
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full text-left text-sm text-white/80 hover:text-white transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {loading ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
