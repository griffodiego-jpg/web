"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Código del producto (requerido). */
  productoCode: string;
  /** Slug de la página donde se está reportando. */
  productoSlug?: string;
};

type Status = "idle" | "loading" | "ok" | "error";

const TIPOS = [
  { id: "foto", label: "La foto está equivocada o falta" },
  { id: "vehiculos", label: "Los vehículos compatibles están mal" },
  { id: "medidas", label: "Las medidas no son correctas" },
  { id: "descripcion", label: "La descripción tiene un error" },
  { id: "otro", label: "Otro" },
] as const;

type TipoId = (typeof TIPOS)[number]["id"];

export function ReportarErrorModal({
  open,
  onClose,
  productoCode,
  productoSlug,
}: Props) {
  const [tipo, setTipo] = useState<TipoId>("foto");
  const [detalle, setDetalle] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Esc para cerrar.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock scroll del body cuando el modal está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset al abrir.
  useEffect(() => {
    if (open) {
      setTipo("foto");
      setDetalle("");
      setEmail("");
      setCelular("");
      setStatus("idle");
      setErrMsg(null);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrMsg(null);
    try {
      const productoUrl =
        typeof window !== "undefined" ? window.location.href : undefined;
      const res = await fetch("/api/reportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productoCode,
          productoSlug,
          productoUrl,
          tipoError: tipo,
          detalle,
          email: email || undefined,
          celular: celular || undefined,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setErrMsg(body.error ?? "Error al enviar");
        setStatus("error");
        return;
      }
      setStatus("ok");
    } catch {
      setErrMsg("No pudimos enviar el reporte. Probá de nuevo.");
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-xl font-black text-[#0a2b3d]">
          ¿Ves un error?
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Avisanos qué está mal en{" "}
          <span className="font-mono font-bold">{productoCode}</span> y lo
          corregimos.
        </p>

        {status === "ok" ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <p className="font-bold">¡Gracias!</p>
            <p className="mt-1">
              Recibimos tu reporte. Si dejaste contacto te escribimos cuando
              lo revisemos.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-700">
                ¿Qué está mal?
              </label>
              <div className="mt-2 space-y-2">
                {TIPOS.map((t) => (
                  <label
                    key={t.id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="tipo"
                      value={t.id}
                      checked={tipo === t.id}
                      onChange={() => setTipo(t.id)}
                      className="h-4 w-4 border-gray-300 text-primary"
                    />
                    <span>{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="reporte-detalle"
                className="block text-xs font-bold uppercase tracking-wide text-gray-700"
              >
                Detalle / qué debería decir <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reporte-detalle"
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                required
                minLength={5}
                maxLength={1500}
                rows={4}
                placeholder="Ej: 'la foto es de otro producto', 'el modelo Ranger no es compatible', 'la medida de diámetro dice 22 pero es 24'…"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-gray-400">
                {detalle.length}/1500
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="reporte-email"
                  className="block text-xs font-bold uppercase tracking-wide text-gray-700"
                >
                  Email (opcional)
                </label>
                <input
                  id="reporte-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="reporte-celular"
                  className="block text-xs font-bold uppercase tracking-wide text-gray-700"
                >
                  Celular (opcional)
                </label>
                <input
                  id="reporte-celular"
                  type="tel"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  placeholder="11 1234 5678"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Dejar contacto es opcional. Sirve si necesitamos confirmar
              algún detalle.
            </p>

            {errMsg ? (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errMsg}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={status === "loading"}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-md bg-primary px-4 py-2 text-sm font-black uppercase tracking-wide text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {status === "loading" ? "Enviando…" : "Enviar reporte"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
