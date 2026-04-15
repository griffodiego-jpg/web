import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escribinos tu consulta. Estamos en La Tablada, Provincia de Buenos Aires.",
};

/**
 * Dirección completa en una línea, usada para armar URLs de Google Maps.
 */
const FULL_ADDRESS = `${siteConfig.address.street}, ${siteConfig.address.postalCode} ${siteConfig.address.locality}, ${siteConfig.address.region}, Argentina`;

/**
 * URL para abrir Google Maps centrado en la dirección. Funciona en web,
 * y en mobile abre la app nativa (iOS/Android) si está instalada.
 */
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  FULL_ADDRESS
)}`;

/**
 * URL para embeber el mapa en un iframe. No requiere API key — usa el
 * modo `q=` con output=embed. Perfecto para sitios institucionales.
 */
const MAPS_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  FULL_ADDRESS
)}&output=embed`;

export default function ContactoPage() {
  return (
    <>
      <section className="container mx-auto max-w-6xl px-5 pt-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Columna izquierda: datos de contacto */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-[#0a2b3d]">
              Datos de contacto
            </h2>
            <ul className="space-y-5 text-gray-800">
              <li>
                <strong className="block text-primary uppercase text-xs tracking-wide mb-1">
                  Dirección
                </strong>
                {/* Dirección clickeable → abre Google Maps */}
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-2 hover:text-primary transition"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-primary shrink-0 mt-0.5"
                    aria-hidden
                  >
                    <path d="M12 11.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5ZM12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z" />
                  </svg>
                  <span>
                    {siteConfig.address.street},{" "}
                    {siteConfig.address.postalCode}
                    <br />
                    {siteConfig.address.locality},{" "}
                    {siteConfig.address.region}, Argentina
                    <br />
                    <span className="text-xs text-primary underline group-hover:no-underline">
                      Cómo llegar ↗
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <strong className="block text-primary uppercase text-xs tracking-wide mb-1">
                  Teléfono
                </strong>
                <a
                  href={siteConfig.phoneHref}
                  className="inline-flex items-center gap-2 hover:text-primary transition"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-primary"
                    aria-hidden
                  >
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
                  </svg>
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <strong className="block text-primary uppercase text-xs tracking-wide mb-1">
                  WhatsApp
                </strong>
                <a
                  href={`https://wa.me/${siteConfig.whatsapp.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary transition"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-[#25D366]"
                    aria-hidden
                  >
                    <path d="M16 .4C7.4.4.4 7.4.4 16c0 2.8.7 5.5 2.1 7.9L.3 31.6l7.9-2.1A15.6 15.6 0 1 0 16 .4Zm7 19.2c-.3.9-1.8 1.7-2.5 1.8-.7.1-1.5.2-2.4-.1-.6-.2-1.3-.4-2.2-.8-4.2-1.8-6.9-6-7.1-6.3-.2-.3-1.7-2.3-1.7-4.4s1-3 1.4-3.4c.4-.4.8-.5 1.1-.5h.8c.2 0 .6-.1.9.7.3.9 1.2 2.9 1.3 3.1.1.2.2.5 0 .7-.1.3-.2.4-.4.6l-.6.7c-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.2 2.6 1.6 3 1.8.4.2.6 0 .9-.1.2-.2.8-1 1.1-1.3.3-.4.5-.3.9-.2.4.2 2.2 1 2.6 1.2.4.2.7.3.8.5.1.2.1.9-.2 1.7Z" />
                  </svg>
                  Chatear por WhatsApp
                </a>
              </li>
              <li>
                <strong className="block text-primary uppercase text-xs tracking-wide mb-1">
                  Horarios de atención
                </strong>
                <div className="flex items-start gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary shrink-0 mt-0.5"
                    aria-hidden
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Lunes a Viernes, 8:00 a 17:00 hs
                </div>
              </li>
            </ul>
          </div>

          {/* Columna derecha: formulario */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-[#0a2b3d]">
              Envianos un mensaje
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Mapa de Google — full-width debajo de todo */}
      <section aria-label="Ubicación de Griffo en el mapa" className="relative">
        <div className="relative aspect-[21/9] lg:aspect-[21/7] w-full overflow-hidden">
          <iframe
            src={MAPS_EMBED_URL}
            title="Ubicación de Griffo"
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        {/* Overlay con un CTA para abrir en Google Maps */}
        <div className="absolute top-4 right-4 z-10">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/95 hover:bg-white shadow-lg px-4 py-2.5 rounded-full text-sm font-bold text-primary transition backdrop-blur"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 11.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5ZM12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z" />
            </svg>
            Abrir en Google Maps
          </a>
        </div>
      </section>
    </>
  );
}
