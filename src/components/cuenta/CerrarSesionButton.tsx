"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMockSession } from "@/lib/mock-session";

export function CerrarSesionButton() {
  const router = useRouter();
  const { logout } = useMockSession();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      // Borrar la sesión server-side (cookie httpOnly + Redis). Tolerante
      // a fallos: si la red cae, igual limpiamos localStorage para que
      // el usuario vea el efecto.
      await fetch("/api/b2b/logout", { method: "POST" }).catch(() => null);
      logout();
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="text-sm text-gray-600 hover:text-[#0a2b3d] transition px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
