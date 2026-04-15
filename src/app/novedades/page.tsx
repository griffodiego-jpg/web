import type { Metadata } from "next";
import { ComingSoon } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Novedades",
  description: "Lanzamientos y novedades de Griffo.",
};

export default function NovedadesPage() {
  return <ComingSoon title="Próximamente" />;
}
