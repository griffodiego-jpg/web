import { PerfilForm } from "@/components/cuenta/PerfilForm";
import { mockCurrentClient } from "@/data/mock-b2b";

export const metadata = { title: "Mi perfil" };

export default function PerfilPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#0a2b3d]">Mi perfil</h2>
        <p className="text-sm text-gray-600 mt-1">
          Ajustá tus datos de acceso y cómo querés ver los precios en el
          catálogo.
        </p>
      </div>
      <PerfilForm
        initialEmail={mockCurrentClient.email}
        clientName={mockCurrentClient.name}
        clientCode={mockCurrentClient.client_id}
      />
    </div>
  );
}
