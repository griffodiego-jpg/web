import { getRedis } from "@/lib/kv";

/**
 * Storage de links de Mercado Libre por código de producto.
 *
 * La cliente sube un Excel con `código` + `link` desde
 * /admin/links-mercadolibre. Se persiste un JSON en Redis con el
 * mapa + metadata de la última actualización.
 *
 * Lectura: el catálogo público lo consulta para mostrar un botón
 * "Ver en Mercado Libre" por cada producto (gris/bloqueado si no
 * tiene link).
 */

const KEY = "mercadolibre:links:v1";

export type MercadoLibreLinks = {
  /** código → URL de ML. Códigos en mayúsculas (normalizados). */
  links: Record<string, string>;
  /** Timestamp ISO de la última subida. */
  updatedAt: string;
  /** Cuántos productos tenían link al subir. */
  totalWithLink: number;
  /** Cuántos productos venían sin link al subir. */
  totalWithoutLink: number;
};

function normalizeCodigo(s: string): string {
  return s.trim().toUpperCase();
}

/** Lee el mapa actual desde Redis. Devuelve null si nunca se subió nada. */
export async function readLinks(): Promise<MercadoLibreLinks | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<MercadoLibreLinks | string>(KEY);
    if (!raw) return null;
    const data =
      typeof raw === "string" ? (JSON.parse(raw) as MercadoLibreLinks) : raw;
    if (!data || typeof data !== "object" || !data.links) return null;
    return data;
  } catch (e) {
    console.error("[mercadolibre-links] error leyendo Redis:", e);
    return null;
  }
}

/** Atajo: solo el mapa código → link (uppercase keys). Vacío si no hay data. */
export async function readLinksMap(): Promise<Record<string, string>> {
  const data = await readLinks();
  return data?.links ?? {};
}

/** Busca el link para un código puntual. Case-insensitive. */
export async function getLinkForCodigo(codigo: string): Promise<string | null> {
  const map = await readLinksMap();
  return map[normalizeCodigo(codigo)] ?? null;
}

type SaveInput = {
  productos: { codigo: string; link: string | null }[];
};

/** Guarda el nuevo mapa, pisando lo anterior. */
export async function saveLinks(input: SaveInput): Promise<MercadoLibreLinks> {
  const redis = getRedis();
  if (!redis) {
    throw new Error(
      "Upstash Redis no configurado — no se pueden guardar los links de Mercado Libre.",
    );
  }
  const links: Record<string, string> = {};
  let totalWithLink = 0;
  let totalWithoutLink = 0;
  for (const p of input.productos) {
    const codigo = normalizeCodigo(p.codigo);
    if (!codigo) continue;
    if (p.link && /^https?:\/\//i.test(p.link)) {
      links[codigo] = p.link;
      totalWithLink++;
    } else {
      totalWithoutLink++;
    }
  }
  const payload: MercadoLibreLinks = {
    links,
    updatedAt: new Date().toISOString(),
    totalWithLink,
    totalWithoutLink,
  };
  await redis.set(KEY, JSON.stringify(payload));
  return payload;
}

/** Borra el mapa. Útil para resetear. */
export async function clearLinks(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.del(KEY);
}
