"use client";

import { useEffect } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  onClose: () => void;
};

export function ImageLightbox({ src, alt, onClose }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar"
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl text-white transition hover:bg-white/25"
      >
        ×
      </button>
      <div
        className="relative h-[90vh] w-[92vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={src} alt={alt} fill sizes="92vw" className="object-contain" />
      </div>
    </div>
  );
}
