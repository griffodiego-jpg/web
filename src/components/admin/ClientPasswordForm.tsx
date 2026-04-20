"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Form del admin para asignar una contraseña custom a un cliente B2B,
 * o resetearla al default (GRIFFO + CUIT). Dos botones: "Guardar" y
 * "Volver al default".
 *
 * `hasCustom` viene del server — indica si el cliente tiene override
 * guardado. El texto cambia para avisar si estamos en default o no.
 */
export function ClientPasswordForm({
  code,
  defaultPassword,
  initialHasCustom,
}: {
  code: string;
  defaultPassword: string;
  initialHasCustom: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"save" | "reset" | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );
  const [hasCustom, setHasCustom] = useState(initialHasCustom);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setMsg({ kind: "err", text: "Mínimo 6 caracteres." });
      return;
    }
    setLoading("save");
    setMsg(null);
    try {
      const res = await fetch("/api/admin/clientes/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      setMsg({ kind: "ok", text: "Contraseña actualizada." });
      setPassword("");
      setHasCustom(true);
      router.refresh();
    } catch (err) {
      setMsg({
        kind: "err",
        text: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setLoading(null);
    }
  }

  async function handleReset() {
    if (!confirm("¿Volver al default GRIFFO + CUIT?")) return;
    setLoading("reset");
    setMsg(null);
    try {
      const res = await fetch("/api/admin/clientes/password", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      setMsg({ kind: "ok", text: "Reseteada al default." });
      setHasCustom(false);
      router.refresh();
    } catch (err) {
      setMsg({
        kind: "err",
        text: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-3">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
        <p className="font-semibold text-[#0a2b3d]">Contraseña actual</p>
        {hasCustom ? (
          <p className="mt-1 text-gray-700">
            Personalizada (la seteaste acá desde el admin).
          </p>
        ) : (
          <p className="mt-1 text-gray-700">
            Default:{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-primary">
              {defaultPassword}
            </code>
          </p>
        )}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          Nueva contraseña
        </span>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ej: primavera2026"
          minLength={6}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        />
        <span className="text-[11px] text-gray-500">
          Mínimo 6 caracteres. La contraseña se guarda hasheada (scrypt).
        </span>
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={loading !== null}
          className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {loading === "save" ? "Guardando..." : "Guardar contraseña"}
        </button>
        {hasCustom ? (
          <button
            type="button"
            onClick={handleReset}
            disabled={loading !== null}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading === "reset" ? "Reseteando..." : "Volver al default"}
          </button>
        ) : null}
      </div>

      {msg ? (
        <p
          className={`text-sm ${
            msg.kind === "ok" ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {msg.text}
        </p>
      ) : null}
    </form>
  );
}
