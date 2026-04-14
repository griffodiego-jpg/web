"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

/**
 * Imagen con fallback visual automático.
 *
 * Intenta cargar `src` (típicamente una ruta en /public/images/...). Si el
 * archivo no existe (404) o falla, muestra un placeholder estilizado que
 * indica qué imagen debería ir ahí. Cuando el archivo real aparece en el
 * repo, el fallback desaparece solo sin cambiar código.
 *
 * Útil durante el desarrollo mientras faltan assets del sitio original.
 */
export function AssetImage({
  src,
  alt,
  caption,
  className = "",
  aspect = "aspect-[4/3]",
  variant = "photo",
}: {
  src: string;
  alt: string;
  /** Texto mostrado en el placeholder (default = alt). */
  caption?: string;
  className?: string;
  /** Tailwind aspect-* class para el contenedor. */
  aspect?: string;
  variant?: "photo" | "video";
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <Placeholder
        label={caption ?? alt}
        className={`${aspect} ${className}`}
        variant={variant}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} w-full h-full object-cover`}
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
  return (
    <div
      className={`${className} w-full relative overflow-hidden rounded bg-gradient-to-br from-[#e6f1fa] via-[#d4e6f3] to-[#bcd5e8] flex items-center justify-center`}
      role="img"
      aria-label={label}
    >
      {/* Patrón decorativo de fondo */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <pattern
            id={`grid-${label}`}
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
        <rect width="400" height="300" fill={`url(#grid-${label})`} />
      </svg>

      {/* Icono central */}
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
