import type { Metadata } from "next";
import { ComingSoon } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Descargas",
  description: "Descargá el catálogo oficial de productos Griffo en PDF.",
};

export default function DescargasPage() {
  return <ComingSoon title="Catálogos descargables" />;
}
