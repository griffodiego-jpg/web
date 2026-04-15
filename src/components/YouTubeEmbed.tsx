"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

/**
 * Embed liviano de YouTube: al inicio solo muestra el thumbnail + botón
 * de play. El iframe real (pesado) solo se monta cuando el usuario
 * clickea. Mejor performance que un iframe directo.
 */
export function YouTubeEmbed({
  videoId,
  title = "Video",
}: {
  videoId: string;
  title?: string;
}) {
  const [activated, setActivated] = useState(false);

  if (activated) {
    return (
      <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`Reproducir: ${title}`}
      className="group relative w-full aspect-video rounded-md overflow-hidden bg-black cursor-pointer"
    >
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="w-20 h-20 rounded-full bg-red-600 group-hover:bg-red-700 flex items-center justify-center shadow-2xl transition">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="white"
            aria-hidden
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
    </button>
  );
}
