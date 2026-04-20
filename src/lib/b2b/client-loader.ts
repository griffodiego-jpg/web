/**
 * Carga de clientes B2B: trata de pegarle al ERP real, y cae a los
 * mocks si falla (sin credenciales, red caída, etc). Así la UI del
 * admin siempre muestra algo usable mientras el middleware esté en
 * construcción.
 */

import "server-only";

import { getClients } from "@/lib/api/bejerman";
import { mockClients } from "@/data/mock-b2b";
import type { BejermanClient } from "@/types/bejerman";

export async function loadAllClients(): Promise<{
  clients: BejermanClient[];
  source: "erp" | "mock";
  error?: string;
}> {
  try {
    const clients = await getClients();
    if (!clients || clients.length === 0) {
      return { clients: mockClients, source: "mock" };
    }
    return { clients, source: "erp" };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { clients: mockClients, source: "mock", error };
  }
}

export async function loadClientByCode(
  code: string,
): Promise<BejermanClient | null> {
  const { clients } = await loadAllClients();
  return clients.find((c) => c.client_id === code) ?? null;
}
