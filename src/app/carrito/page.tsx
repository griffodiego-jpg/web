import { CartContent } from "@/components/cart/CartContent";
import { getImpersonatedCode } from "@/lib/b2b/impersonation";
import { loadClientByCode } from "@/lib/b2b/client-loader";
import type { BejermanClient } from "@/types/bejerman";

export const metadata = {
  title: "Carrito",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CarritoPage() {
  // Si el admin está impersonando, resolvemos el cliente real desde el
  // ERP y se lo pasamos a CartContent. Sin esto, el carrito mostraría
  // las sucursales del mock, que pueden no existir para el cliente
  // impersonado.
  const code = await getImpersonatedCode();
  let impersonatedClient: BejermanClient | null = null;
  if (code) {
    impersonatedClient = await loadClientByCode(code);
  }

  return (
    <section className="max-w-5xl mx-auto px-5 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-[#0a2b3d]">Carrito</h1>
        <p className="text-sm text-gray-600 mt-1">
          Revisá y ajustá las cantidades antes de confirmar el pedido.
        </p>
      </header>
      <CartContent impersonatedClient={impersonatedClient} />
    </section>
  );
}
