"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "ok" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Hubo un error");
      }
      setStatus("ok");
      setData({ nombre: "", email: "", telefono: "", mensaje: "" });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Hubo un error");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-semibold mb-1">
          Nombre *
        </label>
        <input
          id="nombre"
          type="text"
          required
          value={data.nombre}
          onChange={(e) => setData((d) => ({ ...d, nombre: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-1">
          Email *
        </label>
        <input
          id="email"
          type="email"
          required
          value={data.email}
          onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label htmlFor="telefono" className="block text-sm font-semibold mb-1">
          Teléfono
        </label>
        <input
          id="telefono"
          type="tel"
          value={data.telefono}
          onChange={(e) => setData((d) => ({ ...d, telefono: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label htmlFor="mensaje" className="block text-sm font-semibold mb-1">
          Mensaje *
        </label>
        <textarea
          id="mensaje"
          required
          rows={5}
          value={data.mensaje}
          onChange={(e) => setData((d) => ({ ...d, mensaje: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-primary resize-y"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="uppercase bg-primary text-white rounded-full px-8 py-2.5 font-bold hover:bg-primary-dark transition disabled:opacity-60 cursor-pointer"
      >
        {status === "loading" ? "Enviando..." : "Enviar consulta"}
      </button>
      {status === "ok" && (
        <p className="text-green-700 font-semibold">
          ¡Gracias! Te vamos a responder a la brevedad.
        </p>
      )}
      {status === "error" && (
        <p className="text-red-700 font-semibold">
          {errorMsg ?? "Hubo un error."} Revisá los datos y probá de nuevo.
        </p>
      )}
    </form>
  );
}
