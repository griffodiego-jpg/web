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
      <body className="min-h-full flex flex-col bg-white text-foreground">
        <Header />
        <main className="flex-1 pt-14">{children}</main>
        <Footer />
        <WhatsappFloat />
        <BackToTop />
      </body>
    </html>
  );
}
