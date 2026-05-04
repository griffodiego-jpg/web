/**
 * URL canónica del sitio. Usada en sitemap, robots, JSON-LD, OpenGraph,
 * y cualquier lugar que necesite URL absolutas.
 *
 * En producción (Vercel scope Production) se define vía env var:
 *
 *   NEXT_PUBLIC_SITE_URL=https://www.griffo.com.ar
 *
 * En Vercel: Settings → Environment Variables → NEXT_PUBLIC_SITE_URL.
 *
 * Sin el prefijo `NEXT_PUBLIC_` la variable no se expone al browser.
 *
 * El default es el dominio canónico — si por alguna razón la env var
 * no está cargada en Vercel, el sitio sigue funcionando con la URL
 * correcta. (Antes de la migración apuntaba a la URL de preview de
 * Vercel; ya no hace falta).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.griffo.com.ar";
