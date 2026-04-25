"use client";

import { useEffect, useRef, useState } from "react";

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

const LINEAS = [
  { id: "suspension", label: "Suspensión" },
  { id: "direccion", label: "Dirección" },
  { id: "transmision", label: "Transmisión" },
  { id: "otro", label: "Otro" },
] as const;

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  const [linea, setLinea] = useState<string>("");
  const [lado, setLado] = useState("");
  const [medidas, setMedidas] = useState("");
  const [oem, setOem] = useState("");
  const [perfil, setPerfil] = useState<string>("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoErr, setFotoErr] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Re-precargar marca/modelo/año si el modal se abre con valores nuevos.
  useEffect(() => {
    if (open) {
      setMarca(prefillBrand);
      setModelo(prefillModel);
      setAnio(prefillYear);
    }
  }, [open, prefillBrand, prefillModel, prefillYear]);

  // Cleanup del object URL del preview al cambiar/cerrar.
  useEffect(() => {
    return () => {
      if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    };
  }, [fotoPreview]);

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
    setLinea("");
    setLado("");
    setMedidas("");
    setOem("");
    setPerfil("");
    setEmail("");
    setCelular("");
    setFoto(null);
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setFotoPreview(null);
    setFotoErr(null);
    setStatus("idle");
    setErrMsg(null);
    if (fotoInputRef.current) fotoInputRef.current.value = "";
  };

  const handleClose = () => {
    if (status === "loading") return;
    onClose();
    setTimeout(reset, 200);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFotoErr(null);
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setFoto(null);
      if (fotoPreview) URL.revokeObjectURL(fotoPreview);
      setFotoPreview(null);
      return;
    }
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setFotoErr("La foto debe ser JPG, PNG o WebP.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setFotoErr("La foto pesa más de 4 MB. Probá con una más liviana.");
      e.target.value = "";
      return;
    }
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const removeFoto = () => {
    setFoto(null);
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setFotoPreview(null);
    setFotoErr(null);
    if (fotoInputRef.current) fotoInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrMsg(null);

    const fd = new FormData();
    fd.append("producto", producto.trim());
    if (marca.trim()) fd.append("marcaVehiculo", marca.trim());
    if (modelo.trim()) fd.append("modeloVehiculo", modelo.trim());
    if (anio.trim()) fd.append("anioVehiculo", anio.trim());
    if (linea) fd.append("linea", linea);
    if (lado.trim()) fd.append("lado", lado.trim());
    if (medidas.trim()) fd.append("medidas", medidas.trim());
    if (oem.trim()) fd.append("oem", oem.trim());
    if (perfil) fd.append("perfil", perfil);
    if (email.trim()) fd.append("email", email.trim());
    if (celular.trim()) fd.append("celular", celular.trim());
    if (busqueda) fd.append("busqueda", busqueda);
    if (tab) fd.append("tab", tab);
    if (foto) fd.append("foto", foto);

    try {
      const res = await fetch("/api/sugerencias", {
        method: "POST",
        body: fd,
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
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sugerencia-title"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={handleClose}
        className="absolute inset-0 bg-black/50"
      />

      <div className="relative w-full max-w-xl max-h-[calc(100vh-3rem)] overflow-y-auto rounded-xl bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4">
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
          <div className="px-6 py-10 text-center">
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
              label="¿Qué producto buscás?"
              required
              hint="Ej: 'Fuelle de cremallera para Toyota Hilux 2018'"
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

            <Field label="Línea (opcional)">
              <ChipGroup
                options={LINEAS}
                value={linea}
                onChange={setLinea}
              />
            </Field>

            <Field
              label="Lado (opcional)"
              hint="Ej: 'izquierdo', 'derecho', 'lado caja', 'lado rueda', 'delantero'…"
            >
              <input
                type="text"
                value={lado}
                onChange={(e) => setLado(e.target.value)}
                maxLength={60}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </Field>

            <Field
              label="Medidas (opcional)"
              hint="Ej: 'Diámetro mayor 92mm, largo 210mm'"
            >
              <input
                type="text"
                value={medidas}
                onChange={(e) => setMedidas(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </Field>

            <Field
              label="Código OEM original (opcional)"
              hint="El número de pieza del fabricante del auto, si lo tenés."
            >
              <input
                type="text"
                value={oem}
                onChange={(e) => setOem(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </Field>

            <Field
              label="Foto (opcional)"
              hint="Sumá una foto del repuesto si la tenés. Max 4 MB, JPG/PNG/WebP."
            >
              {fotoPreview ? (
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fotoPreview}
                    alt="Vista previa"
                    className="h-20 w-20 rounded-md object-cover"
                  />
                  <div className="flex-1 text-xs text-gray-600">
                    <p className="font-bold text-[#0a2b3d]">{foto?.name}</p>
                    <p>{foto ? `${(foto.size / 1024 / 1024).toFixed(2)} MB` : ""}</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFoto}
                    className="text-xs font-bold text-red-600 hover:text-red-800"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-4 py-3 text-sm font-bold text-gray-500 transition hover:border-primary hover:text-primary">
                  📎 Subir foto
                  <input
                    ref={fotoInputRef}
                    type="file"
                    accept={ALLOWED_PHOTO_TYPES.join(",")}
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
              )}
              {fotoErr ? (
                <p className="mt-1 text-xs text-red-600">{fotoErr}</p>
              ) : null}
            </Field>

            <Field label="¿Quién sos? (opcional)">
              <ChipGroup
                options={PROFILES}
                value={perfil}
                onChange={setPerfil}
              />
            </Field>

            <Field
              label="Tu contacto (opcional)"
              hint="Si querés que te avisemos cuando lo tengamos. Podés dejar uno o los dos."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email — ejemplo@mail.com"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="tel"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  placeholder="Celular / WhatsApp — 11 5555-5555"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
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
                {status === "loading"
                  ? foto
                    ? "Subiendo foto..."
                    : "Enviando..."
                  : "Enviar sugerencia"}
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

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: readonly { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(active ? "" : o.id)}
            className={[
              "rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition",
              active
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 bg-white text-gray-500 hover:border-primary",
            ].join(" ")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
