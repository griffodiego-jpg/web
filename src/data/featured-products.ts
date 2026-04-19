/**
 * Mapeo entre productos destacados (con landing propia en /productos/[slug])
 * y sus códigos de SpecParts.
 *
 * Fuente: src/data/productos.ts — los códigos están documentados en cada entrada
 * de `productosDetalle`. Este archivo los indexa para acceso O(1) en runtime.
 *
 * Regla: si el código de un producto del catálogo matchea con alguno de estos,
 * el link del detalle lo dirige a /productos/<slug> en vez de /catalogo/<slug>.
 * Así evitamos duplicar la landing del destacado y ganamos la UX rica de esa
 * página (YouTube, beneficios, presentaciones, kit contiene, CTA a ML directo).
 */

const RAW_MAP: Record<string, string[]> = {
  "maquina-montadora-de-fuelles": ["54-122-03"],
  "kit-de-fuelles-universales-para-homocineticas": ["950-32B", "950-32", "951-32B", "951-32"],
  "extractor-de-juntas-homocineticas": ["54-225-00"],
  "pinza-para-abrazaderas": ["54-224-05"],
  "fuelle-universal-de-direccion": ["955-32"],
  "kit-de-proteccion-para-suspension-deportiva": ["953-35"],
  "abrazaderas-universales": ["AB 25-40", "AB 40-122"],
};

function normalize(code: string): string {
  return code.toUpperCase().replace(/\s+/g, "").trim();
}

const codeToSlug = new Map<string, string>();
for (const [slug, codes] of Object.entries(RAW_MAP)) {
  for (const code of codes) {
    codeToSlug.set(normalize(code), slug);
  }
}

export function getFeaturedSlug(code: string | null | undefined): string | null {
  if (!code) return null;
  return codeToSlug.get(normalize(code)) ?? null;
}

export function isFeaturedCode(code: string | null | undefined): boolean {
  return getFeaturedSlug(code) !== null;
}
