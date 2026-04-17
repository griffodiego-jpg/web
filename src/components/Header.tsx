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
 *
 * Ante rutas anidadas entre items del nav (ej. /catalogo/download cae
 * bajo /catalogo), el más específico gana: un item solo se considera
 * activo por startsWith si ningún otro item del nav tiene un href más
 * largo que matchee el pathname.
 */
function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.external) return false;
  if (pathname === item.href) return true;
  if (item.href !== "/" && pathname.startsWith(item.href + "/")) {
    const hasMoreSpecific = navigation.some(
      (other) =>
        other !== item &&
        !other.external &&
        other.href.length > item.href.length &&
        (pathname === other.href || pathname.startsWith(other.href + "/"))
    );
    if (!hasMoreSpecific) return true;
  }
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
                  {/* El texto es un link que navega a la página resumen.
                      El dropdown se abre por hover (desktop) o por click
                      en la flechita (mobile). */}
                  <div className={`${linkCls} flex items-center gap-1`}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        setOpen(false);
                        setOpenDropdown(null);
                      }}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown((v) =>
                          v === item.label ? null : item.label
                        )
                      }
                      aria-expanded={isOpen}
                      aria-label={`Desplegar ${item.label}`}
                      className="lg:hidden p-1 cursor-pointer"
                    >
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
                  </div>
                  {/* pt-3 en desktop: padding transparente que actúa como "puente"
                      entre el botón y el dropdown — evita que onMouseLeave dispare
                      al mover el mouse en el gap. El bg del dropdown empieza en
                      los <li> de adentro, no en el <ul>. */}
                  <ul
                    className={`${
                      isOpen ? "block" : "hidden"
                    } lg:absolute lg:top-full lg:left-0 lg:pt-3 lg:min-w-[260px] pl-4 lg:pl-0 mt-2 lg:mt-0 lg:bg-primary lg:shadow-lg lg:rounded-b`}
                  >
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
          {/* CTA destacado para portal B2B */}
          <li className="lg:ml-2">
            <Link
              href="/cuenta/login"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-accent bg-accent lg:bg-transparent lg:hover:bg-accent text-primary lg:text-primary hover:text-white font-black text-xs uppercase tracking-wider transition whitespace-nowrap"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Acceso clientes
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
