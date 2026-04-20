import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  SESSION_KEY_PREFIX,
} from "@/lib/admin-auth";
import { getRedis } from "@/lib/kv";
import { savePriceList } from "@/lib/price-lists";
import type { PriceList } from "@/types/price-list";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UploadPayload {
  code: string;
  name: string;
  note?: string;
}

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
 * Flow de upload de lista de precios.
 *   1. El admin elige archivo + mete code + name en el form.
 *   2. `upload()` del SDK llama acá con body de handleUpload.
 *   3. En `onBeforeGenerateToken` validamos cookie y codificamos el
 *      payload (code/name/note) como tokenPayload.
 *   4. En `onUploadCompleted` recibimos la URL del blob y guardamos
 *      la metadata en Redis via savePriceList.
 *
 * El cliente también llama POST /save como fallback idempotente por
 * si `onUploadCompleted` no dispara (pasa en previews con protección
 * de Vercel).
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        if (!(await verifyAdminSession())) throw new Error("No autorizado");
        if (!clientPayload) throw new Error("Falta clientPayload");
        return {
          allowedContentTypes: [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "application/pdf",
            "application/octet-stream",
            "text/csv",
          ],
          addRandomSuffix: true,
          tokenPayload: clientPayload,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (!tokenPayload) return;
        try {
          const payload = JSON.parse(tokenPayload) as UploadPayload;
          const list: PriceList = {
            id: `${payload.code.toUpperCase()}-${Date.now()}`,
            code: payload.code,
            name: payload.name,
            note: payload.note,
            fileUrl: blob.url,
            filename:
              blob.pathname.split("/").pop() ?? "lista-precios.xlsx",
            sizeBytes: 0, // Blob no nos pasa size acá — el cliente hará /save con el size real.
            uploadedAt: new Date().toISOString(),
          };
          await savePriceList(list);
        } catch (e) {
          console.error("[listas-precios/upload] save error:", e);
        }
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error al subir";
    console.error("[listas-precios/upload] error:", error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
