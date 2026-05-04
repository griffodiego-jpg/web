"use client";

import { useCallback, useEffect, useState } from "react";
import { clearCartStorage } from "@/lib/cart";
import type { BejermanWarehouse } from "@/types/bejerman";

/**
 * Sesión "mock" de cliente B2B mientras Firebase Auth no está conectado.
 * Cuando haya auth real, reemplazamos este hook por el de Firebase — la
 * API (session, login, logout) queda igual para los consumidores.
 *
 * El carrito se limpia automáticamente en login/logout para evitar que
 * un cliente vea el carrito de otro al cambiar de sesión.
 */

export interface MockSession {
  email: string;
  clientId?: string;
  clientName?: string;
  /** Sucursales del cliente — vienen del login para que /carrito pueda
   *  ofrecer el selector sin hardcodear nada del mock. */
  warehouses?: BejermanWarehouse[];
  /** True si la sesión la inició el admin vía /admin/clientes. */
  impersonated?: boolean;
  loggedAt: string;
}

const STORAGE_KEY = "griffo:b2b:session";
const EVENT_NAME = "b2b-session-change";

function read(): MockSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MockSession;
    if (!parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useMockSession() {
  const [session, setSession] = useState<MockSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(read());
    setReady(true);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSession(read());
    };
    const onCustom = () => setSession(read());
    window.addEventListener("storage", onStorage);
    window.addEventListener(EVENT_NAME, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EVENT_NAME, onCustom);
    };
  }, []);

  const login = useCallback(
    (data: {
      email: string;
      clientId?: string;
      clientName?: string;
      warehouses?: BejermanWarehouse[];
    }) => {
      // Si el cliente cambia de email respecto a la sesión anterior,
      // limpiamos el carrito (evita que vea el de otro usuario).
      const prev = read();
      const normalizedEmail = data.email.trim().toLowerCase();
      if (!prev || prev.email.trim().toLowerCase() !== normalizedEmail) {
        clearCartStorage();
      }
      const next: MockSession = {
        email: data.email,
        clientId: data.clientId,
        clientName: data.clientName,
        warehouses: data.warehouses,
        loggedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(EVENT_NAME));
      setSession(next);
    },
    [],
  );

  const logout = useCallback(() => {
    // Borramos primero el cookie server-side (fire-and-forget — si
    // falla, el cliente ya está deslogueado en su browser igual). Sin
    // este POST la cookie httpOnly persistiría y endpoints protegidos
    // server-side seguirían considerando al usuario logueado.
    fetch("/api/b2b/logout", { method: "POST" }).catch(() => {});
    clearCartStorage();
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT_NAME));
    setSession(null);
  }, []);

  return { session, ready, isLoggedIn: !!session, login, logout };
}
