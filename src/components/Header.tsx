"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navigation } from "@/lib/site-config";
import { Logo } from "@/components/Logo";

export function Header() {
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
      className="fixed top-0 left-0 right-0 z-30 bg-white shadow flex items-center justify-between px-5 py-2.5"
    >
      <Link href="/" aria-label="Inicio" className="block">
        <Logo className="h-10 w-auto" />
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
            const baseCls =
              "lg:text-primary text-white font-bold hover:opacity-80 transition whitespace-nowrap";

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
                      setOpenDropdown((v) => (v === item.label ? null : item.label))
                    }
                    className={`${baseCls} flex items-center gap-1`}
                    aria-expanded={isOpen}
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
                    className={baseCls}
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
                  className={baseCls}
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
