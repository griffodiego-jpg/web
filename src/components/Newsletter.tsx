"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <aside className="bg-primary py-8">
      <div className="container grid place-items-center grid-cols-1 lg:grid-cols-2 gap-6 lg:!px-20">
        <div>
          <h2 className="text-white text-xl font-bold text-center lg:text-left">
            Newsletter
          </h2>
          <p className="text-white text-center lg:text-left max-w-[400px]">
            Suscribite a nuestro Newsletter para que estés informado de nuevos
            productos y promociones.
          </p>
        </div>
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2.5 flex-wrap w-full"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="rounded-xl px-5 py-2 bg-white flex-1 min-w-[200px] text-black"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="uppercase bg-black text-white rounded-xl px-6 py-2 font-semibold hover:bg-black/80 transition disabled:opacity-60 cursor-pointer"
          >
            {status === "loading" ? "Enviando..." : "Suscribirme"}
          </button>
          {status === "ok" && (
            <p className="w-full text-white text-sm">¡Gracias por suscribirte!</p>
          )}
          {status === "error" && (
            <p className="w-full text-white text-sm">
              Hubo un error. Probá de nuevo.
            </p>
          )}
        </form>
      </div>
    </aside>
  );
}
