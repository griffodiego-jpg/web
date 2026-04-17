"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "ok" | "error";

/**
 * Form de registro para descarga de recursos gated (banco de imágenes,
 * base de datos). Al submit exitoso:
 *   1. Registra los datos en /api/descargas/registro (notifica por email).
 *   2. Revela el link de descarga y auto-dispara la descarga.
 *
 * Campos: nombre, empresa, email, teléfono, "compra a" (distribuidor).
 */
export function RegistroDescargaForm({
  recursoId,
  recursoTitulo,
  fileUrl,
  available,
}: {
  recursoId: string;
  recursoTitulo: string;
  fileUrl: string;
  /** Si no hay archivo todavía, el form igual captura el lead y
   *  mostramos un mensaje de "te lo mandamos por email" en vez de
   *  auto-disparar una descarga rota. */
  available: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState({
    nombre: "",
    empresa: "",
    email: "",
    telefono: "",
    compraA: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/descargas/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, recursoId, recursoTitulo }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Hubo un error");
      }
      setStatus("ok");
      // Solo disparamos la descarga si hay un archivo real. Si no,
      // la confirmación avisa que se lo mandamos por email.
      if (available) {
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Hubo un error");
      setStatus("error");
    }
  }

  if (status === "ok") {
    if (!available) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 space-y-2">
          <p className="font-bold text-green-800">¡Gracias por registrarte!</p>
          <p className="text-sm text-gray-800">
            Te vamos a enviar <strong>{recursoTitulo}</strong> al mail que
            dejaste en cuanto esté disponible.
          </p>
        </div>
      );
    }
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-5 space-y-3">
        <p className="font-bold text-green-800">
          ¡Gracias por registrarte!
        </p>
        <p className="text-sm text-gray-800">
          Si la descarga no empezó automáticamente, hacé clic en el botón de
          abajo.
        </p>
        <a
          href={fileUrl}
          download
          className="inline-flex items-center gap-2 bg-primary text-white rounded-full px-6 py-2 text-sm font-bold hover:bg-primary-dark transition"
        >
          <DownloadIcon />
          Descargar {recursoTitulo}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          id={`${recursoId}-nombre`}
          label="Nombre"
          required
          value={data.nombre}
          onChange={(v) => setData((d) => ({ ...d, nombre: v }))}
        />
        <Field
          id={`${recursoId}-empresa`}
          label="Empresa"
          required
          value={data.empresa}
          onChange={(v) => setData((d) => ({ ...d, empresa: v }))}
        />
        <Field
          id={`${recursoId}-email`}
          label="Email"
          type="email"
          required
          value={data.email}
          onChange={(v) => setData((d) => ({ ...d, email: v }))}
        />
        <Field
          id={`${recursoId}-telefono`}
          label="Teléfono"
          type="tel"
          required
          value={data.telefono}
          onChange={(v) => setData((d) => ({ ...d, telefono: v }))}
        />
      </div>
      <Field
        id={`${recursoId}-compra-a`}
        label="¿A quién le compra Griffo?"
        required
        value={data.compraA}
        onChange={(v) => setData((d) => ({ ...d, compraA: v }))}
        placeholder="Nombre del distribuidor o comercio"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center gap-2 uppercase bg-primary text-white rounded-full px-8 py-2.5 font-bold hover:bg-primary-dark transition disabled:opacity-60 cursor-pointer"
      >
        {status === "loading" ? (
          "Enviando..."
        ) : (
          <>
            <DownloadIcon />
            {available ? "Registrarme y descargar" : "Registrarme"}
          </>
        )}
      </button>
      {status === "error" && (
        <p className="text-red-700 font-semibold text-sm">
          {errorMsg ?? "Hubo un error."} Revisá los datos y probá de nuevo.
        </p>
      )}
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1">
        {label} {required && "*"}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-primary"
      />
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}
