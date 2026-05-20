"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PriceList } from "@/types/price-list";

export function PriceListsAdmin({
  lists,
  clientsByCode,
  knownClientCodes,
}: {
  lists: PriceList[];
  clientsByCode: Record<string, number>;
  knownClientCodes: string[];
}) {
  return (
    <div className="space-y-6">
      <CoverageTable
        knownClientCodes={knownClientCodes}
        clientsByCode={clientsByCode}
        lists={lists}
      />
      <UploadForm knownCodes={knownClientCodes} />
      <ListsTable lists={lists} clientsByCode={clientsByCode} />
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Cobertura: todos los códigos del ERP vs archivos subidos             */
/* -------------------------------------------------------------------- */

type SortKey = "code" | "clientes" | "fecha";

function CoverageTable({
  knownClientCodes,
  clientsByCode,
  lists,
}: {
  knownClientCodes: string[];
  clientsByCode: Record<string, number>;
  lists: PriceList[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("fecha");
  const [sortAsc, setSortAsc] = useState(false);

  if (knownClientCodes.length === 0) return null;

  const listsByCode = Object.fromEntries(lists.map((l) => [l.code, l]));

  type Row = {
    code: string;
    clientes: number;
    list: PriceList | null;
  };

  const rows: Row[] = knownClientCodes.map((code) => ({
    code,
    clientes: clientsByCode[code] ?? 0,
    list: listsByCode[code] ?? null,
  }));

  const sorted = [...rows].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "code") {
      cmp = a.code.localeCompare(b.code);
    } else if (sortKey === "clientes") {
      cmp = a.clientes - b.clientes;
    } else {
      // fecha: sin archivo va al final
      const da = a.list ? new Date(a.list.uploadedAt).getTime() : 0;
      const db = b.list ? new Date(b.list.uploadedAt).getTime() : 0;
      cmp = da - db;
    }
    return sortAsc ? cmp : -cmp;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(key === "code");
    }
  }

  const ok = rows.filter((r) => r.list).length;
  const total = rows.length;

  function Th({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    return (
      <th className="px-4 py-3 font-semibold">
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className={`flex items-center gap-1 hover:text-primary transition ${active ? "text-primary" : ""}`}
        >
          {label}
          <span className="text-[10px]">{active ? (sortAsc ? "▲" : "▼") : "↕"}</span>
        </button>
      </th>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#0a2b3d]">
            Cobertura de listas
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Todos los códigos activos en el ERP y si tienen archivo subido.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 shrink-0">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-emerald-700 font-bold">
            ✓ {ok} OK
          </span>
          {total - ok > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-red-700 font-bold">
              ✗ {total - ok} falta
            </span>
          )}
        </div>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
          <tr>
            <Th label="Código ERP" k="code" />
            <Th label="Clientes" k="clientes" />
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Archivo</th>
            <Th label="Fecha de subida" k="fecha" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((row) => (
            <tr key={row.code} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono font-bold text-[#0a2b3d]">
                {row.code}
              </td>
              <td className="px-4 py-3 text-gray-700 tabular-nums">
                {row.clientes}
              </td>
              <td className="px-4 py-3">
                {row.list ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                    ✓ OK
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
                    ✗ Falta lista
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">
                {row.list ? (
                  <a
                    href={row.list.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {row.list.name}
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                {row.list ? (
                  new Date(row.list.uploadedAt).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Form de subida                                                       */
/* -------------------------------------------------------------------- */

function UploadForm({ knownCodes }: { knownCodes: string[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    if (!file) {
      setError("Seleccioná un archivo.");
      return;
    }
    if (!code.trim()) {
      setError("Indicá el código de la lista (ej. LISTA3).");
      return;
    }
    if (!name.trim()) {
      setError("Ponele un nombre a la lista.");
      return;
    }

    setSubmitting(true);
    try {
      const upCode = code.trim().toUpperCase();
      const payload = JSON.stringify({ code: upCode, name: name.trim(), note });
      const blob = await upload(
        `listas-precios/${upCode}/${file.name}`,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/admin/listas-precios/upload",
          clientPayload: payload,
        },
      );
      // Fallback idempotente — si onUploadCompleted no llegó en
      // preview, este POST guarda igual la metadata.
      await fetch("/api/admin/listas-precios/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: upCode,
          name: name.trim(),
          note,
          fileUrl: blob.url,
          filename: file.name,
          sizeBytes: file.size,
        }),
      });
      setOkMsg(`Lista ${upCode} subida (${formatBytes(file.size)}).`);
      setCode("");
      setName("");
      setNote("");
      setFile(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-gray-200 rounded-xl p-5 space-y-4"
    >
      <h2 className="font-black text-[#0a2b3d]">Subir nueva lista</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#0a2b3d] mb-1 uppercase tracking-wider">
            Código *
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            list="known-codes"
            placeholder="LISTA3"
            required
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-mono uppercase bg-white"
          />
          <datalist id="known-codes">
            {knownCodes.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <p className="text-[10px] text-gray-500 mt-1">
            Tiene que coincidir con el{" "}
            <code className="bg-gray-100 px-1">priceListCode</code> del
            cliente en Bejerman. Autocomplete con los que ya están cargados.
          </p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-[#0a2b3d] mb-1 uppercase tracking-wider">
            Nombre *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Lista Mayoristas — Mayo 2026"
            required
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#0a2b3d] mb-1 uppercase tracking-wider">
          Nota (opcional)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej: ajuste por inflación de abril"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#0a2b3d] mb-1 uppercase tracking-wider">
          Archivo (XLSX / XLS / PDF / CSV) *
        </label>
        <input
          type="file"
          accept=".xlsx,.xls,.pdf,.csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-primary-dark"
        />
        {file && (
          <p className="text-[11px] text-gray-600 mt-1">
            {file.name} · {formatBytes(file.size)}
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
      {okMsg && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 font-semibold">
          ✓ {okMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Subiendo…" : "Subir lista"}
      </button>
    </form>
  );
}

/* -------------------------------------------------------------------- */
/* Tabla de listas existentes                                           */
/* -------------------------------------------------------------------- */

function ListsTable({
  lists,
  clientsByCode,
}: {
  lists: PriceList[];
  clientsByCode: Record<string, number>;
}) {
  if (lists.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <p className="text-[#0a2b3d] font-bold">No hay listas cargadas.</p>
        <p className="text-sm text-gray-600 mt-1">
          Subí la primera desde el formulario de arriba.
        </p>
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {lists.length} lista{lists.length === 1 ? "" : "s"} cargada{lists.length === 1 ? "" : "s"}
        </p>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Código</th>
            <th className="px-4 py-3 font-semibold">Nombre</th>
            <th className="px-4 py-3 font-semibold">Actualizada</th>
            <th className="px-4 py-3 font-semibold">Archivo</th>
            <th className="px-4 py-3 font-semibold text-right">Clientes</th>
            <th className="px-4 py-3 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {lists.map((l) => (
            <ListRow
              key={l.id}
              list={l}
              clientesCount={clientsByCode[l.code] ?? 0}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListRow({
  list,
  clientesCount,
}: {
  list: PriceList;
  clientesCount: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"none" | "notify" | "delete">("none");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function notify() {
    if (!confirm(`Mandar mail a los ${clientesCount} cliente(s) con código ${list.code}?`)) return;
    setBusy("notify");
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/admin/listas-precios/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: list.code }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        sent?: number;
        failed?: number;
        error?: string;
      };
      if (!res.ok || !data.ok) throw new Error(data.error ?? `Error ${res.status}`);
      setMsg(`Enviados ${data.sent} · Fallidos ${data.failed ?? 0}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy("none");
    }
  }

  async function remove() {
    if (!confirm(`Borrar la lista ${list.code}? Esta acción no elimina el archivo del Blob, sólo la asignación.`)) return;
    setBusy("delete");
    setErr(null);
    try {
      const res = await fetch("/api/admin/listas-precios/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: list.code }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? `Error ${res.status}`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
      setBusy("none");
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 font-mono font-bold text-primary">{list.code}</td>
      <td className="px-4 py-3">
        <p className="font-semibold text-[#0a2b3d]">{list.name}</p>
        {list.note && (
          <p className="text-xs text-gray-600">{list.note}</p>
        )}
      </td>
      <td className="px-4 py-3 text-gray-700 text-xs whitespace-nowrap">
        {new Date(list.uploadedAt).toLocaleString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="px-4 py-3 text-xs">
        <a
          href={list.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all"
        >
          {list.filename}
        </a>
        {list.sizeBytes > 0 && (
          <span className="text-gray-500 ml-2">{formatBytes(list.sizeBytes)}</span>
        )}
      </td>
      <td className="px-4 py-3 text-right text-gray-700">{clientesCount}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={notify}
              disabled={busy !== "none" || clientesCount === 0}
              className="px-2 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white border border-primary rounded disabled:opacity-40 disabled:cursor-not-allowed"
              title={clientesCount === 0 ? "Ningún cliente tiene este código" : `Mandar mail a ${clientesCount} cliente(s)`}
            >
              {busy === "notify" ? "…" : `📧 Notificar`}
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={busy !== "none"}
              className="px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white border border-red-600 rounded disabled:opacity-40"
            >
              {busy === "delete" ? "…" : "Borrar"}
            </button>
          </div>
          {msg && (
            <span className="text-[10px] text-emerald-700 font-semibold">
              {msg}
            </span>
          )}
          {err && (
            <span className="text-[10px] text-red-700 font-semibold">{err}</span>
          )}
        </div>
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------- */
/* Helpers                                                              */
/* -------------------------------------------------------------------- */

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
