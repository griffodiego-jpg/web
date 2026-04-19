"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function CartIndicator({
  onClick,
  mobile,
}: {
  onClick?: () => void;
  mobile?: boolean;
}) {
  const { count, ready } = useCart();
  const displayCount = ready ? count : 0;

  return (
    <Link
      href="/carrito"
      onClick={onClick}
      aria-label={`Carrito de compras${
        displayCount > 0 ? ` (${displayCount} items)` : ""
      }`}
      className={`relative inline-flex items-center justify-center rounded-md border-2 border-primary/30 hover:border-primary hover:bg-primary hover:text-white text-primary transition ${
        mobile ? "w-10 h-10" : "w-9 h-9"
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {displayCount > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-black flex items-center justify-center border-2 border-white"
          aria-hidden="true"
        >
          {displayCount > 99 ? "99+" : displayCount}
        </span>
      )}
    </Link>
  );
}
