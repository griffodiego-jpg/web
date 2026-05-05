"use client";

import { useMemo, useState } from "react";
import type {
  ContactoLead,
  DescargaLead,
  DesarrolloLead,
  GarantiaLead,
  Lead,
  LeadKind,
  NewsletterLead,
  ReporteErrorLead,
  SugerenciaLead,
} from "@/lib/leads";

type Props = {
  initialTab: LeadKind;
  leads: {
    contacto: Lead[];
    newsletter: Lead[];
    descarga: Lead[];
    garantia: Lead[];
    sugerencia: Lead[];
    desarrollo: Lead[];
    reporte_error: Lead[];
  };
  counts: {
    contacto: number;
    newsletter: number;
    descarga: number;
    garantia: number;
    sugerencia: number;
    desarrollo: number;
    reporte_error: number;
  };
};

const TABS: { id: LeadKind; label: string }[] = [
  { id: "sugerencia", label: "Sugerencias" },
  { id: "reporte_error", label: "Reportes de error" },
  { id: "descarga", label: "Descargas" },
  { id: "garantia", label: "Garantía" },
  { id: "contacto", label: "Contacto" },
  { id: "newsletter", label: "Newsletter" },
  { id: "desarrollo", label: "Desarrollo" },
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
          {tab === "garantia" && (
            <GarantiaTable items={filtered as GarantiaLead[]} />
          )}
          {tab === "contacto" && (
            <ContactoTable items={filtered as ContactoLead[]} />
          )}
          {tab === "newsletter" && (
            <NewsletterTable items={filtered as NewsletterLead[]} />
          )}
          {tab === "sugerencia" && (
            <SugerenciaTable items={filtered as SugerenciaLead[]} />
          )}
          {tab === "desarrollo" && (
            <DesarrolloTable items={filtered as DesarrolloLead[]} />
          )}
          {tab === "reporte_error" && (
            <ReporteErrorTable items={filtered as ReporteErrorLead[]} />
          )}
        </div>
      )}
    </div>
  );
}

const TIPO_ERROR_LABEL: Record<ReporteErrorLead["tipoError"], string> = {
  foto: "Foto",
  vehiculos: "Vehículos",
  medidas: "Medidas",
  descripcion: "Descripción",
  otro: "Otro",
};

