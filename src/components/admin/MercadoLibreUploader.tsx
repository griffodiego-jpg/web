"use client";

import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";

type ProductoML = {
  codigo: string;
  link: string | null;
  /** Links adicionales descartados para este código (se quedó el primero). */
  linksAdicionales: string[];
};

type ParsedResult = {
  productos: ProductoML[];
  totalFilas: number;
  filasIgnoradas: number;
  headerCodigo: string | null;
  headerLink: string | null;
};

type Filtro = "todos" | "con-link" | "sin-link" | "duplicados";

const CODIGO_HEADERS = [
  "codigo",
  "código",
  "sku",
  "code",
  "cod",
  "articulo",
  "artículo",
  "item",
];
const LINK_HEADERS = [
  "link",
  "url",
  "mercadolibre",
  "mercado libre",
  "ml",
  "publicacion",
  "publicación",
  "enlace",
];

function normalize(s: string): string {
  return s
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function detectHeader(
  headers: string[],
  candidates: string[],
): { original: string; index: number } | null {
  for (let i = 0; i < headers.length; i++) {
    const h = normalize(headers[i]);
    if (!h) continue;
    for (const c of candidates) {
      if (h === c || h.includes(c)) return { original: headers[i], index: i };
    }
  }
  return null;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === "," || ch === ";") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

function procesar(rows: string[][]): ParsedResult {
  if (rows.length < 2) {
    return {
      productos: [],
      totalFilas: 0,
      filasIgnoradas: 0,
      headerCodigo: null,
      headerLink: null,
    };
  }

  const headers = rows[0].map((h) => String(h ?? "").trim());
  const codigoCol = detectHeader(headers, CODIGO_HEADERS);
  const linkCol = detectHeader(headers, LINK_HEADERS);

  if (!codigoCol) {
    return {
      productos: [],
      totalFilas: rows.length - 1,
      filasIgnoradas: rows.length - 1,
      headerCodigo: null,
      headerLink: linkCol?.original ?? null,
    };
  }

  const byCodigo = new Map<string, ProductoML>();
  let filasIgnoradas = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const codigo = String(row[codigoCol.index] ?? "").trim();
    if (!codigo) {
      filasIgnoradas++;
      continue;
    }
    const rawLink = linkCol ? String(row[linkCol.index] ?? "").trim() : "";
    const link = rawLink && /^https?:\/\//i.test(rawLink) ? rawLink : null;

    const existing = byCodigo.get(codigo);
    if (existing) {
      if (link && existing.link && link !== existing.link) {
        existing.linksAdicionales.push(link);
      } else if (link && !existing.link) {
        existing.link = link;
      }
    } else {
      byCodigo.set(codigo, { codigo, link, linksAdicionales: [] });
    }
  }

  return {
    productos: Array.from(byCodigo.values()),
    totalFilas: rows.length - 1,
    filasIgnoradas,
    headerCodigo: codigoCol.original,
    headerLink: linkCol?.original ?? null,
  };
}

