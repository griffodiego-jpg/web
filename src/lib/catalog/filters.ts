/**
 * Filtros facetados del catálogo.
 *
 * Funciona estilo Mercado Libre:
 *  - Multi-select dentro de cada grupo (OR interno)
 *  - Entre grupos distintos: AND
 *  - Contadores por opción calculados con exclusión de su propia facet
 *    (tildar Suspensión no esconde las demás líneas, pero sí recalcula
 *    los counts de Tipo, Ubicación, Lado, Marca, Modelo).
 *
 * Grupos:
 *   linea      → product.category
 *   tipo       → kit | fuelle | tope (derivado de is_kit + product)
 *   ubicacion  → attribute cuyo name incluye "ubicaci"
 *   lado       → attribute cuyo name incluye "lado", expandido:
 *                "izquierdo y/o derecho (según vehículo)" matchea tanto
 *                Izquierdo como Derecho para que no se esconda del filtro.
 *   marca      → vehicles[].brand (excluye AGRALE, IVECO, UNIVERSAL)
 *   modelo     → vehicles[].master_model (dependiente de marca)
 */

import type { CatalogProduct, SpecPartsProduct } from "@/types/specparts";
import { getAttrValues, getProductLocations } from "./utils";

export type FilterGroup = "linea" | "tipo" | "ubicacion" | "lado" | "marca" | "modelo";

export type CatalogFilters = {
  linea: Set<string>;
  tipo: Set<string>;
  ubicacion: Set<string>;
  lado: Set<string>;
  marca: Set<string>;
  modelo: Set<string>;
};

export type TipoKey = "kit" | "fuelle" | "tope";

export type Facet = { value: string; count: number };

const EXCLUDED_BRANDS = new Set(["AGRALE", "IVECO", "UNIVERSAL"]);

export function emptyFilters(): CatalogFilters {
  return {
    linea: new Set(),
    tipo: new Set(),
    ubicacion: new Set(),
    lado: new Set(),
    marca: new Set(),
    modelo: new Set(),
  };
}

export function hasActiveFilters(f: CatalogFilters): boolean {
  return (Object.keys(f) as FilterGroup[]).some((k) => f[k].size > 0);
}

export function countActiveFilters(f: CatalogFilters): number {
  let total = 0;
  for (const k of Object.keys(f) as FilterGroup[]) {
    total += f[k].size;
  }
  return total;
}

export function toggleFilter(f: CatalogFilters, group: FilterGroup, value: string): CatalogFilters {
  const next: CatalogFilters = {
    linea: new Set(f.linea),
    tipo: new Set(f.tipo),
    ubicacion: new Set(f.ubicacion),
    lado: new Set(f.lado),
    marca: new Set(f.marca),
    modelo: new Set(f.modelo),
  };
  const set = next[group];
  if (set.has(value)) set.delete(value);
  else set.add(value);

  // Si sacan todas las marcas, limpiar modelos también (quedaría colgado).
  if (group === "marca" && next.marca.size === 0) {
    next.modelo = new Set();
  }
  // Si tildan/destildan una marca y el modelo seleccionado ya no aplica,
  // lo dejamos — el matchesFilters() va a devolver 0 y el user lo verá.
  return next;
}

export function clearGroup(f: CatalogFilters, group: FilterGroup): CatalogFilters {
  const next: CatalogFilters = {
    linea: new Set(f.linea),
    tipo: new Set(f.tipo),
    ubicacion: new Set(f.ubicacion),
    lado: new Set(f.lado),
    marca: new Set(f.marca),
    modelo: new Set(f.modelo),
  };
  next[group] = new Set();
  if (group === "marca") next.modelo = new Set();
  return next;
}

/* -------------------------------------------------------------------------- */
/*  Clasificación y normalización                                              */
/* -------------------------------------------------------------------------- */

export function classifyTipo(p: SpecPartsProduct): TipoKey | null {
  const name = (p.product || "").toUpperCase();
  if (p.is_kit === 1 || name.includes("KIT")) return "kit";
  if (name.includes("FUELLE")) return "fuelle";
  if (name.includes("TOPE")) return "tope";
  return null;
}

/**
 * Normaliza el lado. Los valores "según vehículo", "y/o", "ambos", "izquierdo
 * o derecho" etc. se expanden para que cualquier filtro de Izquierdo o Derecho
 * los incluya (vs. aparecer como opción separada en el sidebar).
 */
export function expandLadoValue(raw: string): string[] {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!cleaned) return [];
  const looksAmbos =
    cleaned.includes("segun vehiculo") ||
    cleaned.includes("y/o") ||
    cleaned.includes(" o ") ||
    cleaned.includes("ambos");
  if (looksAmbos) return ["izquierdo", "derecho"];
  return [cleaned];
}

