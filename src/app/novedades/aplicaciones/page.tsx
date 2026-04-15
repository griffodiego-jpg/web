import type { Metadata } from "next";
import { ComingSoon } from "@/components/PageHero";

export const metadata: Metadata = { title: "Nuevas aplicaciones" };

export default function AplicacionesPage() {
  return <ComingSoon title="Próximamente" />;
}