function ReporteErrorTable({ items }: { items: ReporteErrorLead[] }) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
        <tr>
          <th className="px-4 py-3">Fecha</th>
          <th className="px-4 py-3">Producto</th>
          <th className="px-4 py-3">Tipo</th>
          <th className="px-4 py-3">Detalle</th>
          <th className="px-4 py-3">Contacto</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((it, i) => (
          <tr key={i} className="align-top">
            <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
              {new Date(it.ts).toLocaleString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </td>
            <td className="px-4 py-3">
              <div className="font-mono font-bold text-[#0a2b3d]">
                {it.productoCode}
              </div>
              {it.productoUrl ? (
                <a
                  href={it.productoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline hover:text-primary/80"
                >
                  Abrir página ↗
                </a>
              ) : null}
            </td>
            <td className="whitespace-nowrap px-4 py-3">
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                {TIPO_ERROR_LABEL[it.tipoError]}
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-700">
              <div className="max-w-md whitespace-pre-wrap">{it.detalle}</div>
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-xs">
              {it.email ? (
                <div>
                  <a
                    href={`mailto:${it.email}`}
                    className="text-primary hover:underline"
                  >
                    {it.email}
                  </a>
                </div>
              ) : null}
              {it.celular ? <div className="text-gray-700">{it.celular}</div> : null}
              {!it.email && !it.celular ? (
                <span className="text-gray-400">Anónimo</span>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SugerenciaTable({ items }: { items: SugerenciaLead[] }) {
  const LINEA_LABELS: Record<string, string> = {
    suspension: "Suspensión",
    direccion: "Dirección",
    transmision: "Transmisión",
    otro: "Otro",
  };
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
        <tr>
          <Th>Fecha</Th>
          <Th>Foto</Th>
          <Th>Producto</Th>
          <Th>Vehículo</Th>
          <Th>Línea</Th>
          <Th>Lado</Th>
          <Th>Medidas</Th>
          <Th>OEM</Th>
          <Th>Perfil</Th>
          <Th>Email</Th>
          <Th>Celular</Th>
          <Th>Búsqueda</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((l) => {
          const vehiculo = [l.marcaVehiculo, l.modeloVehiculo, l.anioVehiculo]
            .filter(Boolean)
            .join(" ");
          const linea = l.linea ? LINEA_LABELS[l.linea] ?? l.linea : "—";
          // Compat con leads v1/v2: si vienen con `contacto` (un solo campo)
          // y no hay email/celular nuevos, mostramos contacto en la columna
          // que parezca correcta — heurística simple por presencia de "@".
          const legacyContacto = l.contacto?.trim();
          const email =
            l.email?.trim() ||
            (legacyContacto?.includes("@") ? legacyContacto : "") ||
            "";
          const celular =
            l.celular?.trim() ||
            (legacyContacto && !legacyContacto.includes("@")
              ? legacyContacto
              : "") ||
            "";
          return (
            <tr key={`${l.ts}`} className="align-top hover:bg-gray-50">
              <Td>{formatDate(l.ts)}</Td>
              <Td>
                {l.fotoUrl ? (
                  <a
                    href={l.fotoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    title="Ver foto"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={l.fotoUrl}
                      alt="Foto"
                      className="h-14 w-14 rounded border border-gray-200 object-cover transition hover:opacity-80"
                    />
                  </a>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </Td>
              <Td>
                <div className="max-w-md whitespace-pre-wrap">{l.producto}</div>
              </Td>
              <Td>{vehiculo || "—"}</Td>
              <Td>{linea}</Td>
              <Td>{l.lado ?? "—"}</Td>
              <Td>{l.medidas ?? "—"}</Td>
              <Td>
                {l.oem ? <span className="font-mono text-xs">{l.oem}</span> : "—"}
              </Td>
              <Td>{l.perfil ?? "—"}</Td>
              <Td>
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="break-all text-primary hover:underline"
                  >
                    {email}
                  </a>
                ) : (
                  "—"
                )}
              </Td>
              <Td>
                {celular ? (
                  <span className="break-all">{celular}</span>
                ) : (
                  "—"
                )}
              </Td>
              <Td>
                {l.busqueda ? (
                  <span className="font-mono text-xs">{l.busqueda}</span>
                ) : (
                  "—"
                )}
                {l.tab ? (
                  <span className="ml-1 text-[10px] uppercase tracking-wide text-gray-400">
                    ({l.tab})
                  </span>
                ) : null}
              </Td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function DesarrolloTable({ items }: { items: DesarrolloLead[] }) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
        <tr>
          <Th>Fecha</Th>
          <Th>Empresa</Th>
          <Th>Nombre</Th>
          <Th>Email</Th>
          <Th>Teléfono</Th>
          <Th>Industria</Th>
          <Th>Cantidad</Th>
          <Th>Descripción</Th>
          <Th>Adjunto</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((it, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <Td>{formatDate(it.ts)}</Td>
            <Td>{it.empresa}</Td>
            <Td>{it.nombre}</Td>
            <Td>
              <a className="text-primary hover:underline" href={`mailto:${it.email}`}>
                {it.email}
              </a>
            </Td>
            <Td>{it.telefono}</Td>
            <Td>{it.industria}</Td>
            <Td>{it.cantidad}</Td>
            <Td>
              <span className="line-clamp-2 max-w-[280px] block">{it.descripcion}</span>
            </Td>
            <Td>{it.archivoNombre || "—"}</Td>
          </tr>
        ))}
      </tbody>
    </table>
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

function GarantiaTable({ items }: { items: GarantiaLead[] }) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
        <tr>
          <Th>Fecha</Th>
          <Th>Serie</Th>
          <Th>Compra</Th>
          <Th>Lugar compra</Th>
          <Th>Nombre</Th>
          <Th>Empresa</Th>
          <Th>Email</Th>
          <Th>Teléfono</Th>
          <Th>Ciudad / Provincia / País</Th>
          <Th>Newsletter</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((l) => (
          <tr key={`${l.ts}-${l.serial}`} className="hover:bg-gray-50">
            <Td>{formatDate(l.ts)}</Td>
            <Td>
              <span className="font-mono text-xs">{l.serial}</span>
            </Td>
            <Td>{l.buyingDate}</Td>
            <Td>{l.buyingPlace}</Td>
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
            <Td>
              {l.ciudad}, {l.provincia}, {l.pais}
            </Td>
            <Td>{l.subscribe ? "Sí" : "—"}</Td>
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
