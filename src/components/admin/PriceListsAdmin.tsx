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
      <UploadForm knownCodes={knownClientCodes} />
      <ListsTable lists={lists} clientsByCode={clientsByCode} />
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

type SortKey = "code" | "uploadedAt" | "clientes";
type SortDir = "asc" | "desc";

function ListsTable({
  lists,
  clientsByCode,
}: {
  lists: PriceList[];
  clientsByCode: Record<string, number>;
}) {
  // Default: las más viejas arriba — así de un vistazo ves cuáles te
  // están quedando pendientes de actualizar.
  const [sortKey, setSortKey] = useState<SortKey>("uploadedAt");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // Nueva columna: arrancamos con el orden más útil para cada una.
      setSortDir(key === "code" ? "asc" : "desc");
    }
  }

  const sorted = [...lists].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "code") {
      cmp = a.code.localeCompare(b.code);
    } else if (sortKey === "uploadedAt") {
      cmp = Date.parse(a.uploadedAt) - Date.parse(b.uploadedAt);
    } else {
      cmp = (clientsByCode[a.code] ?? 0) - (clientsByCode[b.code] ?? 0);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

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
            <SortableHeader
              label="Código"
              active={sortKey === "code"}
              dir={sortDir}
              onClick={() => toggleSort("code")}
            />
            <th className="px-4 py-3 font-semibold">Nombre</th>
            <SortableHeader
              label="Subida"
              active={sortKey === "uploadedAt"}
              dir={sortDir}
              onClick={() => toggleSort("uploadedAt")}
            />
            <th className="px-4 py-3 font-semibold">Archivo</th>
            <SortableHeader
              label="Clientes"
              active={sortKey === "clientes"}
              dir={sortDir}
              onClick={() => toggleSort("clientes")}
              align="right"
            />
            <th className="px-4 py-3 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((l) => (
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
        <span className="text-gray-700 break-all">{list.filename}</span>
        {list.sizeBytes > 0 && (
          <span className="text-gray-500 ml-2">{formatBytes(list.sizeBytes)}</span>
        )}
      </td>
      <td className="px-4 py-3 text-right text-gray-700">{clientesCount}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-2">
            <a
              href={`/api/admin/listas-precios/download?code=${encodeURIComponent(list.code)}`}
              className="px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-700 hover:text-white border border-emerald-700 rounded inline-flex items-center gap-1"
              title="Descargar el archivo actual"
            >
              ↓ Descargar
            </a>
            <button
              type="button"
              onClick={notify}
              disabled={busy !== "none" || clientesCount === 0}
              className="px-2 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white border border-primary rounded disabled:opacity-40 disabled:cursor-not-allowed"
              title={clientesCount === 0 ? "Ningún cliente tiene este código" : `Mandar mail a ${clientesCount} cliente(s)`}
            >
              {busy === "notify" ? "…" : `Notificar`}
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

function SortableHeader({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right";
}) {
  const arrow = active ? (dir === "asc" ? "↑" : "↓") : "↕";
  return (
    <th
      className={`px-4 py-3 font-semibold ${align === "right" ? "text-right" : ""}`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 hover:text-[#0a2b3d] transition ${
          active ? "text-[#0a2b3d]" : ""
        }`}
        title={`Ordenar por ${label.toLowerCase()}`}
      >
        <span>{label}</span>
        <span
          className={`text-[10px] ${active ? "text-primary" : "text-gray-400"}`}
        >
          {arrow}
        </span>
      </button>
    </th>
  );
}
