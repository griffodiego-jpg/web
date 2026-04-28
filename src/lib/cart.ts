"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Carrito de compras persistente en localStorage. Sirve para B2C (wishlist
 * simple antes de login) y B2B (armado de pedido que después va a
 * /ERP/order). Cuando haya auth real, el carrito pasa a Redis por user
 * y este hook se reemplaza — la API pública queda igual.
 */

export interface CartItem {
  productCode: string;
  slug: string;
  name: string;
  image?: string;
  quantity: number;
  addedAt: string;
}

interface CartState {
  items: CartItem[];
  updatedAt: string;
}

const STORAGE_KEY = "griffo:cart";
const EMPTY: CartState = { items: [], updatedAt: "" };

/**
 * Borra el carrito desde fuera de un componente React. Útil al
 * loguear/desloguear (cambio de cliente) — no podemos usar el hook
 * useCart en esos contextos. Dispara el evento `cart-change` para
 * que cualquier componente que esté escuchando se sincronice.
 */
export function clearCartStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const empty: CartState = { items: [], updatedAt: new Date().toISOString() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
    window.dispatchEvent(new CustomEvent("cart-change", { detail: empty }));
  } catch {
    /* tolerar */
  }
}

function read(): CartState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as CartState;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return EMPTY;
  }
}

function write(state: CartState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("cart-change", { detail: state }));
  } catch {
    /* tolerar */
  }
}

export function useCart() {
  const [state, setState] = useState<CartState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(read());
    setReady(true);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setState(read());
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<CartState>).detail;
      if (detail) setState(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("cart-change", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart-change", onCustom as EventListener);
    };
  }, []);

  const persist = useCallback((next: CartState) => {
    setState(next);
    write(next);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity" | "addedAt">, quantity: number) => {
      const qty = Math.max(1, Math.floor(quantity));
      const current = read();
      const idx = current.items.findIndex(
        (x) => x.productCode === item.productCode,
      );
      const now = new Date().toISOString();
      let items: CartItem[];
      if (idx >= 0) {
        items = [...current.items];
        items[idx] = {
          ...items[idx],
          quantity: items[idx].quantity + qty,
          addedAt: now,
        };
      } else {
        items = [...current.items, { ...item, quantity: qty, addedAt: now }];
      }
      persist({ items, updatedAt: now });
    },
    [persist],
  );

  const setQuantity = useCallback(
    (productCode: string, quantity: number) => {
      const qty = Math.max(0, Math.floor(quantity));
      const current = read();
      const items =
        qty === 0
          ? current.items.filter((x) => x.productCode !== productCode)
          : current.items.map((x) =>
              x.productCode === productCode ? { ...x, quantity: qty } : x,
            );
      persist({ items, updatedAt: new Date().toISOString() });
    },
    [persist],
  );

  const removeItem = useCallback(
    (productCode: string) => setQuantity(productCode, 0),
    [setQuantity],
  );

  const clear = useCallback(() => {
    persist({ items: [], updatedAt: new Date().toISOString() });
  }, [persist]);

  const count = state.items.reduce((acc, x) => acc + x.quantity, 0);
  const getQuantity = (productCode: string) =>
    state.items.find((x) => x.productCode === productCode)?.quantity ?? 0;

  return {
    items: state.items,
    count,
    ready,
    getQuantity,
    addItem,
    setQuantity,
    removeItem,
    clear,
  };
}
