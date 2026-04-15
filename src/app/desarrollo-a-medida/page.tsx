import type { Metadata } from "next";
import { ComingSoon } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Desarrollo a medida",
  description:
    "Desarrollamos piezas de caucho moldeado a medida para distintas industrias.",
};

export default function DesarrolloAMedidaPage() {
  return <ComingSoon title="Proceso de desarrollo a medida" />;
}
