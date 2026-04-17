"use client";

import { useMemo, useState } from "react";
import type {
  ContactoLead,
  DescargaLead,
  Lead,
  LeadKind,
  NewsletterLead,
} from "@/lib/leads";

type Props = {
  initialTab: LeadKind;
  leads: { contacto: Lead[]; newsletter: Lead[]; descarga: Lead[] };
  counts: { contacto: number; newsletter: number; descarga: number };
};

const TABS: { id: LeadKind; label: string }[] = [
  { id: "descarga", label: "Descargas" },
  { id: "contacto", label: "Contacto" },
  { id: "newsletter", label: "Newsletter" },
];

export function LeadsTabs({ initialTab, leads, counts }: Props) {
  const [tab, setTab] = useState<LeadKind>(initialTab);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const items = leads[tab];
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((l) => JSON.stringify(l).toLowerCase().includes(q));
  }, [tab, query, leads]);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setQuery("");
            }}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition cursor-pointer ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            <span className="ml-2 text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar: buscador + export */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Buscar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <a
          href={`/api/admin/leads/export?kind=${tab}`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark"
        >
          <DownloadIcon /> Exportar CSV
        </a>
        <p className="text-xs text-gray-400 ml-auto">
          {filtered.length} de {counts[tab]}
        </p>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
          Todavía no hay registros en esta sección.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          {tab === "descarga" && (
            <DescargasTable items={filtered as DescargaLead[]} />
          )}
          {tab === "contacto" && (
            <ContactoTable items={filtered as ContactoLead[]} />
          )}
          {tab === "newsletter" && (
            <NewsletterTable items={filtered as NewsletterLead[]} />
          )}
        </div>
      )}
    </div>
  );
}

function DescargasTable({ items }: { items: DescargaLead[] }) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
        <tr>
          <Th>Fecha</Th>
          <Th>Recurso</Th>
          <Th>Nombre</Th>
          <Th>Empresa</Th>
          <Th>Email</Th>
          <Th>Teléfono</Th>
          <Th>Compra a</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((l) => (
          <tr key={`${l.ts}-${l.email}`} className="hover:bg-gray-50">
            <Td>{formatDate(l.ts)}</Td>
            <Td>{l.recurso}</Td>
            <Td>{l.nombre}</Td>
            <Td>{l.empresa}</Td>
            <Td>
              <a
                href={`mailto:${l.email}`}
                className="text-primary hover:underline"
              >
                {l.email}
              </a>
            </Td>
            <Td>{l.telefono}</Td>
            <Td>{l.compraA}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ContactoTable({ items }: { items: ContactoLead[] }) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
        <tr>
          <Th>Fecha</Th>
          <Th>Nombre</Th>
          <Th>Email</Th>
          <Th>Teléfono</Th>
          <Th>Mensaje</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((l) => (
          <tr key={`${l.ts}-${l.email}`} className="hover:bg-gray-50 align-top">
            <Td>{formatDate(l.ts)}</Td>
            <Td>{l.nombre}</Td>
            <Td>
              <a
                href={`mailto:${l.email}`}
                className="text-primary hover:underline"
              >
                {l.email}
              </a>
            </Td>
            <Td>{l.telefono ?? "—"}</Td>
            <Td>
              <div className="max-w-md whitespace-pre-wrap">{l.mensaje}</div>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function NewsletterTable({ items }: { items: NewsletterLead[] }) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
        <tr>
          <Th>Fecha</Th>
          <Th>Email</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((l) => (
          <tr key={`${l.ts}-${l.email}`} className="hover:bg-gray-50">
            <Td>{formatDate(l.ts)}</Td>
            <Td>
              <a
                href={`mailto:${l.email}`}
                className="text-primary hover:underline"
              >
                {l.email}
              </a>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left font-bold">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-gray-800">{children}</td>;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DownloadIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
