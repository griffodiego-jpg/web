import { ArmarPedidoClient } from "@/components/cuenta/ArmarPedidoClient";

export const metadata = { title: "Armar pedido" };

export default function ArmarPedidoPage() {
  return (
    <div>
      <header className="mb-5">
        <h2 className="text-2xl font-black text-[#0a2b3d]">Armar pedido</h2>
        <p className="text-sm text-gray-600 mt-1">
          Tres formas de cargar productos al carrito. Todas suman al
          mismo carrito — cuando estés listo confirmás el pedido.
        </p>
      </header>
      <ArmarPedidoClient />
    </div>
  );
}
