"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const activeImage = images[selected] ?? images[0];

  return (
    <div data-slot="product-gallery" className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-800">
        <Image
          src={activeImage}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === selected}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg bg-neutral-800 transition-all",
                index === selected
                  ? "ring-2 ring-ember-500"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { ProductGallery };
