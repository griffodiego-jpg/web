"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "ok" | "error";

type FormData = {
  serial: string;
  buying_date: string;
  buying_place: string;
  name: string;
  company: string;
  place: string;
  country: string;
  province: string;
  city: string;
  email: string;
  phone: string;
  subscribe: boolean;
};

const INITIAL: FormData = {
  serial: "",
  buying_date: "",
  buying_place: "",
  name: "",
  company: "",
  place: "",
  country: "",
  province: "",
  city: "",
  email: "",
  phone: "",
  subscribe: false,
};

export function GarantiaForm() {
  const [data, setData] = useState<FormData>(INITIAL);
  const [status, setStatus] = useState<Status>("idle");

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/garantia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      setData(INITIAL);
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      id="guarantee"
      onSubmit={onSubmit}
      className="py-10 px-5 bg-primary/10 rounded grid place-items-start lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5"
    >
      <Field
        id="serial"
        placeholder="Número de serie *"
        value={data.serial}
        onChange={(v) => update("serial", v)}
        required
      />
      <Field
        id="buying_date"
        type="date"
        placeholder="Fecha de compra *"
        value={data.buying_date}
        onChange={(v) => update("buying_date", v)}
        required
      />
      <Field
        id="buying_place"
        placeholder="Lugar de compra *"
        value={data.buying_place}
        onChange={(v) => update("buying_place", v)}
        required
      />
      <Field
        id="name"
        placeholder="Nombre y Apellido *"
        value={data.name}
        onChange={(v) => update("name", v)}
        required
      />
      <Field
        id="company"
        placeholder="Empresa *"
        value={data.company}
        onChange={(v) => update("company", v)}
        required
      />
      <Field
        id="place"
        placeholder="Domicilio *"
        value={data.place}
        onChange={(v) => update("place", v)}
        required
      />
      <Field
        id="country"
        placeholder="País *"
        value={data.country}
        onChange={(v) => update("country", v)}
        required
      />
      <Field
        id="province"
        placeholder="Provincia *"
        value={data.province}
        onChange={(v) => update("province", v)}
        required
      />
      <Field
        id="city"
        placeholder="Ciudad *"
        value={data.city}
        onChange={(v) => update("city", v)}
        required
      />
      <Field
        id="email"
        type="email"
        placeholder="E-mail *"
        value={data.email}
        onChange={(v) => update("email", v)}
        required
      />
      <Field
        id="phone"
        placeholder="Teléfono *"
        value={data.phone}
        onChange={(v) => update("phone", v)}
        required
      />

      <small className="w-full block lg:col-span-3 md:col-span-2 text-gray-600">
        Los campos marcados con (*) son obligatorios
      </small>

      <label
        htmlFor="subscribe"
        className="flex items-center gap-2 w-full lg:col-span-3 md:col-span-2 text-sm cursor-pointer"
      >
        <input
          type="checkbox"
          name="subscribe"
          id="subscribe"
          checked={data.subscribe}
          onChange={(e) => update("subscribe", e.target.checked)}
          className="accent-primary w-4 h-4"
        />
        Deseo recibir información sobre productos, lanzamientos y promociones.
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="uppercase text-center bg-black text-white rounded-full px-10 py-2.5 cursor-pointer border border-black hover:bg-white hover:text-black mx-auto lg:w-fit w-full lg:col-span-3 md:col-span-2 transition-all duration-300 font-bold disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Enviando..." : "Enviar"}
      </button>

      {status === "ok" && (
        <p className="lg:col-span-3 md:col-span-2 text-green-700 font-semibold">
          ¡Gracias! Tu registro fue enviado correctamente.
        </p>
      )}
      {status === "error" && (
        <p className="lg:col-span-3 md:col-span-2 text-red-700 font-semibold">
          Hubo un error. Probá de nuevo en unos minutos.
        </p>
      )}
    </form>
  );
}

function Field({
  id,
  placeholder,
  type = "text",
  value,
  onChange,
  required,
}: {
  id: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="bg-white rounded-full p-2 pl-5 w-full focus:outline-primary border border-gray-200"
      />
    </div>
  );
}
