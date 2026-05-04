/**
 * Resuelve "el cliente actual" para cualquier server component del
 * portal. Orden de prioridad:
 *   1. Si hay impersonación activa (cookie de admin) → ese cliente.
 *   2. Si hay sesión B2B (cookie httpOnly del login) → ese cliente.
 *   3. Fallback → mockCurrentClient (modo demo / dev local).
 *
 * Cuando Firebase Auth esté conectado, el paso 2 se reemplaza por
 * leer el JWT del cliente — la API de este módulo (getCurrentClient,
 * isImpersonating) queda igual.
 */

import "server-only";

import { mockCurrentClient } from "@/data/mock-b2b";
import { loadClientByCode } from "@/lib/b2b/client-loader";
import { getImpersonatedCode } from "@/lib/b2b/impersonation";
import { getB2BSession } from "@/lib/b2b/session-cookie";
import type { BejermanClient } from "@/types/bejerman";

export async function getCurrentClient(): Promise<BejermanClient> {
  const impersonatedCode = await getImpersonatedCode();
  if (impersonatedCode) {
    const client = await loadClientByCode(impersonatedCode);
    if (client) return client;
  }
  const session = await getB2BSession();
  if (session) {
    const client = await loadClientByCode(session.clientId);
    if (client) return client;
  }
  return mockCurrentClient;
}

/**
 * Versión "estricta" — no cae al mock. Para endpoints donde el fallback
 * a un cliente fantasma sería un agujero de seguridad (ej. descargar la
 * lista de precios). Devuelve null si no hay impersonación ni sesión.
 */
export async function getAuthenticatedClient(): Promise<BejermanClient | null> {
  const impersonatedCode = await getImpersonatedCode();
  if (impersonatedCode) {
    return await loadClientByCode(impersonatedCode);
  }
  const session = await getB2BSession();
  if (session) {
    return await loadClientByCode(session.clientId);
  }
  return null;
}

export async function isImpersonating(): Promise<boolean> {
  return (await getImpersonatedCode()) !== null;
}
