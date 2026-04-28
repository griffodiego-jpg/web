/**
 * Carga de clientes B2B: trata de pegarle al ERP real, y cae a los
 * mocks si falla (sin credenciales, red caída, etc). Así la UI del
 * admin siempre muestra algo usable mientras el middleware esté en
 * construcción.
 *
 * La API del ERP devuelve una fila por sucursal (mismo `client_id`,
 * distinto `name` con el sufijo "SUCURSAL X"). Acá las unificamos:
 * una fila por `client_id` con todos los warehouses agregados.
 */

import "server-only";

import { getClients } from "@/lib/api/bejerman";
import { mockClients } from "@/data/mock-b2b";
import { getPriceListOverrides } from "@/lib/b2b/price-list-overrides";
import type { BejermanClient, BejermanWarehouse } from "@/types/bejerman";

/**
 * Aplica el override manual de `priceListCode` que setea el admin desde
 * `/admin/clientes`. Si hay override, prevalece sobre lo que devuelva
 * el ERP — así si Griffo quiere cambiar la lista de un cliente sin
 * tocar Bejerman, lo puede hacer desde acá.
 */
function applyPriceListOverrides(
  clients: BejermanClient[],
  overrides: Record<string, string>,
): BejermanClient[] {
  if (Object.keys(overrides).length === 0) return clients;
  return clients.map((c) => {
    const override = overrides[c.client_id];
    if (override) return { ...c, priceListCode: override };
    return c;
  });
}

export async function loadAllClients(): Promise<{
  clients: BejermanClient[];
  source: "erp" | "mock";
  error?: string;
}> {
  const overrides = await getPriceListOverrides().catch(() => ({}));
  try {
    const clients = await getClients();
    if (!clients || clients.length === 0) {
      return {
        clients: applyPriceListOverrides(mockClients, overrides),
        source: "mock",
      };
    }
    return {
      clients: applyPriceListOverrides(mergeClientsByCode(clients), overrides),
      source: "erp",
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      clients: applyPriceListOverrides(mockClients, overrides),
      source: "mock",
      error,
    };
  }
}

export async function loadClientByCode(
  code: string,
): Promise<BejermanClient | null> {
  const { clients } = await loadAllClients();
  return clients.find((c) => c.client_id === code) ?? null;
}

/* -------------------------------------------------------------------- */
/* Agrupación por client_id                                             */
/* -------------------------------------------------------------------- */

/**
 * Quita sufijos típicos de sucursal de una razón social.
 * Ejemplos:
 *   "ASIR S.A. SUCURSAL PARANÁ"  → "ASIR S.A."
 *   "ASIR S.A. SUC. ROSARIO"     → "ASIR S.A."
 *   "CEDISA SRL"                 → "CEDISA SRL" (sin cambios)
 */
function stripSucursalSuffix(name: string): string {
  const pattern = /\s+(SUCURSAL|SUC\.?|CASA\s+CENTRAL|CENTRAL)\b.*$/i;
  const stripped = name.replace(pattern, "").trim();
  return stripped || name;
}

/** Prefijo común más largo entre varios nombres. */
function commonPrefix(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  let prefix = names[0];
  for (let i = 1; i < names.length; i++) {
    while (prefix && !names[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
    }
    if (!prefix) break;
  }
  return prefix.replace(/[\s\-\(\,]+$/, "").trim();
}

function resolveClientName(names: string[]): string {
  const uniq = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (uniq.length === 0) return "";
  if (uniq.length === 1) return uniq[0];
  const stripped = [...new Set(uniq.map(stripSucursalSuffix))];
  if (stripped.length === 1) return stripped[0];
  const prefix = commonPrefix(uniq);
  if (prefix.length >= 4) return prefix;
  return uniq[0];
}

function firstNonEmpty(
  values: Array<string | undefined>,
): string | undefined {
  for (const v of values) {
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}

/** Extrae etiqueta de sucursal del nombre completo (ej. "PARANÁ"). */
function detectSucursalLabel(name: string): string | null {
  const m = name.match(/\b(?:SUCURSAL|SUC\.?|CASA\s+CENTRAL)\s+(.+)$/i);
  if (m && m[1]) return m[1].trim();
  return null;
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Agrupa records por `client_id`. Para cada grupo:
 * - Nombre: resolveClientName() para quitar sufijo de sucursal.
 * - warehouses: unión dedupada. Si el row viene con sucursal sólo en el
 *   `name`, se crea un warehouse virtual para no perder la opción al
 *   armar un pedido.
 * - Otros campos (email, cuit, priceListCode, address, phone): primer
 *   valor no vacío entre los records.
 */
export function mergeClientsByCode(
  records: BejermanClient[],
): BejermanClient[] {
  const groups = new Map<string, BejermanClient[]>();
  for (const r of records) {
    const key = r.client_id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const merged: BejermanClient[] = [];
  for (const [client_id, rows] of groups) {
    const name = resolveClientName(rows.map((r) => r.name ?? ""));
    const email = firstNonEmpty(rows.map((r) => r.email));
    const cuit = firstNonEmpty(rows.map((r) => r.cuit));
    const priceListCode = firstNonEmpty(rows.map((r) => r.priceListCode));
    const address = firstNonEmpty(rows.map((r) => r.address));
    const phone = firstNonEmpty(rows.map((r) => r.phone));

    // Union de warehouses reales.
    const whMap = new Map<string, BejermanWarehouse>();
    for (const r of rows) {
      for (const w of r.warehouses ?? []) {
        if (!whMap.has(w.warehouse_id)) whMap.set(w.warehouse_id, w);
      }
    }

    // Si varios rows vienen con el mismo client_id y warehouses reales
    // escasos, asumimos que cada row es una sucursal. Sumamos la
    // sucursal "virtual" basada en el nombre para no perder la opción.
    if (rows.length > 1 && whMap.size < rows.length) {
      for (const r of rows) {
        const sucursal = detectSucursalLabel(r.name ?? "");
        if (!sucursal) continue;
        const baseId = r.warehouses?.[0]?.warehouse_id ?? client_id;
        const virtualId = `${baseId}-${slug(sucursal)}`;
        if (!whMap.has(virtualId)) {
          whMap.set(virtualId, {
            warehouse_id: virtualId,
            description: sucursal,
          });
        }
      }
    }

    merged.push({
      client_id,
      name,
      email: email ?? "",
      cuit,
      priceListCode,
      address,
      phone,
      warehouses: [...whMap.values()],
    });
  }

  merged.sort((a, b) => a.name.localeCompare(b.name, "es"));
  return merged;
}
