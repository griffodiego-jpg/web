import type { Metadata } from "next";
import { PageHero, ComingSoon } from "@/components/PageHero";

export const metadata: Metadata = { title: "Lanzamientos" };

export default function LanzamientosPage() {
  return (
    <>
      <PageHero
        title="Lanzamientos"
        breadcrumb={[
          { label: "Novedades", href: "/novedades" },
          { label: "Lanzamientos" },
        ]}
      />
      <ComingSoon title="Próximamente" />
    </>
  );
}
