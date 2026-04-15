import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escribinos tu consulta. Estamos en La Tablada, Provincia de Buenos Aires.",
};

export default function ContactoPage() {
  return (
    <>
      <section className="container mx-auto max-w-6xl px-5 pt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Datos de contacto</h2>
            <ul className="space-y-4 text-gray-800">
              <li>
                <strong className="block text-primary">Dirección</strong>
                {siteConfig.address.street}, {siteConfig.address.postalCode}
                <br />
                {siteConfig.address.locality},{" "}
                {siteConfig.address.region}, Argentina
              </li>
              <li>
                <strong className="block text-primary">Teléfono</strong>
                <a href={siteConfig.phoneHref} className="hover:underline">
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <strong className="block text-primary">WhatsApp</strong>
                <a
                  href={`https://wa.me/${siteConfig.whatsapp.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Chatear por WhatsApp
                </a>
              </li>
              <li>
                <strong className="block text-primary">Horarios</strong>
                Lunes a Viernes, 8:00 a 17:00 hs
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Envianos un mensaje</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
