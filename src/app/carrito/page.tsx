import { CartContent } from "@/components/cart/CartContent";

export const metadata = {
  title: "Carrito",
  robots: { index: false, follow: false },
};

export default function CarritoPage() {
  return (
    <section className="max-w-5xl mx-auto px-5 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-[#0a2b3d]">Carrito</h1>
        <p className="text-sm text-gray-600 mt-1">
          Revisá y ajustá las cantidades antes de confirmar el pedido.
        </p>
      </header>
      <CartContent />
    </section>
  );
}
