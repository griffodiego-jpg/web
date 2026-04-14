"use client";

import { useEffect, useState } from "react";

/**
 * Fuente responsive para un banner. Replica el patrón `<picture srcset>`
 * del sitio original de Griffo: distintos archivos por breakpoint.
 */
export type ResponsiveImage = {
  /** Imagen por defecto (desktop grande). */
  default: string;
  /** Imagen para pantallas hasta 1024px (desktop chico / landscape tablet). */
  lg?: string;
  /** Imagen para pantallas hasta 768px (tablet). */
  md?: string;
  /** Imagen para pantallas hasta 414px (mobile). */
  sm?: string;
  alt: string;
  width?: number;
  height?: number;
};

export type Banner = {
  id: string | number;
  href: string;
  alt: string;
  /** Imagen estática (string) o set responsive. */
  image?: string | ResponsiveImage;
  external?: boolean;
  /** Hero de texto (fallback si no hay imagen). */
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
          <BannerSlide key={b.id} banner={b} />
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

function BannerSlide({ banner }: { banner: Banner }) {
  const [imgFailed, setImgFailed] = useState(false);

  const showImage = banner.image && !imgFailed;

  const content = showImage ? (
    <BannerImage
      image={banner.image!}
      onError={() => setImgFailed(true)}
    />
  ) : (
    <TextHero title={banner.title} subtitle={banner.subtitle} />
  );

  const common = {
    className: "shrink-0 w-full block",
    "aria-label": banner.alt,
  };

  return banner.external ? (
    <a
      href={banner.href}
      target="_blank"
      rel="noopener noreferrer"
      {...common}
    >
      {content}
    </a>
  ) : (
    <a href={banner.href} {...common}>
      {content}
    </a>
  );
}

/**
 * Renderiza <picture> con srcset adaptativo. Mismos breakpoints que
 * el sitio original (414 / 768 / 1024 / default).
 */
function BannerImage({
  image,
  onError,
}: {
  image: string | ResponsiveImage;
  onError?: () => void;
}) {
  if (typeof image === "string") {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={image}
        alt=""
        className="w-full h-auto block"
        loading="eager"
        onError={onError}
      />
    );
  }

  return (
    <picture>
      {image.sm && (
        <source srcSet={image.sm} media="(max-width: 414px)" />
      )}
      {image.md && (
        <source srcSet={image.md} media="(max-width: 768px)" />
      )}
      {image.lg && (
        <source srcSet={image.lg} media="(max-width: 1024px)" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.default}
        alt={image.alt}
        width={image.width}
        height={image.height}
        className="w-full h-auto block"
        loading="eager"
        onError={onError}
      />
    </picture>
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
      </svg>

      <div className="relative container mx-auto max-w-6xl px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-[auto_1fr] items-center gap-10">
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
            <line
              x1="20"
              y1="55"
              x2="200"
              y2="55"
              stroke="var(--color-primary-value)"
              strokeWidth="2"
            />
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
