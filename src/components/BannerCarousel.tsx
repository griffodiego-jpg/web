"use client";

import { useEffect, useState } from "react";

export type Banner = {
  id: string | number;
  href: string;
  alt: string;
  image: string;
  external?: boolean;
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
          >
            <div
              className="w-full aspect-[16/6] bg-center bg-cover bg-no-repeat flex items-center justify-center"
              style={{ backgroundImage: `url(${b.image})` }}
              role="img"
              aria-label={b.alt}
            >
              {/* Fallback texto si no hay imagen todavía */}
              <span className="sr-only">{b.alt}</span>
            </div>
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
              onClick={() => setIndex(i)}
              aria-label={`Ir al slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
