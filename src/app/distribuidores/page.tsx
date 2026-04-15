import type { Metadata } from "next";
import { ComingSoon } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Distribuidores",
  description: "Red de distribuidores oficiales de Griffo en Argentina.",
};

export default function DistribuidoresPage() {
  return <ComingSoon title="Red de distribuidores" />;
}
