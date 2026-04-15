import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsappFloat } from "@/components/WhatsappFloat";
import { BackToTop } from "@/components/BackToTop";

export const metadata: Metadata = {
  metadataBase: new URL("https://griffo.com.ar"),
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
  ],
  authors: [{ name: "Griffo" }],
  openGraph: {
    title: "Griffo",
    description:
      "Empresa líder en la industria automotriz e industrial, especializada en la fabricación de piezas de caucho y repuestos para vehículos y maquinaria.",
    type: "website",
    locale: "es_AR",
    siteName: "Griffo",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Griffo",
  },
  robots: { index: true, follow: true },
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
      </head>
      <body className="min-h-full flex flex-col bg-white text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsappFloat />
        <BackToTop />
      </body>
    </html>
  );
}
