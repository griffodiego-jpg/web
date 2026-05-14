"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Contraseña incorrecta");
        setLoading(false);
        return;
      }

      const fromRaw = searchParams.get("from");
      const safeFrom =
        fromRaw && fromRaw.startsWith("/") && !fromRaw.startsWith("//")
          ? fromRaw
          : "/admin";
      router.push(safeFrom);
      router.refresh();
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo className="h-12 w-auto mx-auto" />
          <h1 className="mt-4 text-2xl font-black text-[#0a2b3d]">
            Administración
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ingresá la contraseña para acceder
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white shadow-lg rounded-lg p-8 space-y-5"
        >
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresá la contraseña"
              required
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Panel de administración Griffo
        </p>
      </div>
    </div>
  );
}
