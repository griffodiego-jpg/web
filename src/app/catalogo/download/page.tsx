import type { Metadata } from "next";
import { PageHero, ComingSoon } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Descargas",
  description: "Descargá el catálogo oficial de productos Griffo en PDF.",
};

export default function DescargasPage() {
  return (
    <>
      <PageHero
        title="Descargas"
        lead="Catálogo y documentación técnica."
        breadcrumb={[{ label: "Descargas" }]}
      />
      <ComingSoon title="Catálogos descargables" />
    </>
  );
}
