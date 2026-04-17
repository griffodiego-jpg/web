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
    // Hosts externos permitidos (Next/Image las optimiza on-the-fly y cachea)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "production-specparts-search-api-images-bucket.s3.amazonaws.com",
      },
      // Otros buckets de SpecParts — por si cambian la infra.
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "specparts-*.s3.*.amazonaws.com",
      },
    ],
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
   * Redirects 301 — preservan SEO cuando cambian URLs y mantienen los
   * QRs impresos en packaging que apuntan a URLs viejas.
   *
   * IMPORTANTE: estos slugs están físicamente impresos en cajas de
   * producto. No cambiarlos nunca. Si llega un QR roto, agregar el
   * redirect acá.
   */
  async redirects() {
    return [
      // QRs de packaging del sitio viejo — sin /productos/ prefix.
      {
        source: "/maquina-montadora-de-fuelles",
        destination: "/productos/maquina-montadora-de-fuelles",
        permanent: true,
      },
      {
        source: "/kit-de-fuelles-universales-para-homocineticas",
        destination: "/productos/kit-de-fuelles-universales-para-homocineticas",
        permanent: true,
      },
      {
        source: "/kit-de-proteccion-para-suspension-deportiva",
        destination: "/productos/kit-de-proteccion-para-suspension-deportiva",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
