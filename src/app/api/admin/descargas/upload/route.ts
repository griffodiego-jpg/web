import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import {
  setOverride,
  type DescargaSlot,
} from "@/lib/descargas-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recibe un archivo + metadata del slot, lo sube a Vercel Blob, y
 * guarda la URL pública en Redis bajo la clave del slot.
 *
 * Body (multipart/form-data):
 *   - file: el archivo
 *   - slot: JSON serializado del DescargaSlot
 *
 * Requiere BLOB_READ_WRITE_TOKEN en env (lo inyecta Vercel al
 * conectar el store al proyecto).
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const slotJson = formData.get("slot");

    if (!(file instanceof File) || typeof slotJson !== "string") {
      return NextResponse.json(
        { error: "Parámetros inválidos" },
        { status: 400 }
      );
    }

    const slot = JSON.parse(slotJson) as DescargaSlot;
    const pathname = pathnameFor(slot, file.name);

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || undefined,
    });

    await setOverride(slot, blob.url);

    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e) {
    console.error("[admin/descargas/upload] error:", e);
    const msg = e instanceof Error ? e.message : "Error al subir";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Path dentro del blob — solo cosmético, el URL final es público. */
function pathnameFor(slot: DescargaSlot, filename: string): string {
  const safe = filename.replace(/[^\w.\-]+/g, "-");
  if (slot.kind === "catalogo-general") return `descargas/catalogo/${safe}`;
  if (slot.kind === "material")
    return `descargas/productos/${slot.slug}/${slot.type}/${safe}`;
  return `descargas/gated/${slot.id}/${safe}`;
}
