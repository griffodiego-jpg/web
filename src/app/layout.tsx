import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsappFloat } from "@/components/WhatsappFloat";
import { BackToTop } from "@/components/BackToTop";
import {
  OrganizationJsonLd,
  WebSiteJsonLd,
} from "@/components/StructuredData";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Griffo | Inicio",
    template: "%s | Griffo",
  },
  description:
    "Griffo es una empresa líder en la industria automotriz e industrial, especializada en la fabricación de piezas de caucho y repuestos para vehículos y maquinaria.",
  keywords: [
    "Griffo",
    "piezas de caucho",
    "industria automotriz",
    "industria industrial",
    "fuelles",
    "homocinéticas",
    "desarrollo a medida",
  ],
  authors: [{ name: "Griffo" }],
  openGraph: {
    title: "Griffo",
    description:
      "Empresa líder en la industria automotriz e industrial, especializada en la fabricación de piezas de caucho y repuestos para vehículos y maquinaria.",
    type: "website",
    locale: "es_AR",
    siteName: "Griffo",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/header-icon.svg`,
        width: 1200,
        height: 630,
        alt: "Griffo — Impulsamos Soluciones",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Griffo",
    title: "Griffo",
    description:
      "Empresa líder en piezas de caucho moldeado para la industria automotriz e industrial.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  manifest: "/manifest.webmanifest",
  // Search Console: la cliente tiene una Domain property de griffo.com.ar
  // verificada por DNS TXT record (NIC Argentina). No hace falta meta
  // tag — Domain property cubre www, subdominios y cualquier protocolo.
  // Bing Webmaster Tools: meta tag de verificación (msvalidate.01) para
  // destrabar SmartScreen tras la migración a Vercel.
  verification: {
    other: {
      "msvalidate.01": "DB5A983F86F9A46C51FDBFC0078F7841",
    },
  },
};

/**
 * Viewport config (Next 16 lo separa de metadata).
 * - themeColor: barra del browser en mobile (azul Griffo primary)
 * - width/initialScale: responsive correcto
 */
export const viewport: Viewport = {
  themeColor: "#00549f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="light" className="h-full antialiased">
      <head>
        {/*
          Montserrat — alternativa libre a Gotham. Se carga en tiempo de
          ejecución desde Google Fonts en el navegador del usuario.
          Si el cliente tiene licencia de Gotham, reemplazar por un
          @font-face local en globals.css apuntando a /fonts/.

          Pesos: 400 / 500 / 600 / 700 / 900 (extrabold/800 no se usa
          en el código — se sacó para reducir el peso del CSS).

          Estrategia de carga no-bloqueante: el `<link>` se inyecta con
          `media="print"` (no bloquea el render porque "no aplica" aún) y
          al terminar de descargar, el handler lo cambia a `media="all"`.
          Esto evita que Google Fonts bloquee el First Contentful Paint.
          `display=swap` evita el FOIT mostrando la fallback hasta que
          la web font esté disponible.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap"
          media="print"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.querySelector('link[rel="stylesheet"][media="print"][href*="Montserrat"]');if(l){l.addEventListener('load',function(){l.media='all';});}})();`,
          }}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap"
          />
        </noscript>
        {/* JSON-LD estructurado global (Organization + WebSite) */}
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="min-h-full flex flex-col bg-white text-foreground">
        {/*
          Google Analytics 4 — cargado con strategy="afterInteractive"
          para que no compita con el renderizado inicial. Antes estaba
          en el <head> con <script async>, lo que igual entraba al
          critical path. Con next/script, Next garantiza que se cargue
          después de la hidratación pero suficientemente pronto para
          capturar pageviews.
        */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FR8KN76LQ2"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FR8KN76LQ2');
          `}
        </Script>

        {/* Skip link para accesibilidad — aparece al tabular */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded focus:font-bold focus:shadow-lg"
        >
          Saltar al contenido principal
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsappFloat />
        <BackToTop />
      </body>
    </html>
  );
}
