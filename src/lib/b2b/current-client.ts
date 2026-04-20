/**
 * Resuelve "el cliente actual" para cualquier server component del
 * portal. Orden de prioridad:
 *   1. Si hay impersonación activa (cookie de admin) → ese cliente.
 *   2. Fallback → mockCurrentClient (modo demo).
 *
 * Cuando Firebase Auth esté conectado, acá se agrega un tercer paso:
 * leer el JWT del cliente → resolver client_id → cargar. Hoy no
 * existe, por eso el fallback.
 */

import "server-only";

import { mockCurrentClient } from "@/data/mock-b2b";
import { loadClientByCode } from "@/lib/b2b/client-loader";
import { getImpersonatedCode } from "@/lib/b2b/impersonation";
import type { BejermanClient } from "@/types/bejerman";

export async function getCurrentClient(): Promise<BejermanClient> {
  const impersonatedCode = await getImpersonatedCode();
  if (impersonatedCode) {
    const client = await loadClientByCode(impersonatedCode);
    if (client) return client;
  }
  return mockCurrentClient;
}

export async function isImpersonating(): Promise<boolean> {
  return (await getImpersonatedCode()) !== null;
}
