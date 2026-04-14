"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site-config";

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M16 .4C7.4.4.4 7.4.4 16c0 2.8.7 5.5 2.1 7.9L.3 31.6l7.9-2.1A15.6 15.6 0 1 0 16 .4Zm0 28.4a12.8 12.8 0 0 1-6.5-1.8l-.5-.3-4.7 1.2 1.3-4.6-.3-.5A12.8 12.8 0 1 1 28.8 16 12.8 12.8 0 0 1 16 28.8Zm7-9.6c-.4-.2-2.2-1.1-2.6-1.2-.4-.1-.6-.2-.9.2-.3.4-1 1.2-1.2 1.4-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3.1-1.9-1.1-1-1.9-2.3-2.1-2.7-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.6.1-.3.1-.5 0-.7-.1-.2-.9-2.2-1.3-3-.3-.8-.7-.7-.9-.7h-.8c-.3 0-.7.1-1.1.5-.4.4-1.4 1.4-1.4 3.4s1.5 4 1.7 4.2c.2.3 2.9 4.5 7.1 6.3.9.4 1.6.6 2.2.8.9.3 1.7.2 2.4.1.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8-.1-.2-.4-.3-.8-.5Z" />
    </svg>
  );
}

export function WhatsappFloat() {
  const [open, setOpen] = useState(false);
  const waHref = `https://wa.me/${siteConfig.whatsapp.number}`;

  return (
    <aside className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 overflow-hidden bg-white rounded min-w-[300px] pb-2.5 shadow-xl">
          <div className="bg-primary flex gap-2.5 p-5 items-start">
            <WhatsAppIcon className="w-12 h-12 text-white shrink-0" />
            <div className="max-w-[220px]">
              <h2 className="text-white text-xl font-bold">Consultas</h2>
              <p className="text-white text-sm">
                ¡Hola! Hacé clic para chatear por WhatsApp
              </p>
            </div>
          </div>
          <small className="text-gray-500 px-5 block my-2.5">
            Solemos contestar en breve
          </small>
          <ul className="space-y-2.5 px-2.5">
            <li>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-5 border-l-primary border-l-2 p-2.5 rounded group hover:bg-primary transition"
              >
                <div className="flex gap-2.5 items-center">
                  <WhatsAppIcon className="w-9 h-9 text-primary group-hover:text-white" />
                  <div>
                    <h3 className="group-hover:text-white font-semibold">
                      Atención
                    </h3>
                    <p className="text-gray-500 text-sm group-hover:text-white">
                      {siteConfig.whatsapp.label}
                    </p>
                  </div>
                </div>
              </a>
            </li>
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir consultas por WhatsApp"
        className="w-16 h-16 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition cursor-pointer"
      >
        <WhatsAppIcon className="w-9 h-9" />
      </button>
    </aside>
  );
}
