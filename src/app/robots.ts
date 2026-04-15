import type { MetadataRoute } from "next";

const SITE_URL = "https://web-omega-wheat-25.vercel.app";

/**
 * robots.txt dinámico. Permite indexar todo el sitio público, excluyendo
 * endpoints de API internos, y apunta a sitemap.xml para que los
 * crawlers lo descubran automáticamente.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
