import type { Metadata } from "next";
import { ComingSoon } from "@/components/PageHero";

export const metadata: Metadata = { title: "Lanzamientos" };

export default function LanzamientosPage() {
  return <ComingSoon title="Próximamente" />;
}
