import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { setOverride, type DescargaSlot } from "@/lib/descargas-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Este endpoint está exento del middleware de admin porque recibe
// webhooks firmados desde Vercel Blob (sin cookie). Chequeamos el
// cookie manualmente en onBeforeGenerateToken — el request de
// generación de token sí viene del browser del admin.
const ADMIN_SALT = "griffo-admin-2026-salt";
const ADMIN_COOKIE = "griffo-admin-token";

async function verifyAdminCookie(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const expected = createHash("sha256")
    .update(`${ADMIN_SALT}:${password}`)
    .digest("hex");
  return token === expected;
}

/**
 * Flow de upload directo cliente → Blob.
 *
 * Evita el límite de 4.5 MB de las serverless functions de Vercel.
 *
 *   1. El cliente llama a `upload()` del SDK con este URL como
 *      `handleUploadUrl` y pasa el slot como `clientPayload`.
 *   2. El SDK hace POST acá con body que handleUpload entiende:
 *      primero pide un token (`blob.generate-client-token`),
 *      después avisa que terminó (`blob.upload-completed`).
 *   3. En `onBeforeGenerateToken` validamos/devolvemos un token y
 *      pasamos el slot adelante como `tokenPayload`.
 *   4. En `onUploadCompleted` guardamos la URL en Redis bajo la
 *      clave del slot.
 *
 * Auth: el middleware global ya exige cookie de admin para /api/admin/*
 * así que no necesitamos re-chequear aquí.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const authed = await verifyAdminCookie();
        if (!authed) throw new Error("No autorizado");
        if (!clientPayload) throw new Error("Falta clientPayload (slot)");
        return {
          // Aceptamos todos los formatos que necesitamos: PDFs, videos,
          // ZIPs, XLSX. Mejor no restringir acá para evitar falsos
          // negativos con content-types raros.
          allowedContentTypes: [
            "application/pdf",
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "application/zip",
            "application/x-zip-compressed",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "application/octet-stream",
          ],
          addRandomSuffix: true,
          tokenPayload: clientPayload,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (!tokenPayload) return;
        try {
          const slot = JSON.parse(tokenPayload) as DescargaSlot;
          await setOverride(slot, blob.url);
        } catch (e) {
          console.error("[descargas/upload] onUploadCompleted error:", e);
        }
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error al subir";
    console.error("[admin/descargas/upload] error:", error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
