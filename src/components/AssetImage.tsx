"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

/**
 * Imagen con fallback visual automático.
 *
 * - Si `src` carga OK, muestra la imagen a su **tamaño natural**
 *   (w-full h-auto) — sin recortes ni estiramientos.
 * - Si falla, muestra un placeholder estilizado con el aspecto
 *   especificado en `fallbackAspect` (default 4:3).
 */
export function AssetImage({
  src,
  alt,
  caption,
  className = "",
  fallbackAspect = "aspect-[4/3]",
  variant = "photo",
  fill = false,
}: {
  src: string;
  alt: string;
  /** Texto en el placeholder cuando falla (default = alt). */
  caption?: string;
  className?: string;
  /** Tailwind aspect-* que aplica SOLO al placeholder. */
  fallbackAspect?: string;
  variant?: "photo" | "video";
  /** Si true, la imagen llena todo el contenedor padre con object-cover
   *  (útil para heros donde el layout define el tamaño). */
  fill?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <Placeholder
        label={caption ?? alt}
        className={
          fill
            ? `w-full h-full ${className}`
            : `${fallbackAspect} ${className}`
        }
        variant={variant}
      />
    );
  }

  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-auto ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

function Placeholder({
  label,
  className,
  variant,
}: {
  label: string;
  className: string;
  variant: "photo" | "video";
}) {
  const id = label.replace(/[^a-z0-9]/gi, "-");
  return (
    <div
      className={`${className} w-full relative overflow-hidden rounded bg-gradient-to-br from-[#e6f1fa] via-[#d4e6f3] to-[#bcd5e8] flex items-center justify-center`}
      role="img"
      aria-label={label}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <pattern
            id={`grid-${id}`}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="20"
              cy="20"
              r="1.5"
              fill="var(--color-primary-value)"
            />
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#grid-${id})`} />
      </svg>

      <div className="relative flex flex-col items-center justify-center text-center px-6">
        {variant === "video" ? (
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="white"
              aria-hidden
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        ) : (
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary-value)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        )}
        <p className="mt-3 text-primary font-semibold text-sm lg:text-base max-w-[220px]">
          {label}
        </p>
      </div>
    </div>
  );
}
