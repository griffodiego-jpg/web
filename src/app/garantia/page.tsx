import type { Metadata } from "next";
import { PageHero, ComingSoon } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Garantía",
  description:
    "2 años de garantía en todos los productos Griffo. Conocé las condiciones.",
};

export default function GarantiaPage() {
  return (
    <>
      <PageHero
        title="Garantía"
        lead="2 años de garantía en todos nuestros productos."
        breadcrumb={[{ label: "Garantía" }]}
      />
      <ComingSoon title="Condiciones de garantía" />
    </>
  );
}
