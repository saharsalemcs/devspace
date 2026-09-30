"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProduct } from "@/hooks/admin/use-create-product";
import { useUpdateProduct } from "@/hooks/admin/use-update-product";
import type { AdminProductDetail } from "@/lib/queries/admin-products";
import {
  adminProductSchema,
  type AdminProductInput,
} from "@/lib/schemas/admin-product";
import { GalleryUploadField } from "./gallery-upload-field";
import { ImageUploadField } from "./image-upload-field";

// z.input, not z.infer: the schema uses z.coerce.number() and .default(),
// so what the FORM holds (input) differs from what onSubmit receives (output).
// Third generic below = the type handleSubmit hands to onSubmit.
type ProductFormInput = z.input<typeof adminProductSchema>;

interface ProductFormProps {
  categories: { id: string; name: string }[];
  // Present = edit mode. Absent = create mode.
  product?: AdminProductDetail;
}

// Supabase errors are plain objects ({ message, code, ... }), not Error instances.
function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  // Each upload field reports its own state; Save is blocked if either is busy,
  // otherwise the form could be saved without the images still uploading.
  const [isPrimaryUploading, setIsPrimaryUploading] = useState(false);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const isUploading = isPrimaryUploading || isGalleryUploading;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, AdminProductInput>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: product
      ? {
          name: product.name,
          category_id: product.category_id,
          price: product.price,
          description: product.description ?? "",
          image_url: product.image_url,
          images: product.images,
          is_active: product.is_active,
        }
      : {
          name: "",
          category_id: "",
          price: "",
          description: "",
          image_url: "",
          images: [],
          is_active: true,
        },
  });

  async function onSubmit(values: AdminProductInput) {
    try {
      if (product) {
        await updateProduct.mutateAsync({
          id: product.id,
          values,
          previousImages: {
            image_url: product.image_url,
            images: product.images,
          },
        });
        toast.success("Product updated");
      } else {
        await createProduct.mutateAsync(values);
        toast.success("Product created");
      }
      router.push("/admin/products");
    } catch (error) {
      // Form data is preserved: a failed submit never resets the form.
      toast.error(getErrorMessage(error));
    }
  }

  const submitLabel = isSubmitting
    ? "Saving..."
    : product
      ? "Save changes"
      : "Create product";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-2xl flex-col gap-8"
      noValidate
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-h4 text-foreground font-semibold">Details</h2>

        <FormField label="Name" htmlFor="name" error={errors.name}>
          <Input
            id="name"
            aria-invalid={!!errors.name || undefined}
            {...register("name")}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Category"
            htmlFor="category_id"
            error={errors.category_id}
          >
            <Controller
              control={control}
              name="category_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="category_id"
                    aria-invalid={!!errors.category_id || undefined}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField
            label="Price (EGP)"
            htmlFor="price"
            error={errors.price?.message}
          >
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              aria-invalid={!!errors.price || undefined}
              {...register("price")}
            />
          </FormField>
        </div>

        <FormField
          label="Description (optional)"
          htmlFor="description"
          error={errors.description}
        >
          <Textarea id="description" rows={5} {...register("description")} />
        </FormField>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-h4 text-foreground font-semibold">Images</h2>

        <FormField
          label="Primary image"
          htmlFor="image_url"
          error={errors.image_url}
        >
          <Controller
            control={control}
            name="image_url"
            render={({ field }) => (
              <ImageUploadField
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
                onUploadingChange={setIsPrimaryUploading}
              />
            )}
          />
        </FormField>

        <FormField
          label="Gallery (optional)"
          htmlFor="images"
          // Array-level errors (e.g. "max 8") come back as FieldError-shaped,
          // but RHF types errors.images as an array-merge type.
          error={errors.images as FieldError | undefined}
        >
          <Controller
            control={control}
            name="images"
            render={({ field }) => (
              <GalleryUploadField
                value={field.value ?? []}
                onChange={field.onChange}
                disabled={isSubmitting}
                onUploadingChange={setIsGalleryUploading}
              />
            )}
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-h4 text-foreground font-semibold">Visibility</h2>

        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <label className="flex w-fit items-center gap-2 text-sm">
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                disabled={isSubmitting}
              />
              Active (visible in the store)
            </label>
          )}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isUploading ? "Uploading images..." : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export { ProductForm };
