"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Banner, BannerTipo } from "@/lib/banners-store";

type EditingBanner = Partial<Banner> & { tipo: BannerTipo };

/**
 * UI de admin para el carousel de banners del home.
 * Flujo: listado editable arriba + form de "Agregar banner" expandible.
 * Soporta drag-to-reorder (via HTML5 native drag), toggle activo, edit,
 * delete, y upload directo a Vercel Blob para tipo imagen/video.
 */
export function BannersAdmin({ initial }: { initial: Banner[] }) {
  const router = useRouter();
  const [banners, setBanners] = useState(initial);
  const [editing, setEditing] = useState<EditingBanner | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showSpecs, setShowSpecs] = useState(false);

  async function toggleActivo(b: Banner) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/banners/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: b.id, activo: !b.activo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setBanners((list) =>
        list.map((x) => (x.id === b.id ? { ...x, activo: !b.activo } : x))
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function deleteBanner(b: Banner) {
    if (!confirm(`¿Borrar el banner "${b.titulo || b.tipo}"?`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/banners/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: b.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setBanners((list) => list.filter((x) => x.id !== b.id));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function saveBanner(data: EditingBanner) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/banners/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Error");
      setEditing(null);
      // Recargamos la lista completa desde el server via router.refresh —
      // más simple que sincronizar state local.
      router.refresh();
      // Optimistic: también actualizamos la state local.
      if (data.id) {
        setBanners((list) =>
          list.map((x) => (x.id === data.id ? (j.banner as Banner) : x))
        );
      } else {
        setBanners((list) => [...list, j.banner as Banner]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function reorder(newList: Banner[]) {
    setBanners(newList); // Optimistic
    try {
      await fetch("/api/admin/banners/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: newList.map((b) => b.id) }),
      });
      router.refresh();
    } catch {
      // Rollback si falla.
      setBanners(initial);
    }
  }

  function handleDragStart(id: string) {
    setDraggingId(id);
  }
  function handleDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!draggingId || draggingId === overId) return;
    const newList = [...banners];
    const fromIdx = newList.findIndex((b) => b.id === draggingId);
    const toIdx = newList.findIndex((b) => b.id === overId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = newList.splice(fromIdx, 1);
    newList.splice(toIdx, 0, moved);
    setBanners(newList);
  }
  function handleDragEnd() {
    setDraggingId(null);
    reorder(banners);
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Especificaciones inline — panel expandible */}
      <SpecsPanel open={showSpecs} onToggle={() => setShowSpecs((v) => !v)} />

      {/* Lista de banners */}
      {banners.length === 0 && !editing ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <p className="text-sm text-gray-500">
            No hay banners cargados. El home muestra el buscador de patente
            por default.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {banners.map((b) => (
            <li
              key={b.id}
              draggable
              onDragStart={() => handleDragStart(b.id)}
              onDragOver={(e) => handleDragOver(e, b.id)}
              onDragEnd={handleDragEnd}
              className={`bg-white border rounded-lg p-3 flex flex-wrap items-center gap-3 cursor-move ${
                draggingId === b.id ? "opacity-50" : ""
              } ${b.activo ? "border-gray-200" : "border-gray-200 opacity-60"}`}
            >
              <span className="text-gray-300 text-lg select-none">⋮⋮</span>
              <BannerPreview b={b} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <TipoBadge tipo={b.tipo} />
                  {!b.activo && (
                    <span className="inline-flex rounded-full bg-gray-200 text-gray-600 px-2 py-0.5 text-[10px] font-bold uppercase">
                      Desactivado
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-[#0a2b3d] truncate">
                  {b.titulo || (b.tipo === "patente" ? "Buscador de patente" : "Sin título")}
                </p>
                {b.subtitulo && (
                  <p className="text-xs text-gray-500 truncate">{b.subtitulo}</p>
                )}
                {b.ctaHref && (
                  <p className="text-xs text-gray-400 truncate">
                    → {b.ctaText ?? "Ver"} ({b.ctaHref})
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleActivo(b)}
                  disabled={busy}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                >
                  {b.activo ? "Desactivar" : "Activar"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing({ ...b })}
                  disabled={busy}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => deleteBanner(b)}
                  disabled={busy}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer disabled:opacity-50"
                >
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Botón agregar */}
      {!editing && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing({ tipo: "imagen", activo: true })}
            className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-bold hover:bg-primary-dark transition cursor-pointer"
          >
            + Agregar imagen
          </button>
          <button
            type="button"
            onClick={() => setEditing({ tipo: "video", activo: true })}
            className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-bold hover:bg-primary-dark transition cursor-pointer"
          >
            + Agregar video
          </button>
          <button
            type="button"
            onClick={() =>
              saveBanner({ tipo: "patente", activo: true })
            }
            disabled={busy || banners.some((b) => b.tipo === "patente")}
            className="rounded-lg border border-primary text-primary px-4 py-2 text-sm font-bold hover:bg-primary hover:text-white transition cursor-pointer disabled:opacity-50"
          >
            + Agregar buscador de patente
          </button>
        </div>
      )}

      {/* Form de edición */}
      {editing && (
        <BannerForm
          banner={editing}
          busy={busy}
          onCancel={() => setEditing(null)}
          onSave={(data) => saveBanner(data)}
          setError={setError}
        />
      )}
    </div>
  );
}

/* ---------- subcomponentes ---------- */

function TipoBadge({ tipo }: { tipo: BannerTipo }) {
  const cfg = {
    imagen: { label: "Imagen", bg: "bg-blue-100", text: "text-blue-800" },
    video: { label: "Video", bg: "bg-purple-100", text: "text-purple-800" },
    patente: { label: "Buscador patente", bg: "bg-green-100", text: "text-green-800" },
  }[tipo];
  return (
    <span
      className={`inline-flex items-center rounded-full ${cfg.bg} ${cfg.text} px-2 py-0.5 text-[10px] font-black uppercase tracking-wider`}
    >
      {cfg.label}
    </span>
  );
}

function BannerPreview({ b }: { b: Banner }) {
  if (b.tipo === "patente") {
    return (
      <div className="w-16 h-10 shrink-0 bg-gradient-to-br from-primary to-primary-dark rounded flex items-center justify-center text-white text-[10px] font-bold">
        PATENTE
      </div>
    );
  }
  if (b.tipo === "video" && b.fileUrl) {
    return (
      /* eslint-disable-next-line jsx-a11y/media-has-caption */
      <video
        src={b.fileUrl}
        muted
        className="w-16 h-10 shrink-0 object-cover rounded bg-gray-100"
      />
    );
  }
  if (b.tipo === "imagen" && b.fileUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={b.fileUrl}
        alt=""
        className="w-16 h-10 shrink-0 object-cover rounded bg-gray-100"
      />
    );
  }
  return <div className="w-16 h-10 shrink-0 bg-gray-100 rounded" />;
}

function SpecsPanel({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer"
      >
        <span className="font-bold text-sm text-[#0a2b3d]">
          📐 Especificaciones requeridas (imagen y video)
        </span>
        <span className="text-gray-400 text-sm">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="border-t border-gray-200 p-4 space-y-4 text-sm">
          <div>
            <h4 className="font-bold text-[#0a2b3d] mb-1">📸 Imagen</h4>
            <ul className="text-gray-700 space-y-0.5">
              <li>
                <strong>Formato:</strong> JPG o WebP
              </li>
              <li>
                <strong>Dimensiones:</strong> 1920 × 800 px (ratio 2.4:1, cinemático)
              </li>
              <li>
                <strong>Peso máximo:</strong> 300 KB (usá TinyPNG o similar para comprimir)
              </li>
              <li>
                <strong>Área segura para texto:</strong> centro 60% — los costados se cortan en mobile
              </li>
              <li>
                <strong>Modo color:</strong> RGB (no CMYK)
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#0a2b3d] mb-1">🎥 Video</h4>
            <ul className="text-gray-700 space-y-0.5">
              <li>
                <strong>Formato:</strong> MP4 (codec H.264)
              </li>
              <li>
                <strong>Dimensiones:</strong> 1920 × 800 px (ratio 2.4:1)
              </li>
              <li>
                <strong>Duración:</strong> 8 a 15 segundos (ideal 12s)
              </li>
              <li>
                <strong>Peso máximo:</strong> 2 MB (en Premiere usá preset &quot;Web&quot;)
              </li>
              <li>
                <strong>Audio:</strong> sin audio — los banners en autoplay van muted
              </li>
              <li>
                <strong>Frame rate:</strong> 30 fps
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-1">
            <p>
              ⚠️ Aunque la imagen/video tenga texto incrustado,{" "}
              <strong>completá el campo &quot;Título&quot;</strong> — es el
              que Google lee para SEO y los screen readers para accesibilidad.
            </p>
            <p>
              ⚠️ Si el CTA lleva a una URL externa (ej. MercadoLibre),
              pegala completa con <code>https://</code>. Si es interna,
              empezá con <code>/</code> (ej. <code>/productos/maquina-montadora-de-fuelles</code>).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function BannerForm({
  banner,
  busy,
  onCancel,
  onSave,
  setError,
}: {
  banner: EditingBanner;
  busy: boolean;
  onCancel: () => void;
  onSave: (data: EditingBanner) => void;
  setError: (e: string | null) => void;
}) {
  const [data, setData] = useState<EditingBanner>(banner);
  const [uploading, setUploading] = useState(false);

  function update<K extends keyof EditingBanner>(key: K, value: EditingBanner[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const pathname = `banners/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "-")}`;
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/admin/banners/upload",
        clientPayload: "banner-upload",
      });
      update("fileUrl", blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const needsFile = data.tipo === "imagen" || data.tipo === "video";
  const canSave = data.tipo === "patente" || (needsFile && !!data.fileUrl);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
      <h3 className="font-bold text-sm text-[#0a2b3d] uppercase tracking-wide">
        {data.id ? "Editar banner" : "Nuevo banner"}
      </h3>

      {/* Tipo (solo en create) */}
      {!data.id && (
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Tipo
          </label>
          <div className="flex gap-2">
            {(["imagen", "video", "patente"] as BannerTipo[]).map((t) => (
              <label
                key={t}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${
                  data.tipo === t
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="tipo"
                  checked={data.tipo === t}
                  onChange={() => update("tipo", t)}
                  className="sr-only"
                />
                {t === "imagen" && "📸 Imagen"}
                {t === "video" && "🎥 Video"}
                {t === "patente" && "🔍 Buscador de patente"}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Archivo (solo imagen/video) */}
      {needsFile && (
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Archivo {data.fileUrl ? "(reemplazar)" : "*"}
          </label>
          {data.fileUrl && (
            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
              <span className="truncate max-w-md">{data.fileUrl}</span>
            </div>
          )}
          <input
            type="file"
            accept={data.tipo === "video" ? "video/*" : "image/*"}
            onChange={handleFileUpload}
            disabled={uploading}
            className="text-sm"
          />
          {uploading && (
            <p className="mt-1 text-xs text-gray-500">Subiendo a Vercel Blob…</p>
          )}
        </div>
      )}

      {/* Metadata común (no para patente) */}
      {data.tipo !== "patente" && (
        <>
          <TextField
            label="Título (opcional)"
            hint="Texto grande superpuesto — también usado para SEO y accesibilidad"
            value={data.titulo ?? ""}
            onChange={(v) => update("titulo", v)}
          />
          <TextField
            label="Subtítulo (opcional)"
            value={data.subtitulo ?? ""}
            onChange={(v) => update("subtitulo", v)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              label="Texto del botón (CTA)"
              value={data.ctaText ?? ""}
              onChange={(v) => update("ctaText", v)}
              placeholder="Ver producto"
            />
            <TextField
              label="Link del botón"
              value={data.ctaHref ?? ""}
              onChange={(v) => update("ctaHref", v)}
              placeholder="/productos/... o https://..."
            />
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => onSave(data)}
          disabled={busy || uploading || !canSave}
          className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-bold hover:bg-primary-dark transition cursor-pointer disabled:opacity-50"
        >
          {busy ? "Guardando..." : data.id ? "Guardar cambios" : "Crear banner"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy || uploading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      />
      {hint && <p className="mt-1 text-[11px] text-gray-500">{hint}</p>}
    </div>
  );
}