export function MercadoLibreUploader() {
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function procesarArchivo(file: File) {
    setError("");
    setFilename(file.name);
    try {
      const ext = file.name.toLowerCase().split(".").pop();
      let rows: string[][];
      if (ext === "csv" || ext === "txt") {
        const text = await file.text();
        rows = parseCSV(text);
      } else if (ext === "xlsx" || ext === "xls") {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json<string[]>(ws, {
          header: 1,
          defval: "",
          raw: false,
        });
      } else {
        setError(`Formato no soportado: .${ext}. Usá .xlsx, .xls o .csv.`);
        return;
      }
      const parsed = procesar(rows);
      if (!parsed.headerCodigo) {
        setError(
          "No se pudo detectar la columna de código. Asegurate de que una columna se llame 'Código', 'SKU' o similar.",
        );
      }
      setResult(parsed);
    } catch (e) {
      setError(`Error al leer el archivo: ${(e as Error).message}`);
    }
  }

  const productosFiltrados = useMemo(() => {
    if (!result) return [];
    const q = normalize(busqueda);
    return result.productos.filter((p) => {
      if (filtro === "con-link" && !p.link) return false;
      if (filtro === "sin-link" && p.link) return false;
      if (filtro === "duplicados" && p.linksAdicionales.length === 0) return false;
      if (q && !normalize(p.codigo).includes(q)) return false;
      return true;
    });
  }, [result, filtro, busqueda]);

  function descargarJSON() {
    if (!result) return;
    const data = result.productos.map((p) => ({
      codigo: p.codigo,
      link: p.link,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "productos-mercadolibre.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function copiarTypeScript() {
    if (!result) return;
    const lines = result.productos.map(
      (p) =>
        `  { codigo: ${JSON.stringify(p.codigo)}, link: ${
          p.link ? JSON.stringify(p.link) : "null"
        } },`,
    );
    const code = `export const productosMercadoLibre: { codigo: string; link: string | null }[] = [\n${lines.join(
      "\n",
    )}\n];\n`;
    navigator.clipboard.writeText(code);
  }

  const stats = result
    ? {
        total: result.productos.length,
        conLink: result.productos.filter((p) => p.link).length,
        sinLink: result.productos.filter((p) => !p.link).length,
        duplicados: result.productos.filter(
          (p) => p.linksAdicionales.length > 0,
        ).length,
      }
    : null;

  return (
    <div className="flex flex-col gap-6">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) procesarArchivo(f);
        }}
        className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-gray-300 bg-white hover:border-primary hover:bg-gray-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) procesarArchivo(f);
          }}
        />
        <svg
          className="mx-auto mb-3 text-gray-400"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-sm font-semibold text-[#0a2b3d]">
          {filename || "Arrastrá el Excel acá o hacé click para elegirlo"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Formatos aceptados: .xlsx, .xls, .csv
        </p>
      </label>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {result && stats && (
        <>
          {(result.headerCodigo || result.headerLink) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
              <strong>Columnas detectadas:</strong>{" "}
              {result.headerCodigo && (
                <>
                  código →{" "}
                  <code className="bg-white px-1.5 py-0.5 rounded">
                    {result.headerCodigo}
                  </code>
                </>
              )}
              {result.headerLink && (
                <>
                  {" · "}link →{" "}
                  <code className="bg-white px-1.5 py-0.5 rounded">
                    {result.headerLink}
                  </code>
                </>
              )}
              {!result.headerLink && (
                <span className="text-amber-700">
                  {" · "}no se detectó columna de link.
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Productos únicos" value={stats.total} />
            <StatCard label="Con link" value={stats.conLink} tone="ok" />
            <StatCard label="Sin link" value={stats.sinLink} tone="warn" />
            <StatCard
              label="Con links descartados"
              value={stats.duplicados}
              tone="muted"
              hint="códigos con más de un link — se quedó el primero"
            />
          </div>

          {result.filasIgnoradas > 0 && (
            <p className="text-xs text-gray-500 -mt-2">
              {result.filasIgnoradas} fila
              {result.filasIgnoradas === 1 ? "" : "s"} sin código ignorada
              {result.filasIgnoradas === 1 ? "" : "s"} del total de{" "}
              {result.totalFilas}.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={descargarJSON}
              className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition cursor-pointer"
            >
              Descargar JSON
            </button>
            <button
              onClick={copiarTypeScript}
              className="px-4 py-2 bg-white border border-gray-300 text-[#0a2b3d] text-sm font-bold rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              Copiar como TypeScript
            </button>
            <button
              onClick={() => {
                setResult(null);
                setFilename("");
                setError("");
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              Limpiar
            </button>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <FiltroBtn
                activo={filtro === "todos"}
                onClick={() => setFiltro("todos")}
                label="Todos"
                count={stats.total}
              />
              <FiltroBtn
                activo={filtro === "con-link"}
                onClick={() => setFiltro("con-link")}
                label="Con link"
                count={stats.conLink}
              />
              <FiltroBtn
                activo={filtro === "sin-link"}
                onClick={() => setFiltro("sin-link")}
                label="Sin link"
                count={stats.sinLink}
                tone="warn"
              />
              <FiltroBtn
                activo={filtro === "duplicados"}
                onClick={() => setFiltro("duplicados")}
                label="Con descartados"
                count={stats.duplicados}
              />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar código…"
                className="ml-auto px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
              />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-3 font-bold text-gray-700">
                        Código
                      </th>
                      <th className="text-left px-4 py-3 font-bold text-gray-700">
                        Link de Mercado Libre
                      </th>
                      <th className="text-right px-4 py-3 font-bold text-gray-700 w-32">
                        Descartados
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productosFiltrados.map((p) => (
                      <tr key={p.codigo} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2.5 font-mono text-xs font-semibold text-[#0a2b3d]">
                          {p.codigo}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">
                          {p.link ? (
                            <a
                              href={p.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline break-all"
                            >
                              {p.link}
                            </a>
                          ) : (
                            <span className="inline-block text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                              sin link
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs text-gray-400">
                          {p.linksAdicionales.length > 0
                            ? `+${p.linksAdicionales.length}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                    {productosFiltrados.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-sm text-gray-400"
                        >
                          No hay productos que coincidan con este filtro.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
  hint,
}: {
  label: string;
  value: number;
  tone?: "default" | "ok" | "warn" | "muted";
  hint?: string;
}) {
  const colors = {
    default: "text-[#0a2b3d]",
    ok: "text-emerald-600",
    warn: "text-amber-600",
    muted: "text-gray-500",
  };
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className={`text-3xl font-black ${colors[tone]}`}>{value}</div>
      <div className="text-xs font-semibold text-gray-600 mt-1 uppercase tracking-wide">
        {label}
      </div>
      {hint && <div className="text-[11px] text-gray-400 mt-0.5">{hint}</div>}
    </div>
  );
}

function FiltroBtn({
  activo,
  onClick,
  label,
  count,
  tone,
}: {
  activo: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: "warn";
}) {
  const base =
    "px-3 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer border";
  const activeCls =
    tone === "warn"
      ? "bg-amber-500 text-white border-amber-500"
      : "bg-primary text-white border-primary";
  const idleCls = "bg-white text-gray-700 border-gray-300 hover:bg-gray-50";
  return (
    <button
      onClick={onClick}
      className={`${base} ${activo ? activeCls : idleCls}`}
    >
      {label}{" "}
      <span className={activo ? "opacity-80" : "text-gray-400"}>({count})</span>
    </button>
  );
}
