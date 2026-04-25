import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { saveLead, type SugerenciaLead } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recibe sugerencias de productos desde el banner del catálogo (cuando
 * el usuario no encuentra lo que busca). Persiste en Redis con kind
 * `sugerencia`. No manda email para no inundar la casilla — se revisan
 * en lote desde /admin/leads → tab Sugerencias.
 *
 * Acepta multipart/form-data porque puede incluir una foto. La foto
 * (max 4 MB, jpg/png/webp) se sube server-side a Vercel Blob público
 * y se guarda la URL en el lead.
 *
 * Validación mínima: requiere `producto` no vacío y razonable.
 * El resto es opcional. Mantenemos compat con bodies JSON viejos por
 * si algún cliente cacheado todavía manda así.
 */

const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const VALID_PROFILES = ["mecanico", "taller", "particular", "distribuidor"];
const VALID_LINEAS = ["suspension", "direccion", "transmision", "otro"];

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let fields: Record<string, string> = {};
  let photoFile: File | null = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      for (const [key, value] of form.entries()) {
        if (value instanceof File) {
          if (key === "foto" && value.size > 0) photoFile = value;
        } else {
          fields[key] = String(value);
        }
      }
    } else {
      const body = (await request.json()) as Record<string, unknown>;
      for (const [k, v] of Object.entries(body)) {
        if (typeof v === "string") fields[k] = v;
      }
    }
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const producto = (fields.producto ?? "").trim();
  if (producto.length < 3) {
    return NextResponse.json(
      { error: "Decinos qué producto buscás (mínimo 3 caracteres)." },
      { status: 400 },
    );
  }
  if (producto.length > 1000) {
    return NextResponse.json(
      { error: "El mensaje es muy largo (máx 1000 caracteres)." },
      { status: 400 },
    );
  }

  // Validación + upload de la foto antes de armar el lead — si la foto
  // falla, falla todo el submit (mejor que guardar el lead sin foto y
  // que el usuario crea que se mandó bien).
  let fotoUrl: string | undefined;
  if (photoFile) {
    if (!ALLOWED_PHOTO_TYPES.has(photoFile.type)) {
      return NextResponse.json(
        { error: "La foto debe ser JPG, PNG o WebP." },
        { status: 400 },
      );
    }
    if (photoFile.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { error: "La foto pesa más de 4 MB." },
        { status: 400 },
      );
    }
    try {
      const ext = photoFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
      const path = `sugerencias/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
      const upload = await put(path, photoFile, {
        access: "public",
        contentType: photoFile.type,
        addRandomSuffix: false,
      });
      fotoUrl = upload.url;
    } catch (e) {
      console.error("[sugerencias] error subiendo foto:", e);
      return NextResponse.json(
        { error: "No pudimos subir la foto. Probá de nuevo." },
        { status: 500 },
      );
    }
  }

  const lead: SugerenciaLead = {
    kind: "sugerencia",
    ts: Date.now(),
    producto,
    marcaVehiculo: fields.marcaVehiculo?.trim() || undefined,
    modeloVehiculo: fields.modeloVehiculo?.trim() || undefined,
    anioVehiculo: fields.anioVehiculo?.trim() || undefined,
    linea:
      fields.linea && VALID_LINEAS.includes(fields.linea)
        ? (fields.linea as SugerenciaLead["linea"])
        : undefined,
    // Lado es texto libre — puede ser "izquierdo", "lado caja", "delantero",
    // "lado rueda derecho", lo que el usuario escriba. Sólo limitamos largo.
    lado: fields.lado?.trim().slice(0, 60) || undefined,
    medidas: fields.medidas?.trim() || undefined,
    oem: fields.oem?.trim() || undefined,
    fotoUrl,
    perfil:
      fields.perfil && VALID_PROFILES.includes(fields.perfil)
        ? (fields.perfil as SugerenciaLead["perfil"])
        : undefined,
    email: fields.email?.trim() || undefined,
    celular: fields.celular?.trim() || undefined,
    busqueda: fields.busqueda?.trim() || undefined,
    tab: fields.tab?.trim() || undefined,
  };

  await saveLead(lead);
  return NextResponse.json({ ok: true });
}
