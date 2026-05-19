"use client";

import { useEffect, useState } from "react";

import { fetchMlLink } from "@/app/actions/ml-link";
import { useMockSession } from "@/lib/mock-session";

import { AddToCartButton } from "./AddToCartButton";
import { ProductPrice } from "./ProductPrice";

/**
 * Bloque de "precio + CTAs de compra" del catálogo público.
 *
 * Si el usuario NO está logueado como B2B:
 *   - Ocultamos precios (son precios de compra mayorista).
 *   - Mostramos un único botón "Ver en Mercado Libre". Si el producto
 *     no tiene link en el mapa subido por admin, el botón queda
 *     deshabilitado y en gris ("Sin publicación en Mercado Libre").
 *
 * Si el usuario SÍ está logueado:
 *   - Se muestra el precio (compra o PVP según preferencias B2B).
 *   - Se muestra el botón de "Agregar al carrito" para armar el pedido.
 *   - Si existe link de ML, se ofrece como alternativa secundaria.
 *
 * mlLink opcional:
 *   - string  → link conocido (pre-computado server-side, para cards del catálogo)
 *   - null    → sin link (disabled)
 *   - undefined (no se pasa) → fetchea dinámicamente vía server action, así
 *     el detalle de producto nunca sirve un link stale de la caché ISR
 */
export function PriceOrML({
  productCode,
  slug,
  productName,
  image,
  mlLink,
  size = "card",
}: {
  productCode: string;
  slug: string;
  productName: string;
  image?: string;
  mlLink?: string | null;
  /** "card" = versión compacta para ProductCard. "detail" = versión grande. */
  size?: "card" | "detail";
}) {
  const { isLoggedIn, ready } = useMockSession();

  // Cuando mlLink no se pasa (undefined), lo fetchea dinámicamente con un
  // server action — así el detalle de producto nunca sirve un link stale
  // desde la caché ISR. Para las cards del catálogo siempre llega string|null
  // (pre-computado server-side) y este efecto no corre.
  const [resolvedLink, setResolvedLink] = useState<string | null | undefined>(mlLink);
  const [linkReady, setLinkReady] = useState(mlLink !== undefined);

  useEffect(() => {
    if (mlLink !== undefined) {
      setResolvedLink(mlLink);
      setLinkReady(true);
      return;
    }
    fetchMlLink(productCode)
      .then((url) => setResolvedLink(url ?? null))
      .catch(() => setResolvedLink(null))
      .finally(() => setLinkReady(true));
  }, [productCode, mlLink]);

  // Mientras hidrata la sesión o se resuelve el link dinámico, no renderizamos
  // para evitar parpadeos.
  if (!ready || !linkReady) {
    return <div className="h-10" aria-hidden />;
  }

  const link = resolvedLink ?? null;

  if (isLoggedIn) {
    if (size === "detail") {
      return (
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <ProductPrice productCode={productCode} size="lg" />
          <div className="flex items-center gap-2">
            <AddToCartButton
              productCode={productCode}
              slug={slug}
              name={productName}
              image={image}
            />
            {link ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded-md bg-[#FFE600] px-3 py-1.5 text-xs font-bold text-[#333] transition hover:brightness-95"
              >
                MercadoLibre ↗
              </a>
            ) : null}
          </div>
        </div>
      );
    }
    return (
      <>
        <ProductPrice productCode={productCode} size="md" />
        <div className="flex items-center justify-end">
          <AddToCartButton
            productCode={productCode}
            slug={slug}
            name={productName}
            image={image}
            compact
          />
        </div>
      </>
    );
  }

  // No logueado: solo Mercado Libre.
  if (size === "detail") {
    return link ? (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-[#FFE600] px-5 py-3 text-sm font-bold text-[#333] transition hover:brightness-95"
      >
        Comprar Mercadolibre ↗
      </a>
    ) : (
      <button
        type="button"
        disabled
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-gray-200 px-5 py-3 text-sm font-bold text-gray-500 cursor-not-allowed"
      >
        Comprar Mercadolibre
      </button>
    );
  }

  // size="card"
  return link ? (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center justify-center gap-1 w-full rounded-md bg-[#FFE600] px-2.5 py-1.5 text-[11px] font-bold text-[#333] transition hover:brightness-95"
    >
      Comprar Mercadolibre ↗
    </a>
  ) : (
    <button
      type="button"
      disabled
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center justify-center w-full rounded-md bg-gray-100 px-2.5 py-1.5 text-[11px] font-bold text-gray-400 cursor-not-allowed"
    >
      Comprar Mercadolibre
    </button>
  );
}
