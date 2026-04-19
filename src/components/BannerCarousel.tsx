"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BuscadorPatenteBanner } from "@/components/BuscadorPatenteBanner";
import type { Banner } from "@/lib/banners-store";

// BuscadorPatenteBanner YA es un <Link href="/catalogo"> internamente,
// así que cuando es slide del carousel lo renderizamos directo — sin
// wrapper adicional — para evitar anidar <a> (HTML inválido, browsers
// cancelan el click).

const AUTOPLAY_MS = 6000;

/**
 * Carousel del home. Rota entre los banners activos. Soporta 3 tipos
 * de slide:
 *   - imagen: <img> de fondo + overlay con título/subtítulo/CTA
 *   - video: <video autoplay muted loop playsinline> de fondo + overlay
 *   - patente: el componente built-in BuscadorPatenteBanner
 *
 * Pausa el autoplay on hover en desktop. Soporta swipe en mobile con
 * touch events simples.
 */
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Normalizar: si no hay banners, render solo el buscador de patente.
  const slides: Banner[] =
    banners.length > 0
      ? banners
      : [
          {
            id: "_default_patente",
            tipo: "patente",
            activo: true,
            orden: 0,
          },
        ];

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setIdx((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Autoplay — solo si hay más de un slide y no está pausado.
  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [idx, paused, slides.length, next]);

  // Corregir idx si la lista se achica.
  useEffect(() => {
    if (idx >= slides.length) setIdx(0);
  }, [slides.length, idx]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  }

  const current = slides[idx];

  return (
    <section
      className="relative w-full overflow-hidden bg-primary"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      <div className="relative w-full">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`${
              i === idx ? "relative opacity-100" : "absolute inset-0 opacity-0 pointer-events-none"
            } transition-opacity duration-700`}
            aria-hidden={i !== idx}
          >
            <BannerSlide banner={s} />
          </div>
        ))}
      </div>

      {/* Controles (solo si hay más de uno) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Slide anterior"
            className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-primary font-bold transition cursor-pointer"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Slide siguiente"
            className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-primary font-bold transition cursor-pointer"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Ir al slide ${i + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === idx ? "bg-white w-8" : "bg-white/50 w-2 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ---------- Slide individual según tipo ---------- */

function BannerSlide({ banner }: { banner: Banner }) {
  if (banner.tipo === "patente") {
    return <BuscadorPatenteBanner />;
  }

  const content = (
    <div className="relative w-full aspect-[2.4/1] bg-gray-900 overflow-hidden">
      {banner.tipo === "video" && banner.fileUrl ? (
        <video
          src={banner.fileUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : banner.fileUrl ? (
        <img
          src={banner.fileUrl}
          alt={banner.titulo ?? ""}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
      ) : null}

      {/* Overlay oscurecido para legibilidad del texto */}
      {(banner.titulo || banner.ctaText) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      )}

      {/* Texto + CTA centrados en un contenedor safe-area (60% del ancho) */}
      {(banner.titulo || banner.subtitulo || banner.ctaText) && (
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 pb-12 lg:pb-16">
          <div className="max-w-2xl mx-auto text-white">
            {banner.titulo && (
              <h2 className="text-2xl lg:text-4xl font-black uppercase drop-shadow-lg">
                {banner.titulo}
              </h2>
            )}
            {banner.subtitulo && (
              <p className="mt-2 text-sm lg:text-base opacity-90 drop-shadow">
                {banner.subtitulo}
              </p>
            )}
            {banner.ctaText && banner.ctaHref && (
              <span className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 uppercase bg-white text-primary font-bold text-sm rounded-full hover:bg-accent hover:text-white transition">
                {banner.ctaText}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Si hay CTA con link interno o externo, envolvemos el slide.
  if (banner.ctaHref) {
    const isExternal = /^https?:\/\//.test(banner.ctaHref);
    if (isExternal) {
      return (
        <a
          href={banner.ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={banner.ctaHref} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
