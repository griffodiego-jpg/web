import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  SESSION_KEY_PREFIX,
} from "@/lib/admin-auth";
import { getRedis } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Upload cliente → Vercel Blob para banners del home.
 *
 * Mismo patrón que /api/admin/descargas/upload — pasa por el guard
 * del proxy y por encima valida la cookie de admin manualmente porque
 * el proxy lo exime para recibir los webhooks firmados de Blob.
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
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "video/mp4",
            "video/webm",
            "video/quicktime",
          ],
          addRandomSuffix: true,
          tokenPayload: clientPayload ?? "",
        };
      },
      onUploadCompleted: async () => {
        // No hacemos nada acá — el cliente recibe el URL en la
        // respuesta de upload() y después llama a /api/admin/banners/save
        // con los metadata y el fileUrl. No dependemos del webhook.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error al subir";
    console.error("[admin/banners/upload] error:", error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
