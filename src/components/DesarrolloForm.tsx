"use client";

import { useState, useRef } from "react";

type Status = "idle" | "loading" | "ok" | "error";

const INDUSTRIAS = [
  "Alimenticia",
  "Petrolera",
  "Electrodomésticos",
  "Autopartista",
  "Construcción",
  "Minería",
  "Otra",
];

const CANTIDADES = [
  "Baja producción (hasta 500 unidades)",
  "Media producción (500 a 5.000)",
  "Alta producción (más de 5.000)",
  "No sé todavía",
];

export function DesarrolloForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/desarrollo", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      formRef.current?.reset();
      setFileName("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="bg-white rounded-lg shadow-lg p-6 lg:p-8 space-y-5"
      encType="multipart/form-data"
    >
      <h3 className="text-xl font-black text-[#0a2b3d]">
        Contanos qué pieza necesitás
      </h3>
      <p className="text-sm text-gray-500">
        Completá el formulario y te asesoramos sin compromiso.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          name="nombre"
          placeholder="Nombre y Apellido *"
          required
        />
        <Field
          name="empresa"
          placeholder="Empresa *"
          required
        />
        <Field
          name="email"
          type="email"
          placeholder="Email *"
          required
        />
        <Field name="telefono" type="tel" placeholder="Teléfono" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="industria" className="sr-only">
            Industria
          </label>
          <select
            id="industria"
            name="industria"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>
              Industria *
            </option>
            {INDUSTRIAS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cantidad" className="sr-only">
            Cantidad estimada
          </label>
          <select
            id="cantidad"
            name="cantidad"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>
              Cantidad estimada
            </option>
            {CANTIDADES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="descripcion" className="sr-only">
          Descripción de la pieza
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          required
          rows={4}
          placeholder="Describí la pieza que necesitás: uso, material, dimensiones aproximadas, etc. *"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
        />
      </div>

      {/* Upload de plano o muestra */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          ¿Tenés plano o muestra? (imagen o PDF)
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition"
        >
          <input
            ref={fileRef}
            type="file"
            name="archivo"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setFileName(file ? file.name : "");
            }}
          />
          {fileName ? (
            <p className="text-sm text-primary font-semibold">
              📎 {fileName}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (fileRef.current) fileRef.current.value = "";
                  setFileName("");
                }}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </p>
          ) : (
            <div className="text-gray-400">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mx-auto mb-1"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <p className="text-sm">
                Click para adjuntar imagen o PDF
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Máximo 5 MB
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full sm:w-auto px-10 py-3 uppercase bg-primary text-white font-bold rounded-full border border-primary hover:bg-white hover:text-primary transition disabled:opacity-60 cursor-pointer"
      >
        {status === "loading" ? "Enviando..." : "Enviar consulta"}
      </button>

      {status === "ok" && (
        <p className="text-green-700 font-semibold">
          ¡Gracias! Recibimos tu consulta. Te contactamos a la brevedad.
        </p>
      )}
      {status === "error" && (
        <p className="text-red-700 font-semibold">
          Hubo un error. Probá de nuevo o escribinos por WhatsApp.
        </p>
      )}
    </form>
  );
}

function Field({
  name,
  placeholder,
  type = "text",
  required,
}: {
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="sr-only">
        {placeholder}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
