import type { Metadata } from "next";
import { PageHero, ComingSoon } from "@/components/PageHero";

export const metadata: Metadata = { title: "Nuevas aplicaciones" };

export default function AplicacionesPage() {
  return (
    <>
      <PageHero
        title="Nuevas aplicaciones"
        breadcrumb={[
          { label: "Novedades", href: "/novedades" },
          { label: "Nuevas aplicaciones" },
        ]}
      />
      <ComingSoon title="Próximamente" />
    </>
  );
}
