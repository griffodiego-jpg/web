"use client";

import { useState } from "react";

/**
 * Video con fallback a placeholder si el archivo no existe todavía.
 */
export function AssetVideo({
  src,
  poster,
  label,
  className = "",
}: {
  src: string;
  poster?: string;
  label: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`${className} w-full aspect-video relative overflow-hidden rounded bg-gradient-to-br from-[#e6f1fa] via-[#d4e6f3] to-[#bcd5e8] flex items-center justify-center`}
        role="img"
        aria-label={label}
      >
        <div className="relative flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="mt-3 text-primary font-semibold text-sm lg:text-base">
            {label}
          </p>
        </div>
      </div>
    );
  }

  return (
    <video
      src={src}
      poster={poster}
      className={`${className} w-full rounded`}
      muted
      autoPlay
      loop
      playsInline
      preload="metadata"
      onError={() => setFailed(true)}
    />
  );
}
