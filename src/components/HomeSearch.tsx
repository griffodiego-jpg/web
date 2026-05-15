"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { VehicleTree } from "@/lib/catalog/utils";

type Tab = "palabra" | "patente" | "vehiculo" | "codigo" | "medidas";

const TABS: { id: Tab; label: string }[] = [
  { id: "palabra", label: "Palabra" },
  { id: "patente", label: "Patente" },
  { id: "vehiculo", label: "Vehículo" },
  { id: "codigo", label: "Código" },
  { id: "medidas", label: "Medidas" },
];

export function HomeSearch({ vehicleTree }: { vehicleTree: VehicleTree }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("palabra");

  // Palabra
  const [palabra, setPalabra] = useState("");

  // Patente
  const [patente, setPatente] = useState("");

  // Vehículo
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");

  // Código
  const [codigo, setCodigo] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const modelos = marca ? (vehicleTree.modelsByBrand[marca] ?? []) : [];
  const anios =
    marca && modelo
      ? (vehicleTree.yearsByBrandModel[`${marca}|${modelo}`] ?? [])
      : [];

  function handleSearch() {
    const params = new URLSearchParams();
    params.set("tab", tab);

    if (tab === "palabra" && palabra.trim()) {
      params.set("q", palabra.trim());
    } else if (tab === "patente" && patente.trim()) {
      params.set("p", patente.trim().toUpperCase());
    } else if (tab === "vehiculo") {
      if (marca) params.set("b", marca);
      if (modelo) params.set("m", modelo);
      if (anio) params.set("y", anio);
    } else if (tab === "codigo" && codigo.trim()) {
      params.set("c", codigo.trim());
    }

    router.push(`/catalogo?${params.toString()}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  function switchTab(t: Tab) {
    if (t === "medidas") {
      router.push("/catalogo?tab=medidas");
      return;
    }
    setTab(t);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto max-w-4xl px-4 py-6">
        {/* Tabs */}
        <div className="flex justify-center gap-1 mb-4 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                tab === t.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="flex gap-2 items-end justify-center">
          {tab === "palabra" && (
            <input
              ref={inputRef}
              type="text"
              value={palabra}
              onChange={(e) => setPalabra(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscá por marca, modelo, código, categoría…"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              autoFocus
            />
          )}

          {tab === "patente" && (
            <input
              ref={inputRef}
              type="text"
              value={patente}
              onChange={(e) => setPatente(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Ej: AC923HI"
              maxLength={8}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          )}

          {tab === "vehiculo" && (
            <div className="flex gap-2 flex-1 flex-wrap">
              <select
                value={marca}
                onChange={(e) => { setMarca(e.target.value); setModelo(""); setAnio(""); }}
                className="flex-1 min-w-[130px] border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Marca</option>
                {vehicleTree.brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <select
                value={modelo}
                onChange={(e) => { setModelo(e.target.value); setAnio(""); }}
                disabled={!marca}
                className="flex-1 min-w-[130px] border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
              >
                <option value="">Modelo</option>
                {modelos.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                disabled={!modelo}
                className="w-28 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
              >
                <option value="">Año</option>
                {anios.map((a) => (
                  <option key={a} value={String(a)}>{a}</option>
                ))}
              </select>
            </div>
          )}

          {tab === "codigo" && (
            <input
              ref={inputRef}
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej: 076-35"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          )}

          <button
            onClick={handleSearch}
            className="shrink-0 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition"
          >
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}
