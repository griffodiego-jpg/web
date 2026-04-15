import type { Metadata } from "next";
import { ComingSoon } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Garantía",
  description:
    "2 años de garantía en todos los productos Griffo. Conocé las condiciones.",
};

export default function GarantiaPage() {
  return <ComingSoon title="Condiciones de garantía" />;
}
