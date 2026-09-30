"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { IconButton } from "@/components/ui/icon-button";
import {
  IMAGE_ACCEPT,
  ImageValidationError,
  uploadProductImage,
} from "@/lib/storage/product-images";
import { createClient } from "@/lib/supabase/client";
import { MAX_GALLERY_IMAGES } from "@/lib/schemas/admin-product";

interface GalleryUploadFieldProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  // Lets the parent form disable "Save" while uploads are in flight.
  onUploadingChange?: (isUploading: boolean) => void;
}

function GalleryUploadField({
  value,
  onChange,
  disabled,
  onUploadingChange,
}: GalleryUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const remainingSlots = MAX_GALLERY_IMAGES - value.length;

  function updateUploading(next: boolean) {
    setIsUploading(next);
    onUploadingChange?.(next);
  }

  async function handleFilesSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-selecting the same files later
    if (selected.length === 0 || remainingSlots <= 0) return;

    // Enforce the limit BEFORE uploading, so we never upload files that the
    // form would then reject (they'd be left orphaned in the bucket).
    const files = selected.slice(0, remainingSlots);
    if (files.length < selected.length) {
      toast.info(`Only ${MAX_GALLERY_IMAGES} gallery images are allowed.`);
    }

    updateUploading(true);
    try {
      const supabase = createClient();
      // In parallel; partial success is kept if one file fails.
      const results = await Promise.allSettled(
        files.map((file) => uploadProductImage(supabase, file)),
      );

      const uploaded = results
        .filter(
          (r): r is PromiseFulfilledResult<string> => r.status === "fulfilled",
        )
        .map((r) => r.value);
      const failures = results.filter(
        (r): r is PromiseRejectedResult => r.status === "rejected",
      );

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
      }
      if (failures.length > 0) {
        const validation = failures.find(
          (f) => f.reason instanceof ImageValidationError,
        );
        toast.error(
          validation
            ? (validation.reason as ImageValidationError).message
            : `${failures.length} image${failures.length > 1 ? "s" : ""} failed to upload.`,
        );
      }
    } finally {
      updateUploading(false);
    }
  }

  function handleRemove(url: string) {
    onChange(value.filter((v) => v !== url));
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        className="hidden"
        onChange={handleFilesSelect}
      />

      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div
            key={url}
            className="relative size-24 overflow-hidden rounded-lg bg-neutral-800"
          >
            <Image
              src={url}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
            <IconButton
              type="button"
              aria-label="Remove image"
              size="icon-sm"
              className="absolute top-1 right-1"
              // Also locked while uploading: otherwise removing an image mid-upload
              // would be undone when onChange([...value, ...uploaded]) runs with
              // the stale `value` captured before the upload started.
              disabled={disabled || isUploading}
              onClick={() => handleRemove(url)}
            >
              <XIcon />
            </IconButton>
          </div>
        ))}

        {remainingSlots > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
            className="hover:text-foreground flex size-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-700 text-neutral-400 transition-colors hover:border-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UploadIcon className="size-5" />
            <span className="text-caption">
              {isUploading ? "Uploading…" : "Add images"}
            </span>
          </button>
        )}
      </div>

      <p className="text-caption text-neutral-500">
        {value.length}/{MAX_GALLERY_IMAGES} images
      </p>
    </div>
  );
}

export { GalleryUploadField };
