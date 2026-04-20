/**
 * Estado de cuenta corriente por cliente: trata el ERP real primero,
 * cae a mock sólo si el código coincide con el cliente mock (así los
 * otros clientes de la demo no muestran la misma plantilla).
 */

import "server-only";

import { getClientAccountStatus } from "@/lib/api/bejerman";
import { mockAccountStatus, mockCurrentClient } from "@/data/mock-b2b";
import type { BejermanAccountStatusItem } from "@/types/bejerman";

export type AccountStatusResult = {
  items: BejermanAccountStatusItem[];
  source: "erp" | "mock" | "unavailable";
  error?: string;
};

export async function getAccountStatusForClient(
  clientCode: string,
): Promise<AccountStatusResult> {
  try {
    const items = await getClientAccountStatus(clientCode);
    return { items, source: "erp" };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    if (clientCode === mockCurrentClient.client_id) {
      return { items: mockAccountStatus, source: "mock" };
    }
    return { items: [], source: "unavailable", error };
  }
}
