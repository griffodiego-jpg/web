/**
 * Utilidades puras para el catálogo. Sirven tanto en server como en client.
 * Ported de la app mobile (app.griffo.com.ar v2.11).
 */

import type { CatalogProduct, SpecPartsProduct } from "@/types/specparts";

/** Marcas que se excluyen del filtro de "Por Vehículo" (no se venden en AR). */
const EXCLUDED_VEHICLE_BRANDS = new Set(["AGRALE", "IVECO", "UNIVERSAL"]);

export function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Link de MercadoLibre — la API lo devuelve en `links[]` con key `link` o `url`. */
export function getMercadoLibreUrl(product: SpecPartsProduct): string | null {
  const links = product.links ?? [];
  for (const l of links) {
    const candidate = l.url ?? l.link;
    if (candidate) return candidate;
  }
  return null;
}

/* ========= Búsqueda por palabra ========= */

export function searchByKeyword(products: CatalogProduct[], query: string): CatalogProduct[] {
  const normalized = normalizeSearch(query.trim());
  if (!normalized) return [];
  const words = normalized.split(/\s+/).filter(Boolean);
  return products.filter((p) => words.every((w) => p._searchText.includes(w)));
}

/* ========= Búsqueda por código ========= */

export function searchByCode(products: CatalogProduct[], code: string): CatalogProduct[] {
  const q = code.trim().toLowerCase();
  if (!q) return [];
  return products.filter((p) => p.code?.toLowerCase().includes(q));
}

/* ========= Árbol de vehículos (para selects cascada) ========= */

export type VehicleTree = {
  brands: string[];
  modelsByBrand: Record<string, string[]>;
  yearsByBrandModel: Record<string, number[]>;
};

export function buildVehicleTree(products: CatalogProduct[]): VehicleTree {
  const brands = new Set<string>();
  const modelsByBrand = new Map<string, Set<string>>();
  const yearsByBrandModel = new Map<string, Set<number>>();

  for (const p of products) {
    for (const v of p.vehicles ?? []) {
      if (!v.brand || EXCLUDED_VEHICLE_BRANDS.has(v.brand)) continue;
      brands.add(v.brand);

      if (v.master_model) {
        if (!modelsByBrand.has(v.brand)) modelsByBrand.set(v.brand, new Set());
        modelsByBrand.get(v.brand)!.add(v.master_model);

        const key = `${v.brand}|${v.master_model}`;
        if (!yearsByBrandModel.has(key)) yearsByBrandModel.set(key, new Set());
        const yearsSet = yearsByBrandModel.get(key)!;
        const from = v.sold_from_year || 0;
        const until = v.sold_until_year || from;
        for (let y = from; y <= until; y += 1) {
          if (y > 1950 && y < 2100) yearsSet.add(y);
        }
      }
    }
  }

  const brandList = Array.from(brands).sort();
  const modelsByBrandOut: Record<string, string[]> = {};
  for (const [brand, models] of modelsByBrand.entries()) {
    modelsByBrandOut[brand] = Array.from(models).sort();
  }
  const yearsByBrandModelOut: Record<string, number[]> = {};
  for (const [key, years] of yearsByBrandModel.entries()) {
    yearsByBrandModelOut[key] = Array.from(years).sort((a, b) => b - a);
  }

  return {
    brands: brandList,
    modelsByBrand: modelsByBrandOut,
    yearsByBrandModel: yearsByBrandModelOut,
  };
}

export function searchByVehicle(
  products: CatalogProduct[],
  filters: { brand: string; model?: string; year?: number },
): CatalogProduct[] {
  if (!filters.brand) return [];
  return products.filter((p) => {
    if (!p.vehicles?.length) return false;
    return p.vehicles.some((v) => {
      if (v.brand !== filters.brand) return false;
      if (filters.model && v.master_model !== filters.model) return false;
      if (filters.year) {
        if (filters.year < v.sold_from_year || filters.year > v.sold_until_year) return false;
      }
      return true;
    });
  });
}

/* ========= Búsqueda por patente ========= */

export function filterByPlateVehicle(
  products: CatalogProduct[],
  plateVehicle: { brand?: string; master_model?: string; model?: string },
): CatalogProduct[] {
  if (!plateVehicle.brand) return [];
  return products.filter((p) => {
    if (!p.vehicles?.length) return false;
    return p.vehicles.some((v) => {
      if (v.brand !== plateVehicle.brand) return false;
      if (plateVehicle.master_model && v.master_model === plateVehicle.master_model) return true;
      if (plateVehicle.model && v.model === plateVehicle.model) return true;
      return false;
    });
  });
}

/* ========= Búsqueda por medidas ========= */

export type MeasureType = "direccion" | "transmision" | "tope";

