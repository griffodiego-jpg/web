/**
 * URL canónica del sitio. Usada en sitemap, robots, JSON-LD, OpenGraph,
 * y cualquier lugar que necesite URL absolutas.
 *
 * En local y staging usa el valor por default (el de Vercel).
 * En producción (dominio real) se define vía variable de entorno:
 *
 *   NEXT_PUBLIC_SITE_URL=https://www.griffo.com.ar
 *
 * En Vercel: Settings → Environment Variables → NEXT_PUBLIC_SITE_URL.
 * Se define en el scope "Production" cuando esté listo el switch.
 *
 * Sin el prefijo `NEXT_PUBLIC_` la variable no se expone al browser.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://web-omega-wheat-25.vercel.app";