export function displayLadoLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/* -------------------------------------------------------------------------- */
/*  Matching                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Chequea si un producto cumple los filtros, opcionalmente salteando un grupo
 * (se usa para calcular facets: contar cuántos productos quedarían tildando X
 * sin contar X como filtro).
 */
export function matchesFilters(
  p: CatalogProduct,
  f: CatalogFilters,
  opts: { skip?: FilterGroup } = {},
): boolean {
  const { skip } = opts;

  if (skip !== "linea" && f.linea.size > 0) {
    if (!f.linea.has((p.category || "").toUpperCase())) return false;
  }

  if (skip !== "tipo" && f.tipo.size > 0) {
    const t = classifyTipo(p);
    if (!t || !f.tipo.has(t)) return false;
  }

  if (skip !== "ubicacion" && f.ubicacion.size > 0) {
    const locs = getProductLocations(p).map((l) => l.toUpperCase().trim()).filter(Boolean);
    if (!locs.some((l) => f.ubicacion.has(l))) return false;
  }

  if (skip !== "lado" && f.lado.size > 0) {
    const expanded = new Set<string>();
    for (const raw of getAttrValues(p, "lado")) {
      for (const v of expandLadoValue(raw)) expanded.add(v);
    }
    let hit = false;
    for (const v of expanded) {
      if (f.lado.has(v)) {
        hit = true;
        break;
      }
    }
    if (!hit) return false;
  }

  if (skip !== "marca" && f.marca.size > 0) {
    const hit = (p.vehicles ?? []).some((v) => v.brand && f.marca.has(v.brand.toUpperCase()));
    if (!hit) return false;
  }

  if (skip !== "modelo" && f.modelo.size > 0) {
    const hit = (p.vehicles ?? []).some(
      (v) => v.master_model && f.modelo.has(v.master_model.toUpperCase()),
    );
    if (!hit) return false;
  }

  return true;
}

export function applyFilters(products: CatalogProduct[], f: CatalogFilters): CatalogProduct[] {
  return products.filter((p) => matchesFilters(p, f));
}

/* -------------------------------------------------------------------------- */
/*  Facets (con contadores)                                                    */
/* -------------------------------------------------------------------------- */

export type Facets = {
  linea: Facet[];
  tipo: Facet[];
  ubicacion: Facet[];
  lado: Facet[];
  marca: Facet[];
  modelo: Facet[];
};

export function computeFacets(products: CatalogProduct[], f: CatalogFilters): Facets {
  const facetFor = (group: FilterGroup): Facet[] => {
    const filtered = products.filter((p) => matchesFilters(p, f, { skip: group }));
    const counts = new Map<string, number>();

    for (const p of filtered) {
      const values = extractValues(p, group, f);
      for (const v of values) {
        counts.set(v, (counts.get(v) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value, "es"));
  };

  return {
    linea: facetFor("linea"),
    tipo: facetFor("tipo"),
    ubicacion: facetFor("ubicacion"),
    lado: facetFor("lado"),
    marca: facetFor("marca"),
    // Modelo: solo tiene sentido si hay al menos una marca tildada.
    modelo: f.marca.size > 0 ? facetFor("modelo") : [],
  };
}

function extractValues(p: CatalogProduct, group: FilterGroup, f: CatalogFilters): string[] {
  switch (group) {
    case "linea": {
      const v = (p.category || "").toUpperCase().trim();
      return v ? [v] : [];
    }
    case "tipo": {
      const t = classifyTipo(p);
      return t ? [t] : [];
    }
    case "ubicacion": {
      return getProductLocations(p)
        .map((l) => l.toUpperCase().trim())
        .filter(Boolean);
    }
    case "lado": {
      const out = new Set<string>();
      for (const raw of getAttrValues(p, "lado")) {
        for (const v of expandLadoValue(raw)) out.add(v);
      }
      return Array.from(out);
    }
    case "marca": {
      const brands = new Set<string>();
      for (const v of p.vehicles ?? []) {
        if (!v.brand) continue;
        const b = v.brand.toUpperCase();
        if (EXCLUDED_BRANDS.has(b)) continue;
        brands.add(b);
      }
      return Array.from(brands);
    }
    case "modelo": {
      const models = new Set<string>();
      for (const v of p.vehicles ?? []) {
        if (!v.master_model) continue;
        const brand = (v.brand || "").toUpperCase();
        // Solo contamos modelos de marcas tildadas (cuando hay alguna)
        if (f.marca.size > 0 && !f.marca.has(brand)) continue;
        if (EXCLUDED_BRANDS.has(brand)) continue;
        models.add(v.master_model.toUpperCase());
      }
      return Array.from(models);
    }
  }
}
