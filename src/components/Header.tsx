"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigation, type NavItem } from "@/lib/site-config";
import { Logo } from "@/components/Logo";

/**
 * Determina si un item del nav está activo según el pathname actual.
 * Matchea exacto, rutas anidadas (/productos/foo → Productos) y padres
 * con children activos.
 */
function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.external) return false;
  if (pathname === item.href) return true;
  if (item.href !== "/" && pathname.startsWith(item.href + "/")) return true;
  if (item.children) {
    return item.children.some(
      (c) => pathname === c.href || pathname.startsWith(c.href + "/")
    );
  }
  return false;
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Cierra el menú mobile al cambiar a desktop.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      id="navbar-header"
      className="sticky top-0 z-30 bg-white shadow flex items-center justify-between px-5 py-2.5"
    >
      <Link
        href="/"
        aria-label="Inicio — Griffo, Impulsamos Soluciones"
        className="flex items-center gap-3"
      >
        <Logo className="h-10 w-auto shrink-0" />
        {/* Tagline institucional — se muestra junto al logo como una unidad */}
        <span className="hidden md:flex flex-col border-l-2 border-primary/40 pl-3 leading-[1.05]">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
            Impulsamos
          </span>
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
            Soluciones
          </span>
        </span>
      </Link>

      {/* Hamburger */}
      <button
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="lg:hidden flex flex-col justify-center items-center w-10 h-10 border-0 bg-transparent focus:outline-none"
      >
        <span
          className={`block w-7 h-0.5 bg-primary mb-1.5 transition-all ${
            open ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span
          className={`block w-7 h-0.5 bg-primary mb-1.5 transition-all ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block w-7 h-0.5 bg-primary transition-all ${
            open ? "-translate-y-2 -rotate-45" : ""
          }`}
        />
      </button>

      <nav
        id="navbar"
        className={`${
          open ? "flex" : "hidden"
        } lg:flex absolute lg:static top-full left-0 w-full lg:w-auto bg-primary lg:bg-transparent shadow lg:shadow-none px-5 lg:px-0 py-5 lg:py-0 transition-all z-20 h-[calc(100vh-3.5rem)] lg:h-auto overflow-y-auto lg:overflow-visible`}
      >
        <ul className="flex flex-col lg:flex-row gap-5 lg:gap-x-5 p-0 items-start lg:items-center text-sm w-full lg:w-auto">
          {navigation.map((item) => {
            const active = isItemActive(item, pathname);
            /*
             * Estado activo: borde inferior accent + texto con peso
             * extra black (peso 900). En mobile, donde el nav es blanco
             * sobre primary, el indicador es accent para contrastar.
             */
            const baseCls =
              "lg:text-primary text-white font-bold hover:opacity-80 transition whitespace-nowrap pb-1 border-b-2";
            const stateCls = active
              ? "border-accent font-black"
              : "border-transparent";
            const linkCls = `${baseCls} ${stateCls}`;

            if (item.children) {
              const isOpen = openDropdown === item.label;
              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown((v) =>
                        v === item.label ? null : item.label
                      )
                    }
                    className={`${linkCls} flex items-center gap-1`}
                    aria-expanded={isOpen}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <ul
                    className={`${
                      isOpen ? "block" : "hidden"
                    } lg:absolute lg:top-full lg:left-0 lg:mt-2 lg:bg-primary lg:shadow-lg lg:min-w-[260px] py-2 pl-4 lg:pl-0 mt-2`}
                  >
                    <li className="lg:px-4 lg:py-2">
                      <Link
                        href={item.href}
                        onClick={() => {
                          setOpen(false);
                          setOpenDropdown(null);
                        }}
                        className="text-white font-bold hover:underline"
                      >
                        Ver todo
                      </Link>
                    </li>
                    {item.children.map((child) => (
                      <li key={child.href} className="lg:px-4 lg:py-2">
                        <Link
                          href={child.href}
                          onClick={() => {
                            setOpen(false);
                            setOpenDropdown(null);
                          }}
                          className="text-white font-bold hover:underline whitespace-nowrap"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            if (item.external) {
              return (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkCls}
                  >
                    {item.label}
                  </a>
                </li>
              );
            }

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={linkCls}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
