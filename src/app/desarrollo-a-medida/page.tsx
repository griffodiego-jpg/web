import type { Metadata } from "next";
import { PageHero, ComingSoon } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Desarrollo a medida",
  description:
    "Desarrollamos piezas de caucho moldeado a medida para distintas industrias.",
};

export default function DesarrolloAMedidaPage() {
  return (
    <>
      <PageHero
        title="Desarrollo a medida"
        lead="Diseñamos y fabricamos piezas de caucho moldeado a pedido, para las más diversas industrias."
        breadcrumb={[{ label: "Desarrollo a medida" }]}
      />
      <ComingSoon title="Proceso de desarrollo a medida" />
    </>
  );
}
