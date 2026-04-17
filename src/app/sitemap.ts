import type { MetadataRoute } from "next";
import { getFeaturedSlug } from "@/data/featured-products";
import { listCatalog } from "@/lib/api/specparts";
import { navigation } from "@/lib/site-config";
import { SITE_URL } from "@/lib/site-url";

/**
 * Sitemap dinámico. Incluye:
 * - Home + páginas institucionales
 * - Productos destacados (expandidos desde siteConfig.navigation)
 * - Catálogo + todos los slugs de productos del catálogo (via SpecParts)
 *
 * Si el catálogo falla al bajarse, el sitemap degrada a las rutas estáticas.
 */

export const revalidate = 1800;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/empresa`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/catalogo`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${SITE_URL}/productos`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITE_URL}/desarrollo-a-medida`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/distribuidores`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/garantia`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE_URL}/catalogo/download`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/presentacion`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const productosDestacados = navigation.find((i) => i.label === "Productos destacados")?.children ?? [];
  const destacadosRoutes: MetadataRoute.Sitemap = productosDestacados.map((p) => ({
    url: `${SITE_URL}${p.href}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  let catalogRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await listCatalog();
    // Excluimos los productos destacados del sitemap del catálogo — viven en
    // /productos/[slug] y ya se listan como `destacadosRoutes`.
    catalogRoutes = products
      .filter((p) => !getFeaturedSlug(p.code))
      .map((p) => ({
        url: `${SITE_URL}/catalogo/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
  } catch {
    // Silencio: si SpecParts no responde, el sitemap mantiene las rutas estáticas.
  }

  return [...staticRoutes, ...destacadosRoutes, ...catalogRoutes];
}
