import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  SESSION_KEY_PREFIX,
} from "@/lib/admin-auth";
import { getRedis } from "@/lib/kv";
import {
  setImageOverride,
  type CatalogoImagenId,
} from "@/lib/catalogo-imagenes-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
 * Upload directo cliente → Blob para imágenes del catálogo (ej. grilla
 * de tréboles). Mismo patrón que /api/admin/descargas/upload: el cliente
 * pasa `clientPayload` con el id del slot, se genera token con el id
 * serializado en `tokenPayload`, y al completarse se guarda la URL en
 * Redis bajo ese id.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        if (!(await verifyAdminSession())) {
          throw new Error("No autorizado");
        }
        if (!clientPayload) throw new Error("Falta clientPayload (id)");
        return {
          allowedContentTypes: ["image/png", "image/jpeg", "image/webp"],
          addRandomSuffix: true,
          tokenPayload: clientPayload,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (!tokenPayload) return;
        try {
          const id = tokenPayload as CatalogoImagenId;
          await setImageOverride(id, blob.url);
        } catch (e) {
          console.error("[catalogo-imagenes/upload] onUploadCompleted error:", e);
        }
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error al subir";
    console.error("[admin/catalogo-imagenes/upload] error:", error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
