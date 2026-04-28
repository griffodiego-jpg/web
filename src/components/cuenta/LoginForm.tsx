"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMockSession } from "@/lib/mock-session";

export function LoginForm() {
  const router = useRouter();
  const { login } = useMockSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/b2b/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || `Error ${res.status}`);
      }
      login({
        email: data.client.email,
        clientId: data.client.client_id,
        clientName: data.client.name,
        warehouses: data.client.warehouses,
      });
      router.push("/cuenta");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error desconocido");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-[#0a2b3d] mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@empresa.com.ar"
          autoComplete="email"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="password" className="block text-sm font-semibold text-[#0a2b3d]">
            Contraseña
          </label>
          <a
            href="mailto:ventas@griffo.com.ar?subject=Reseteo%20de%20contrase%C3%B1a%20portal%20clientes"
            className="text-xs text-primary hover:underline"
          >
            Olvidé mi contraseña
          </a>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
        />
      </div>

      {err ? <p className="text-sm text-red-600">{err}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-lg transition shadow-sm disabled:opacity-50"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
