import type { NextConfig } from "next";

/**
 * Configuración de Next.js.
 *
 * Incluye:
 * - Security headers (X-Frame-Options, Permissions-Policy, etc.)
 * - Optimización de imágenes: AVIF + WebP automático
 * - Skeleton de redirects() para la migración a www.griffo.com.ar
 *   (completar con el inventario del sitio viejo — ver MIGRATION.md)
 */
const nextConfig: NextConfig = {
  // Incluir /public/downloads y /public/pdfs en el bundle de las
  // serverless functions para poder leer los directorios con
  // fs.readdirSync en runtime. Sin esto, /catalogo/download no puede
  // detectar qué archivos están realmente subidos vía GitHub.
  outputFileTracingIncludes: {
    "/catalogo/download": [
      "./public/downloads/**/*",
      "./public/pdfs/**/*",
    ],
    "/admin/descargas": [
      "./public/downloads/**/*",
      "./public/pdfs/**/*",
    ],
  },
  // Scroll al top cuando se navega entre páginas
  experimental: {
    scrollRestoration: false,
  },
  // Optimización de imágenes por Next/Image
  images: {
    // Prioridad de formatos: AVIF (mejor compresión) → WebP → original
    formats: ["image/avif", "image/webp"],
    // Tamaños responsive para srcset automático
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache de 30 días para imágenes optimizadas
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // Compression (Vercel ya usa Brotli/gzip, esto es redundante pero explícito)
  compress: true,

  // Strict mode para detectar patrones problemáticos en dev
  reactStrictMode: true,

  // Security headers aplicados a todas las rutas
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Evita que el browser adivine el content-type (XSS prevention)
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Clickjacking prevention (no permitir iframes desde otros sitios,
          // excepto desde el propio dominio — necesario para el mapa de Google)
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Información mínima sobre el referrer al navegar a otros sitios
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions-Policy: deshabilitamos APIs que el sitio no usa
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // DNS prefetch control
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },

  /**
   * Redirects 301 — preservan SEO cuando cambian URLs.
   *
   * SKELETON para la migración a www.griffo.com.ar. Cuando tengamos el
   * inventario de URLs del sitio viejo (desde Google Search Console),
   * agregamos acá las que no coincidan con el nuevo. Los slugs actuales
   * se mantienen iguales para no romper nada.
   *
   * Ver MIGRATION.md para el plan completo.
   */
  async redirects() {
    return [
      // Ejemplo (agregar cuando tengamos el inventario):
      // {
      //   source: "/blog/articulo-viejo",
      //   destination: "/novedades",
      //   permanent: true, // 301
      // },
    ];
  },
};

export default nextConfig;
