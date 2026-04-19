"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/cuenta", label: "Resumen" },
  { href: "/cuenta/pedidos", label: "Mis pedidos" },
  { href: "/cuenta/facturas", label: "Facturas" },
  { href: "/cuenta/cuenta-corriente", label: "Cuenta corriente" },
  { href: "/cuenta/listas", label: "Lista de precios" },
  { href: "/cuenta/perfil", label: "Mi perfil" },
];

export function PortalNav() {
  const pathname = usePathname();
  return (
    <nav className="-mb-px overflow-x-auto">
      <ul className="flex gap-1 min-w-max">
        {TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`inline-block px-4 py-2.5 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                  active
                    ? "border-accent text-[#0a2b3d] font-black"
                    : "border-transparent text-gray-600 hover:text-[#0a2b3d] hover:border-gray-200"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
