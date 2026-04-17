/**
 * Cobertura de catálogo: matriz vehículo × tipo de producto.
 *
 * Objetivo: detectar huecos en el catálogo Griffo — saber para cada
 * combinación vehículo/posición/lado si hay producto o no.
 *
 * Limitación actual: el universo de vehículos lo saco de los productos
 * Griffo (todos los que aparecen en vehicles[]). Si Griffo no vende
 * NADA para un vehículo, no aparece en la matriz. Para cubrir el
 * parque automotor completo necesitamos una fuente externa (SpecParts
 * no expone ese endpoint en la API que usamos hoy).
 *
 * Columnas: 18 fijas, agrupadas en 3 sistemas (Dirección, Suspensión,
 * Transmisión). Espejan la estructura de Excel que usa Griffo
 * internamente para su control de cobertura.
 */

import type { CatalogProduct, SpecPartsProduct } from "@/types/specparts";
import { getAttrValues, getProductLocations } from "./utils";

const EXCLUDED_BRANDS = new Set(["AGRALE", "IVECO", "UNIVERSAL"]);

export type SistemaGrupo = "DIRECCIÓN" | "SUSPENSIÓN" | "TRANSMISIÓN";

export type Columna = {
  id: string;
  grupo: SistemaGrupo;
  label: string;
  /** Etiqueta larga para Excel. */
  labelLargo: string;
  matches: (p: SpecPartsProduct) => boolean;
};

export type VehiculoFila = {
  brand: string;
  masterModel: string;
};

export type CoverageMatrix = {
  columnas: Columna[];
  vehiculos: VehiculoFila[];
  /** Por `${brand}|${masterModel}` → por column.id → array de códigos. */
  celdas: Record<string, Record<string, string[]>>;
};

/* -------------------------------------------------------------------------- */
/*  Helpers de matching                                                        */
/* -------------------------------------------------------------------------- */

function isCat(p: SpecPartsProduct, needle: string): boolean {
  return (p.category || "").toUpperCase().includes(needle.toUpperCase());
}

function prodIncludes(p: SpecPartsProduct, needle: string): boolean {
  return (p.product || "").toUpperCase().includes(needle.toUpperCase());
}

function hasSide(p: SpecPartsProduct, needle: string): boolean {
  const sides = getAttrValues(p, "lado").map((v) => v.toUpperCase());
  return sides.some((s) => s.includes(needle.toUpperCase()));
}

function hasLocation(p: SpecPartsProduct, needle: string): boolean {
  const locs = getProductLocations(p).map((v) => v.toUpperCase());
  return locs.some((l) => l.includes(needle.toUpperCase()));
}

function isKit(p: SpecPartsProduct): boolean {
  return p.is_kit === 1 || prodIncludes(p, "KIT");
}

function isTope(p: SpecPartsProduct): boolean {
  return prodIncludes(p, "TOPE") && !prodIncludes(p, "FUELLE");
}

function isFuelleAmortiguador(p: SpecPartsProduct): boolean {
  return prodIncludes(p, "FUELLE") && prodIncludes(p, "AMORTIGUADOR");
}

function isKitFuelleTopeAmort(p: SpecPartsProduct): boolean {
  return (
    isKit(p) && prodIncludes(p, "TOPE") && prodIncludes(p, "FUELLE") &&
    (prodIncludes(p, "AMORTIGUADOR") || prodIncludes(p, "SUSPEN"))
  );
}

function isFuelleCremallera(p: SpecPartsProduct): boolean {
  return prodIncludes(p, "FUELLE") && prodIncludes(p, "CREMALLERA");
}

function isFuelleSemieje(p: SpecPartsProduct): boolean {
  return prodIncludes(p, "FUELLE") && prodIncludes(p, "SEMIEJE") && !isKit(p);
}

function isKitFuelleSemieje(p: SpecPartsProduct): boolean {
  return isKit(p) && prodIncludes(p, "FUELLE") && prodIncludes(p, "SEMIEJE");
}

/* -------------------------------------------------------------------------- */
/*  Columnas — 18 fijas                                                        */
/* -------------------------------------------------------------------------- */

