"use client";

import { useRouter } from "next/navigation";
import { useMockSession } from "@/lib/mock-session";

export function CerrarSesionButton() {
  const router = useRouter();
  const { logout } = useMockSession();

  return (
    <button
      type="button"
      onClick={() => {
        logout();
        router.push("/");
      }}
      className="text-sm text-gray-600 hover:text-[#0a2b3d] transition px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
    >
      Cerrar sesión
    </button>
  );
}
