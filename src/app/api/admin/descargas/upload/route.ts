import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  SESSION_KEY_PREFIX,
} from "@/lib/admin-auth";
import { getRedis } from "@/lib/kv";
import { setOverride, type DescargaSlot } from "@/lib/descargas-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Este endpoint está exento del middleware global de admin porque
 * recibe webhooks firmados desde Vercel Blob (sin cookie — handleUpload
 * verifica la signature internamente). Por eso validamos la cookie de
 * sesión manualmente sólo en el stage de generación de token, que es
 * el que llega desde el browser del admin.
 */
async function verifyAdminSession(): Promise<boolean> {
  const store = await cookies();
  const sessionId = store.get(ADMIN_COOKIE_NAME)?.value;
  if (!sessionId) return false;
  const redis = getRedis();
  if (!redis) return false;
  try {
    const session = await redis.get(SESSION_KEY_PREFIX + sessionId);
    return session !== null;
  } catch {
    return false;
  }
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
 *   3. En `onBeforeGenerateToken` validamos el cookie de admin y
 *      devolvemos un token con el slot serializado como tokenPayload.
 *   4. En `onUploadCompleted` guardamos la URL en Redis bajo la
 *      clave del slot.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!(await verifyAdminSession())) {
          throw new Error("No autorizado");
        }
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
