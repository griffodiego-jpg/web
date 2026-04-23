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
    const raw = await getClientAccountStatus(clientCode);
    // Defensa: si el ERP devuelve algo que no es array, lo tratamos
    // como un error en lugar de `[]` silencioso. Así el usuario ve el
    // UnavailableBox con el detalle técnico en lugar de una cuenta
    // corriente vacía silenciosa.
    if (!Array.isArray(raw)) {
      const sample = JSON.stringify(raw ?? null).slice(0, 200);
      console.error(
        `[account-status] ${clientCode}: respuesta inesperada (no array):`,
        sample,
      );
      throw new Error(`Respuesta inesperada del ERP (no array): ${sample}`);
    }
    console.log(
      `[account-status] ${clientCode}: ${raw.length} movimientos del ERP`,
    );
    return { items: raw, source: "erp" };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(
      `[account-status] ${clientCode}: falló la consulta al ERP:`,
      error,
    );
    if (clientCode === mockCurrentClient.client_id) {
      return { items: mockAccountStatus, source: "mock" };
    }
    return { items: [], source: "unavailable", error };
  }
}
