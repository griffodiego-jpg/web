import type { Metadata } from "next";
import { PageHero, ComingSoon } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Distribuidores",
  description: "Red de distribuidores oficiales de Griffo en Argentina.",
};

export default function DistribuidoresPage() {
  return (
    <>
      <PageHero
        title="Distribuidores"
        lead="Encontrá nuestro distribuidor más cercano."
        breadcrumb={[{ label: "Distribuidores" }]}
      />
      <ComingSoon title="Red de distribuidores" />
    </>
  );
}