export const COLUMNAS: Columna[] = [
  // DIRECCIÓN
  {
    id: "dir-del-der",
    grupo: "DIRECCIÓN",
    label: "Fuelle caja dir. Del · Der",
    labelLargo: "Fuelle de caja de dirección Griffo Delantero Derecho",
    matches: (p) => isFuelleCremallera(p) && hasSide(p, "DEREC"),
  },
  {
    id: "dir-del-izq",
    grupo: "DIRECCIÓN",
    label: "Fuelle caja dir. Del · Izq",
    labelLargo: "Fuelle de caja de dirección Griffo Delantero Izquierdo",
    matches: (p) => isFuelleCremallera(p) && hasSide(p, "IZQUIER"),
  },
  // SUSPENSIÓN — Kit fuelle + tope
  {
    id: "susp-kit-del-der",
    grupo: "SUSPENSIÓN",
    label: "Kit fuelle+tope amort. Del · Der",
    labelLargo: "Kit de fuelle y tope de amortiguador Griffo Delantero Derecho",
    matches: (p) => isKitFuelleTopeAmort(p) && hasLocation(p, "DELANT") && hasSide(p, "DEREC"),
  },
  {
    id: "susp-kit-del-izq",
    grupo: "SUSPENSIÓN",
    label: "Kit fuelle+tope amort. Del · Izq",
    labelLargo: "Kit de fuelle y tope de amortiguador Griffo Delantero Izquierdo",
    matches: (p) => isKitFuelleTopeAmort(p) && hasLocation(p, "DELANT") && hasSide(p, "IZQUIER"),
  },
  {
    id: "susp-kit-tra-der",
    grupo: "SUSPENSIÓN",
    label: "Kit fuelle+tope amort. Tra · Der",
    labelLargo: "Kit de fuelle y tope de amortiguador Griffo Trasero Derecho",
    matches: (p) => isKitFuelleTopeAmort(p) && hasLocation(p, "TRASER") && hasSide(p, "DEREC"),
  },
  {
    id: "susp-kit-tra-izq",
    grupo: "SUSPENSIÓN",
    label: "Kit fuelle+tope amort. Tra · Izq",
    labelLargo: "Kit de fuelle y tope de amortiguador Griffo Trasero Izquierdo",
    matches: (p) => isKitFuelleTopeAmort(p) && hasLocation(p, "TRASER") && hasSide(p, "IZQUIER"),
  },
  // SUSPENSIÓN — Tope solo
  {
    id: "susp-tope-del-der",
    grupo: "SUSPENSIÓN",
    label: "Tope amort. Del · Der",
    labelLargo: "Tope de amortiguador de suspensión Griffo Delantero Derecho",
    matches: (p) => isTope(p) && hasLocation(p, "DELANT") && hasSide(p, "DEREC"),
  },
  {
    id: "susp-tope-del-izq",
    grupo: "SUSPENSIÓN",
    label: "Tope amort. Del · Izq",
    labelLargo: "Tope de amortiguador de suspensión Griffo Delantero Izquierdo",
    matches: (p) => isTope(p) && hasLocation(p, "DELANT") && hasSide(p, "IZQUIER"),
  },
  {
    id: "susp-tope-tra-der",
    grupo: "SUSPENSIÓN",
    label: "Tope amort. Tra · Der",
    labelLargo: "Tope de amortiguador de suspensión Griffo Trasero Derecho",
    matches: (p) => isTope(p) && hasLocation(p, "TRASER") && hasSide(p, "DEREC"),
  },
  {
    id: "susp-tope-tra-izq",
    grupo: "SUSPENSIÓN",
    label: "Tope amort. Tra · Izq",
    labelLargo: "Tope de amortiguador de suspensión Griffo Trasero Izquierdo",
    matches: (p) => isTope(p) && hasLocation(p, "TRASER") && hasSide(p, "IZQUIER"),
  },
  // TRANSMISIÓN — Fuelle semieje
  {
    id: "trans-fs-der-caja",
    grupo: "TRANSMISIÓN",
    label: "Fuelle semieje · Der · Caja",
    labelLargo: "Fuelle de semieje de transmisión Griffo Delantero Derecho Lado Caja",
    matches: (p) => isFuelleSemieje(p) && hasSide(p, "DEREC") && hasLocation(p, "CAJA"),
  },
  {
    id: "trans-fs-der-rueda",
    grupo: "TRANSMISIÓN",
    label: "Fuelle semieje · Der · Rueda",
    labelLargo: "Fuelle de semieje de transmisión Griffo Delantero Derecho Lado Rueda",
    matches: (p) => isFuelleSemieje(p) && hasSide(p, "DEREC") && hasLocation(p, "RUEDA"),
  },
  {
    id: "trans-fs-izq-caja",
    grupo: "TRANSMISIÓN",
    label: "Fuelle semieje · Izq · Caja",
    labelLargo: "Fuelle de semieje de transmisión Griffo Delantero Izquierdo Lado Caja",
    matches: (p) => isFuelleSemieje(p) && hasSide(p, "IZQUIER") && hasLocation(p, "CAJA"),
  },
  {
    id: "trans-fs-izq-rueda",
    grupo: "TRANSMISIÓN",
    label: "Fuelle semieje · Izq · Rueda",
    labelLargo: "Fuelle de semieje de transmisión Griffo Delantero Izquierdo Lado Rueda",
    matches: (p) => isFuelleSemieje(p) && hasSide(p, "IZQUIER") && hasLocation(p, "RUEDA"),
  },
  // TRANSMISIÓN — Kit fuelle semieje
  {
    id: "trans-kfs-der-caja",
    grupo: "TRANSMISIÓN",
    label: "Kit fuelle semieje · Der · Caja",
    labelLargo: "Kit de fuelle de semieje de transmisión Griffo Delantero Derecho Lado Caja",
    matches: (p) => isKitFuelleSemieje(p) && hasSide(p, "DEREC") && hasLocation(p, "CAJA"),
  },
  {
    id: "trans-kfs-der-rueda",
    grupo: "TRANSMISIÓN",
    label: "Kit fuelle semieje · Der · Rueda",
    labelLargo: "Kit de fuelle de semieje de transmisión Griffo Delantero Derecho Lado Rueda",
    matches: (p) => isKitFuelleSemieje(p) && hasSide(p, "DEREC") && hasLocation(p, "RUEDA"),
  },
  {
    id: "trans-kfs-izq-caja",
    grupo: "TRANSMISIÓN",
    label: "Kit fuelle semieje · Izq · Caja",
    labelLargo: "Kit de fuelle de semieje de transmisión Griffo Delantero Izquierdo Lado Caja",
    matches: (p) => isKitFuelleSemieje(p) && hasSide(p, "IZQUIER") && hasLocation(p, "CAJA"),
  },
  {
    id: "trans-kfs-izq-rueda",
    grupo: "TRANSMISIÓN",
    label: "Kit fuelle semieje · Izq · Rueda",
    labelLargo: "Kit de fuelle de semieje de transmisión Griffo Delantero Izquierdo Lado Rueda",
    matches: (p) => isKitFuelleSemieje(p) && hasSide(p, "IZQUIER") && hasLocation(p, "RUEDA"),
  },
];

