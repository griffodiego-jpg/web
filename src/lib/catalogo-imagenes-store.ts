/**
 * Storage de imágenes visuales del catálogo (no son descargas — son
 * fotos que se muestran dentro de la web). Hoy tiene un solo slot:
 * "medidas-treboles". Diseñado extensible para sumar otros (ej.
 * ilustraciones de buscador por patente, medidas de dirección, etc.).
 *
 * Fuentes de verdad (en orden de precedencia):
 *   1. Override en Redis (hash `catalogo:imagenes`) — subido por el admin
 *      a Vercel Blob.
 *   2. Fallback estático en /public.
 *   3. undefined (el botón que la usa queda deshabilitado).
 */

import { existsSync } from "node:fs";
import path from "node:path";

import { getRedis } from "@/lib/kv";

const HASH_KEY = "catalogo:imagenes";

export type CatalogoImagenId = "medidas-treboles";

export type CatalogoImagenSlot = {
  id: CatalogoImagenId;
  title: string;
  description: string;
  recomendaciones: string[];
  /** Fallback estático en /public si no hay override en Redis. */
  fallback?: string;
};

export const CATALOGO_IMAGENES: CatalogoImagenSlot[] = [
  {
    id: "medidas-treboles",
    title: "Medidas de Tréboles",
    description:
      "Grilla visual con los códigos y medidas de cada trébol. Aparece en el catálogo, tab Medidas → Fuelle Transmisión → botón 'Medidas de Tréboles'.",
    recomendaciones: [
      "Formato: PNG o JPG",
      "Ancho mínimo: 1600 px",
      "Proporción horizontal (ej. 1800 × 1200 px, relación 3:2)",
      "Peso máximo: 2 MB",
      "Fondo blanco o transparente (si PNG)",
    ],
    fallback: "/catalogo/medidas-treboles.png",
  },
];

export async function readImageOverrides(): Promise<Record<string, string>> {
  const redis = getRedis();
  if (!redis) return {};
  try {
    const data = (await redis.hgetall(HASH_KEY)) as Record<string, string> | null;
    return data ?? {};
  } catch {
    return {};
  }
}

export async function setImageOverride(id: CatalogoImagenId, url: string): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  await redis.hset(HASH_KEY, { [id]: url });
}

export async function clearImageOverride(id: CatalogoImagenId): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  await redis.hdel(HASH_KEY, id);
}

/**
 * Resuelve la URL efectiva: override Redis primero, fallback estático
 * después (solo si el archivo existe en /public), undefined si no hay
 * ninguna de las dos. Así evitamos que la UI habilite botones que
 * terminan mostrando una imagen rota.
 */
export async function resolveImageUrl(id: CatalogoImagenId): Promise<string | undefined> {
  const overrides = await readImageOverrides();
  if (overrides[id]) return overrides[id];
  const slot = CATALOGO_IMAGENES.find((i) => i.id === id);
  if (!slot?.fallback) return undefined;
  const absPath = path.join(process.cwd(), "public", slot.fallback.replace(/^\//, ""));
  return existsSync(absPath) ? slot.fallback : undefined;
}
