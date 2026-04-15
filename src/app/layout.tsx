import type { Metadata } from "next";
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
  verification: {
    // TODO: agregar verification tokens cuando se registre en Search Console
  },
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
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD estructurado global (Organization + WebSite) */}
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="min-h-full flex flex-col bg-white text-foreground">
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
