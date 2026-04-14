import type { Metadata } from "next";
import { PageHero, ComingSoon } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Novedades",
  description: "Lanzamientos y novedades de Griffo.",
};

export default function NovedadesPage() {
  return (
    <>
      <PageHero
        title="Novedades"
        breadcrumb={[{ label: "Novedades" }]}
      />
      <ComingSoon title="Próximamente" />
    </>
  );
}
