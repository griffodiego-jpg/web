"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Snapshot de la búsqueda actual — se manda como contexto al backend. */
  busqueda?: string;
  /** Tab activo cuando se abrió el modal (palabra / patente / vehículo / …). */
  tab?: string;
  /** Vehículo precargado si vino del tab Vehículo. */
  prefillBrand?: string;
  prefillModel?: string;
  prefillYear?: string;
};

type Status = "idle" | "loading" | "ok" | "error";

const PROFILES = [
  { id: "mecanico", label: "Mecánico" },
  { id: "taller", label: "Taller" },
  { id: "particular", label: "Particular" },
  { id: "distribuidor", label: "Distribuidor" },
] as const;

export function SugerenciaModal({
  open,
  onClose,
  busqueda,
  tab,
  prefillBrand = "",
  prefillModel = "",
  prefillYear = "",
}: Props) {
  const [producto, setProducto] = useState("");
  const [marca, setMarca] = useState(prefillBrand);
  const [modelo, setModelo] = useState(prefillModel);
  const [anio, setAnio] = useState(prefillYear);
  const [perfil, setPerfil] = useState<string>("");
  const [contacto, setContacto] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Re-precargar marca/modelo/año si el modal se abre con valores nuevos
  // (ej. el usuario cambió de vehículo y volvió a abrir el modal).
  useEffect(() => {
    if (open) {
      setMarca(prefillBrand);
      setModelo(prefillModel);
      setAnio(prefillYear);
    }
  }, [open, prefillBrand, prefillModel, prefillYear]);

  // Esc para cerrar.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const reset = () => {
    setProducto("");
    setPerfil("");
    setContacto("");
    setStatus("idle");
    setErrMsg(null);
  };

  const handleClose = () => {
    if (status === "loading") return;
    onClose();
    // Reset con delay para no ver el form vaciándose mientras el modal cierra.
    setTimeout(reset, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrMsg(null);
    try {
      const res = await fetch("/api/sugerencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producto: producto.trim(),
          marcaVehiculo: marca.trim() || undefined,
          modeloVehiculo: modelo.trim() || undefined,
          anioVehiculo: anio.trim() || undefined,
          perfil: perfil || undefined,
          contacto: contacto.trim() || undefined,
          busqueda,
          tab,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setErrMsg(data?.error || "No pudimos enviar la sugerencia. Probá de nuevo.");
        return;
      }
      setStatus("ok");
    } catch {
      setStatus("error");
      setErrMsg("No pudimos enviar la sugerencia. Probá de nuevo.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sugerencia-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={handleClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div>
            <h2
              id="sugerencia-title"
              className="text-lg font-black text-[#0a2b3d]"
            >
              Sugerí un producto
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Si lo que buscabas no está, contanos. El equipo de Griffo evalúa
              estos pedidos para futuras producciones.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={status === "loading"}
            className="text-2xl leading-none text-gray-400 transition hover:text-[#0a2b3d] disabled:opacity-50"
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        {status === "ok" ? (
          <div className="px-6 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">
              ✓
            </div>
            <p className="mt-4 text-base font-bold text-[#0a2b3d]">
              ¡Gracias! Recibimos tu sugerencia.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Si dejaste contacto, te avisamos cuando lo tengamos.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-dark"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <Field
              label="Producto que buscás"
              required
              hint="Ej: Fuelle de cremallera para Toyota Hilux 2018"
            >
              <textarea
                required
                rows={3}
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
                maxLength={1000}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </Field>

            <Field label="Vehículo (opcional)">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Marca"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="text"
                  placeholder="Modelo"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="text"
                  placeholder="Año"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </Field>

            <Field label="¿Quién sos? (opcional)">
              <div className="flex flex-wrap gap-2">
                {PROFILES.map((p) => {
                  const active = perfil === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPerfil(active ? "" : p.id)}
                      className={[
                        "rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition",
                        active
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 bg-white text-gray-500 hover:border-primary",
                      ].join(" ")}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field
              label="Tu contacto (opcional)"
              hint="Email o WhatsApp si querés que te avisemos cuando lo tengamos"
            >
              <input
                type="text"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="ejemplo@mail.com"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </Field>

            {busqueda ? (
              <p className="rounded-md bg-gray-50 px-3 py-2 text-[11px] text-gray-500">
                Tu búsqueda actual: <span className="font-mono">{busqueda}</span>
              </p>
            ) : null}

            {errMsg ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                {errMsg}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={status === "loading"}
                className="rounded-lg px-4 py-2 text-sm font-bold text-gray-500 transition hover:text-[#0a2b3d] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-60"
              >
                {status === "loading" ? "Enviando..." : "Enviar sugerencia"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#0a2b3d]">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-gray-400">{hint}</span> : null}
    </label>
  );
}
