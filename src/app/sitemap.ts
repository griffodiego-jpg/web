import type { MetadataRoute } from "next";
import { navigation } from "@/lib/site-config";
import { SITE_URL } from "@/lib/site-url";

/**
 * Sitemap dinámico. Lista todas las rutas públicas del sitio:
 * - Home
 * - Páginas institucionales (Empresa, Distribuidores, Garantía, etc.)
 * - Todos los productos destacados (expandidos desde siteConfig.navigation)
 *
 * Se actualiza automáticamente si se agregan items al navigation.
 * Excluye las rutas externas (Catálogo) y las que no queremos indexar.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/empresa`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/productos`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/desarrollo-a-medida`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/distribuidores`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/garantia`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contacto`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/catalogo/download`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Productos destacados (expandidos desde el nav)
  const productos =
    navigation.find((i) => i.label === "Productos destacados")?.children ?? [];
  const productRoutes: MetadataRoute.Sitemap = productos.map((p) => ({
    url: `${SITE_URL}${p.href}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
