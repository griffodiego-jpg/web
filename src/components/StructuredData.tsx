import { siteConfig } from "@/lib/site-config";
import { SITE_URL } from "@/lib/site-url";

/**
 * Componentes server-rendered para inyectar JSON-LD estructurado
 * (Schema.org) en las páginas. Google lo usa para rich snippets,
 * knowledge panels y mejor comprensión del contenido.
 *
 * Cada componente renderiza un <script type="application/ld+json">
 * con los datos correspondientes. Todos son server components puros.
 */

/** JSON-LD base con los datos de Griffo (Organization + LocalBusiness). */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    legalName: "Griffo SA",
    url: SITE_URL,
    logo: `${SITE_URL}/header-icon.svg`,
    description: siteConfig.description,
    foundingDate: "1968",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      postalCode: siteConfig.address.postalCode,
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.region,
      addressCountry: siteConfig.address.country,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+54-11-4454-8401",
      contactType: "customer service",
      areaServed: "AR",
      availableLanguage: ["Spanish"],
    },
    sameAs: [siteConfig.socials.facebook, siteConfig.socials.youtube],
  };
  return <JsonLdScript data={data} />;
}

/** LocalBusiness con horarios y geo. Va en /contacto para rich results. */
export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}#localbusiness`,
    name: siteConfig.name,
    image: `${SITE_URL}/header-icon.svg`,
    telephone: "+54-11-4454-8401",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      postalCode: siteConfig.address.postalCode,
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.region,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -34.6909,
      longitude: -58.5248,
    },
    url: SITE_URL,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
    priceRange: "$$",
  };
  return <JsonLdScript data={data} />;
}

/** Manufacturer — va en /empresa y /desarrollo-a-medida. */
export function ManufacturerJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Manufacturer",
    name: siteConfig.name,
    url: SITE_URL,
    logo: `${SITE_URL}/header-icon.svg`,
    description:
      "Fabricante argentino de piezas de caucho moldeado para la industria automotriz e industrial.",
    foundingDate: "1968",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      postalCode: siteConfig.address.postalCode,
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.region,
      addressCountry: siteConfig.address.country,
    },
  };
  return <JsonLdScript data={data} />;
}

/** Product JSON-LD — para cada página de detalle de producto. */
export function ProductJsonLd({
  name,
  description,
  image,
  sku,
  url,
}: {
  name: string;
  description: string;
  image: string;
  sku?: string;
  url: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image.startsWith("http") ? image : `${SITE_URL}${image}`,
    sku,
    brand: {
      "@type": "Brand",
      name: "Griffo",
    },
    manufacturer: {
      "@type": "Organization",
      name: "Griffo",
      url: SITE_URL,
    },
    url: url.startsWith("http") ? url : `${SITE_URL}${url}`,
  };
  return <JsonLdScript data={data} />;
}

/** BreadcrumbList — mejora rich snippets en las SERPs. */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { label: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
  return <JsonLdScript data={data} />;
}

/** WebSite con SearchAction — indica a Google el nombre del sitio + home. */
export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: SITE_URL,
    description: siteConfig.description,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: `${SITE_URL}/header-icon.svg`,
    },
    inLanguage: "es-AR",
  };
  return <JsonLdScript data={data} />;
}

/** Helper: renderiza un <script> JSON-LD de forma segura. */
function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
