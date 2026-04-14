"use client";

import { useEffect, useState } from "react";

export type Banner = {
  id: string | number;
  href: string;
  alt: string;
  /** Imagen de fondo. Si no hay, se muestra un hero de texto con `title`/`subtitle`. */
  image?: string;
  external?: boolean;
  /** Hero de texto (fallback o primer banner sin imagen). */
  title?: string;
  subtitle?: string;
};

export function BannerCarousel({
  banners,
  intervalMs = 5000,
}: {
  banners: Banner[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (banners.length < 2 || paused) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % banners.length),
      intervalMs
    );
    return () => clearInterval(t);
  }, [banners.length, intervalMs, paused]);

  if (banners.length === 0) return null;

  return (
    <section
      id="banners"
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <h1 className="sr-only">Griffo</h1>
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((b) => (
          <a
            key={b.id}
            href={b.href}
            target={b.external ? "_blank" : undefined}
            rel={b.external ? "noopener noreferrer" : undefined}
            className="shrink-0 w-full"
            aria-label={b.alt}
          >
            {b.image ? (
              <div
                className="w-full aspect-[16/6] bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: `url(${b.image})` }}
                role="img"
                aria-label={b.alt}
              />
            ) : (
              <TextHero title={b.title} subtitle={b.subtitle} />
            )}
          </a>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="carousel-dots absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              data-active={i === index}
              onClick={(e) => {
                e.preventDefault();
                setIndex(i);
              }}
              aria-label={`Ir al slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Hero de texto usado como fallback hasta tener los banners finales.
 * Reproduce la composición del banner "Buscador por Patente" del sitio original.
 */
function TextHero({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="w-full bg-gradient-to-br from-[#e6f1fa] via-[#f4f9fd] to-[#dce9f5] relative overflow-hidden">
      {/* Líneas decorativas de fondo */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        preserveAspectRatio="none"
        viewBox="0 0 1200 400"
        aria-hidden
      >
        <path
          d="M0,300 Q300,200 600,260 T1200,220"
          stroke="var(--color-accent-value)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M0,200 Q300,100 600,160 T1200,120"
          stroke="var(--color-accent-value)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M0,350 Q300,300 600,330 T1200,290"
          stroke="var(--color-accent-value)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      <div className="relative container mx-auto max-w-6xl px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-[auto_1fr] items-center gap-10">
        {/* Ilustración placeholder (lupa + browser) */}
        <div className="hidden lg:flex justify-center">
          <svg width="220" height="200" viewBox="0 0 220 200" aria-hidden>
            <rect
              x="20"
              y="20"
              width="180"
              height="140"
              rx="10"
              fill="#f3f4f6"
              stroke="var(--color-primary-value)"
              strokeWidth="3"
            />
            <circle cx="35" cy="40" r="4" fill="#d1d5db" />
            <circle cx="50" cy="40" r="4" fill="#d1d5db" />
            <circle cx="65" cy="40" r="4" fill="#d1d5db" />
            <line
              x1="20"
              y1="55"
              x2="200"
              y2="55"
              stroke="var(--color-primary-value)"
              strokeWidth="2"
            />
            <rect x="35" y="70" width="40" height="6" fill="#d1d5db" />
            <rect x="35" y="85" width="60" height="6" fill="#d1d5db" />
            <circle
              cx="150"
              cy="130"
              r="34"
              fill="none"
              stroke="#111"
              strokeWidth="6"
            />
            <line
              x1="174"
              y1="154"
              x2="200"
              y2="180"
              stroke="#111"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="text-center lg:text-left">
          {title && (
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1a2a33] leading-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-4 text-lg lg:text-xl text-[#1a2a33]/80 max-w-2xl mx-auto lg:mx-0">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