export type MeasureRow = {
  code: string;
  diamMenor: string;
  diamMayor: string;
  largo: string;
  diamMenorNum: number | null;
  diamMayorNum: number | null;
  largoNum: number | null;
  productSlug: string;
  imageUrl: string | null;
  productName: string;
};

function isFuelleDireccion(p: SpecPartsProduct): boolean {
  const haystack = `${p.product ?? ""} ${p.description ?? ""}`.toLowerCase();
  return haystack.includes("fuelle") && haystack.includes("cremallera");
}

function isFuelleTransmision(p: SpecPartsProduct): boolean {
  const haystack = `${p.product ?? ""} ${p.description ?? ""}`.toLowerCase();
  return haystack.includes("fuelle") && haystack.includes("semieje");
}

function isTope(p: SpecPartsProduct): boolean {
  const haystack = `${p.product ?? ""} ${p.description ?? ""} ${p.category ?? ""}`.toLowerCase();
  return haystack.includes("tope") && !haystack.includes("fuelle");
}

function getBaseCode(code: string): string {
  const match = code.match(/^(\d+)/);
  return match ? match[1] : code;
}

export function getAttrValue(p: SpecPartsProduct, nameContains: string): string {
  return getAttrValues(p, nameContains)[0] ?? "";
}

/**
 * Devuelve TODOS los valores de attributes cuyo nombre matchea. Un mismo
 * producto puede tener múltiples attributes con el mismo nombre (ej. dos
 * entradas "Lado" cuando aplica a izquierdo y derecho a la vez).
 */
export function getAttrValues(p: SpecPartsProduct, nameContains: string): string[] {
  if (!p.attributes) return [];
  const needle = nameContains.toLowerCase();
  const out: string[] = [];
  for (const a of p.attributes) {
    const name = (a.name ?? "").toLowerCase();
    if (!name.includes(needle)) continue;
    const value = a.value ?? "";
    const unit = a.unit ?? "";
    const full = unit ? `${value} ${unit}` : value;
    if (full && !out.includes(full)) out.push(full);
  }
  return out;
}

/**
 * Ubicación del producto en el vehículo (ej. DELANTERO, TRASERO, LADO RUEDA).
 * SpecParts no tiene un nombre de campo consistente — a veces es "Ubicación",
 * a veces "Posición", "Eje", "Montaje". Probamos varios en orden y si ninguno
 * matchea, caemos al fallback de buscar cualquier attribute cuyo VALOR sea
 * DELANTERO/TRASERO.
 */
const LOCATION_ATTR_NAMES = ["ubicaci", "posici", "eje", "montaje"];
const LOCATION_VALUES = new Set([
  "DELANTERO",
  "DELANTERA",
  "TRASERO",
  "TRASERA",
  "LADO RUEDA",
  "LADO CAJA",
]);

export function getProductLocation(p: SpecPartsProduct): string {
  return getProductLocations(p)[0] ?? "";
}

export function getProductLocations(p: SpecPartsProduct): string[] {
  const out: string[] = [];
  for (const needle of LOCATION_ATTR_NAMES) {
    for (const v of getAttrValues(p, needle)) {
      if (!out.includes(v)) out.push(v);
    }
  }
  if (out.length > 0) return out;
  if (!p.attributes) return [];
  for (const a of p.attributes) {
    const val = (a.value ?? "").trim().toUpperCase();
    if (LOCATION_VALUES.has(val) && !out.includes(val)) out.push(val);
  }
  return out;
}

function toNumber(value: string): number | null {
  if (!value) return null;
  const n = parseFloat(value.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function buildMeasureRow(p: SpecPartsProduct, codeOverride?: string): MeasureRow {
  const diamMayor = getAttrValue(p, "boca mayor") || getAttrValue(p, "diámetro mayor");
  const diamMenor = getAttrValue(p, "boca menor") || getAttrValue(p, "diámetro menor");
  const largo = getAttrValue(p, "largo");
  return {
    code: codeOverride ?? p.code ?? "",
    diamMayor,
    diamMenor,
    largo,
    diamMayorNum: toNumber(diamMayor),
    diamMenorNum: toNumber(diamMenor),
    largoNum: toNumber(largo),
    productSlug: p.slug,
    imageUrl: p.pictures?.[0]?.image_url ?? null,
    productName: p.product || p.description || "",
  };
}

export function buildMeasureRows(
  products: CatalogProduct[],
  type: MeasureType,
): MeasureRow[] {
  if (type === "transmision") {
    const seen = new Set<string>();
    const rows: MeasureRow[] = [];
    for (const p of products) {
      if (!isFuelleTransmision(p)) continue;
      const base = getBaseCode(p.code);
      if (seen.has(base)) continue;
      seen.add(base);
      rows.push(buildMeasureRow(p, base));
    }
    return rows;
  }

  const predicate = type === "direccion" ? isFuelleDireccion : isTope;
  return products.filter(predicate).map((p) => buildMeasureRow(p));
}
