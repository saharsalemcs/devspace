"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
  IMAGE_ACCEPT,
  ImageValidationError,
  uploadProductImage,
} from "@/lib/storage/product-images";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  // Lets the parent form disable "Save" while an upload is in flight.
  onUploadingChange?: (isUploading: boolean) => void;
}

function ImageUploadField({
  value,
  onChange,
  disabled,
  onUploadingChange,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  function updateUploading(next: boolean) {
    setIsUploading(next);
    onUploadingChange?.(next);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    updateUploading(true);
    try {
      const url = await uploadProductImage(createClient(), file);
      onChange(url);
    } catch (error) {
      toast.error(
        error instanceof ImageValidationError
          ? error.message
          : "Couldn't upload image. Please try again.",
      );
    } finally {
      updateUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={handleFileSelect}
      />

      {value ? (
        <div className="relative size-32 overflow-hidden rounded-lg bg-neutral-800">
          <Image
            src={value}
            alt=""
            fill
            sizes="128px"
            className="object-cover"
          />
          <IconButton
            type="button"
            aria-label="Remove image"
            size="icon-sm"
            className="absolute top-1 right-1"
            disabled={disabled || isUploading}
            onClick={() => onChange("")}
          >
            <XIcon />
          </IconButton>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          className="hover:text-foreground flex size-32 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-700 text-neutral-400 transition-colors hover:border-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UploadIcon className="size-5" />
          <span className="text-caption">
            {isUploading ? "Uploading…" : "Upload image"}
          </span>
        </button>
      )}

      {value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? "Uploading…" : "Replace"}
        </Button>
      )}
    </div>
  );
}

export { ImageUploadField };