export function vehiculoKey(brand: string, masterModel: string): string {
  return `${brand.toUpperCase()}|${masterModel.toUpperCase()}`;
}

/* -------------------------------------------------------------------------- */
/*  Build                                                                      */
/* -------------------------------------------------------------------------- */

export function buildCoverageMatrix(products: CatalogProduct[]): CoverageMatrix {
  const vehiculosSet = new Map<string, VehiculoFila>();
  const celdas: Record<string, Record<string, string[]>> = {};

  for (const p of products) {
    if (!p.vehicles?.length) continue;
    const matchingCols = COLUMNAS.filter((c) => c.matches(p));
    if (matchingCols.length === 0) continue;

    for (const v of p.vehicles) {
      const brand = (v.brand || "").toUpperCase().trim();
      const model = (v.master_model || v.model || "").toUpperCase().trim();
      if (!brand || !model || EXCLUDED_BRANDS.has(brand)) continue;

      const key = vehiculoKey(brand, model);
      if (!vehiculosSet.has(key)) {
        vehiculosSet.set(key, { brand, masterModel: model });
        celdas[key] = {};
      }

      for (const col of matchingCols) {
        if (!celdas[key][col.id]) celdas[key][col.id] = [];
        if (!celdas[key][col.id].includes(p.code)) {
          celdas[key][col.id].push(p.code);
        }
      }
    }
  }

  const vehiculos = Array.from(vehiculosSet.values()).sort((a, b) => {
    const byBrand = a.brand.localeCompare(b.brand, "es");
    if (byBrand !== 0) return byBrand;
    return a.masterModel.localeCompare(b.masterModel, "es");
  });

  return { columnas: COLUMNAS, vehiculos, celdas };
}

/* -------------------------------------------------------------------------- */
/*  Export CSV                                                                 */
/* -------------------------------------------------------------------------- */

function csvEscape(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCoverageCsv(matrix: CoverageMatrix): string {
  const { columnas, vehiculos, celdas } = matrix;
  const header = ["Marca", "Modelo", ...columnas.map((c) => `${c.grupo} — ${c.labelLargo}`)];
  const rows: string[] = [header.map(csvEscape).join(",")];
  for (const v of vehiculos) {
    const key = vehiculoKey(v.brand, v.masterModel);
    const row = [v.brand, v.masterModel];
    for (const col of columnas) {
      const skus = celdas[key]?.[col.id] ?? [];
      row.push(skus.join(" / "));
    }
    rows.push(row.map(csvEscape).join(","));
  }
  // BOM para que Excel reconozca UTF-8 con acentos al abrir el CSV.
  return "\uFEFF" + rows.join("\n");
}
