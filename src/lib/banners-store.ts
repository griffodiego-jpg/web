import { getRedis } from "@/lib/kv";

/**
 * Storage de banners del carousel del home. Lista ordenada en Redis
 * bajo `banners:list` (JSON array). Cada banner tiene un tipo
 * (imagen / video / patente) y metadata.
 *
 * El tipo "patente" es el componente built-in `BuscadorPatenteBanner`
 * — no tiene archivo subido. Los de tipo imagen/video guardan el URL
 * público de Vercel Blob + título/subtítulo/CTA opcionales.
 *
 * Si la lista está vacía, el home cae al banner de patente por default
 * (comportamiento pre-carousel).
 */

const KEY = "banners:list";

export type BannerTipo = "imagen" | "video" | "patente";

export type Banner = {
  id: string;
  tipo: BannerTipo;
  activo: boolean;
  /** Orden — menor primero. Se recalcula cuando el admin reordena. */
  orden: number;
  /** Para tipo imagen/video — URL pública del archivo en Vercel Blob. */
  fileUrl?: string;
  /** Texto superpuesto (opcional). */
  titulo?: string;
  subtitulo?: string;
  /** Botón de CTA opcional. */
  ctaText?: string;
  ctaHref?: string;
};

/** Genera un id único simple (sin deps). */
export function generateBannerId(): string {
  return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Lee todos los banners, ordenados por `orden` asc. */
export async function listBanners(): Promise<Banner[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const raw = await redis.get<Banner[] | string>(KEY);
    if (!raw) return [];
    const arr: Banner[] =
      typeof raw === "string" ? (JSON.parse(raw) as Banner[]) : raw;
    if (!Array.isArray(arr)) return [];
    return arr.slice().sort((a, b) => a.orden - b.orden);
  } catch (e) {
    console.error("[banners] error leyendo:", e);
    return [];
  }
}

/** Lee solo los activos (para renderizar en el home). */
export async function listActiveBanners(): Promise<Banner[]> {
  const all = await listBanners();
  return all.filter((b) => b.activo);
}

async function writeBanners(list: Banner[]): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  // Renumeramos orden para evitar gaps/duplicados.
  const normalized = list.map((b, i) => ({ ...b, orden: i }));
  await redis.set(KEY, JSON.stringify(normalized));
}

/** Crea o actualiza un banner (upsert por id). */
export async function saveBanner(
  banner: Partial<Banner> & { id?: string }
): Promise<Banner> {
  const list = await listBanners();
  if (banner.id) {
    const idx = list.findIndex((b) => b.id === banner.id);
    if (idx === -1) throw new Error("Banner no encontrado");
    const merged: Banner = { ...list[idx], ...banner, id: list[idx].id };
    list[idx] = merged;
    await writeBanners(list);
    return merged;
  }
  // Nuevo: lo agregamos al final.
  const nuevo: Banner = {
    id: generateBannerId(),
    tipo: (banner.tipo as BannerTipo) ?? "imagen",
    activo: banner.activo ?? true,
    orden: list.length,
    fileUrl: banner.fileUrl,
    titulo: banner.titulo,
    subtitulo: banner.subtitulo,
    ctaText: banner.ctaText,
    ctaHref: banner.ctaHref,
  };
  list.push(nuevo);
  await writeBanners(list);
  return nuevo;
}

export async function deleteBanner(id: string): Promise<void> {
  const list = await listBanners();
  const filtered = list.filter((b) => b.id !== id);
  if (filtered.length === list.length) return;
  await writeBanners(filtered);
}

/** Reordena la lista entera según el array de ids provisto. */
export async function reorderBanners(ids: string[]): Promise<void> {
  const list = await listBanners();
  const byId = new Map(list.map((b) => [b.id, b]));
  const ordered: Banner[] = [];
  for (const id of ids) {
    const b = byId.get(id);
    if (b) ordered.push(b);
  }
  // Si hay banners que no vinieron en el array (edge case), los agregamos al final.
  for (const b of list) {
    if (!ids.includes(b.id)) ordered.push(b);
  }
  await writeBanners(ordered);
}
