"use client";

import { useState } from "react";

import type { SpecPartsPicture } from "@/types/specparts";

type Props = {
  pictures: SpecPartsPicture[];
  alt: string;
};

export function ProductGallery({ pictures, alt }: Props) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  if (pictures.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-400">
        Sin imagen disponible
      </div>
    );
  }

  const current = pictures[active] ?? pictures[0];

  return (
    <>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setZoom(true)}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Ampliar imagen"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.image_url}
            alt={alt}
            className="h-full w-full object-contain"
          />
        </button>
        {pictures.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pictures.map((pic, i) => (
              <button
                key={`${pic.image_url}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                className={[
                  "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition",
                  i === active ? "border-primary" : "border-gray-200 hover:border-accent",
                ].join(" ")}
                aria-label={`Imagen ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pic.image_url} alt="" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {zoom ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom(false);
            }}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl text-white hover:bg-white/25"
            aria-label="Cerrar"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.image_url} alt={alt} className="max-h-[85vh] max-w-[92vw] object-contain" />
        </div>
      ) : null}
    </>
  );
}
