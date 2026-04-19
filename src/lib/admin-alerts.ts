import { distribuidores } from "@/data/distribuidores";
import { productosDetalle } from "@/data/productos";
import { SITE_URL } from "@/lib/site-url";

/**
 * Alertas de configuración y contenido — problemas que requieren
 * acción de la cliente o admin. Son cosas que no rompen nada por sí
 * solas pero convienen resolver.
 *
 * Se evalúan en el momento del render del dashboard. Cada alerta
 * tiene severidad (`info` | `warn` | `error`) y opcionalmente un
 * link a la página del admin donde se resuelve.
 */

export type Severity = "info" | "warn" | "error";

export type Alert = {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  /** Ruta a la página donde se puede resolver (si aplica). */
  actionHref?: string;
  actionLabel?: string;
};

export function findConfigAlerts(): Alert[] {
  const alerts: Alert[] = [];

  // --- Env vars críticas ---
  if (!process.env.ADMIN_PASSWORD) {
    alerts.push({
      id: "admin-password",
      severity: "error",
      title: "ADMIN_PASSWORD no configurada",
      description:
        "El admin no puede autenticar logins. Definir la env var en Vercel → Settings → Environment Variables.",
    });
  }

  if (!process.env.SPECPARTS_CLIENT_ID || !process.env.SPECPARTS_CLIENT_SECRET) {
    alerts.push({
      id: "specparts-creds",
      severity: "error",
      title: "Credenciales de SpecParts faltantes",
      description:
        "El catálogo y las novedades no funcionan. Definir SPECPARTS_CLIENT_ID y SPECPARTS_CLIENT_SECRET en Vercel.",
    });
  }

  if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) {
    alerts.push({
      id: "redis-creds",
      severity: "error",
      title: "Upstash Redis no configurado",
      description:
        "Sesiones del admin, leads, descargas y novedades dependen de Redis. Conectar Upstash Redis en Vercel → Storage.",
    });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    alerts.push({
      id: "blob-creds",
      severity: "warn",
      title: "Vercel Blob no configurado",
      description:
        "Los uploads desde /admin/descargas no van a funcionar. Conectar Vercel Blob en Storage → Create.",
    });
  }

  if (!process.env.RESEND_API_KEY) {
    alerts.push({
      id: "resend-creds",
      severity: "error",
      title: "RESEND_API_KEY faltante",
      description:
        "Los forms del sitio no pueden enviar email. Los leads quedan en Redis igual pero no se notifica por mail.",
    });
  }

  // --- Configuración del sitio ---
  if (SITE_URL.includes("vercel.app")) {
    alerts.push({
      id: "site-url",
      severity: "info",
      title: "El sitio sigue apuntando a la URL de preview",
      description:
        "Cuando migres el dominio, definí NEXT_PUBLIC_SITE_URL=https://www.griffo.com.ar en Vercel (Production scope). Sitemap, canonicals y OpenGraph se actualizan automáticamente.",
    });
  }

  // --- Resend domain verification ---
  // Esta la dejamos siempre que haya API key — la cliente tiene que
  // verificar el dominio. No podemos chequear programáticamente sin
  // llamar a la API de Resend, así que es un recordatorio persistente.
  if (process.env.RESEND_API_KEY) {
    alerts.push({
      id: "resend-domain",
      severity: "warn",
      title: "Verificar dominio en Resend",
      description:
        "Hoy los mails salen desde onboarding@resend.dev. Una vez verificado griffo.com.ar en Resend, cambiar el sender a contacto@griffo.com.ar en los route handlers.",
    });
  }

  // --- Contenido ---
  const destacadosSinCta = Object.entries(productosDetalle).filter(
    ([, d]) => !d.cta?.url,
  );
  if (destacadosSinCta.length > 0) {
    alerts.push({
      id: "destacados-sin-ml",
      severity: "warn",
      title: `${destacadosSinCta.length} producto${destacadosSinCta.length === 1 ? "" : "s"} destacado${destacadosSinCta.length === 1 ? "" : "s"} sin link de MercadoLibre`,
      description: destacadosSinCta
        .map(([slug]) => slug)
        .join(", "),
      actionHref: "/admin/productos",
      actionLabel: "Ir a productos destacados",
    });
  }

  const distrSinEmail = distribuidores.filter((d) => !d.email?.trim());
  if (distrSinEmail.length > 0) {
    alerts.push({
      id: "distr-sin-email",
      severity: "info",
      title: `${distrSinEmail.length} distribuidor${distrSinEmail.length === 1 ? "" : "es"} sin email`,
      description:
        "Algunos distribuidores no tienen email cargado. La página pública no muestra ese contacto.",
      actionHref: "/admin/distribuidores",
      actionLabel: "Ver distribuidores",
    });
  }

  return alerts;
}
