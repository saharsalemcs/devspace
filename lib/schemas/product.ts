import { z } from "zod";

export const PRODUCT_SORT_VALUES = [
  "newest",
  "price-asc",
  "price-desc",
  "top-rated",
] as const;

export type ProductSort = (typeof PRODUCT_SORT_VALUES)[number];
// type ProductSort = "newest" | "price-asc" | "price-desc" | "top-rated";

export interface ProductFilters {
  search?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
}

const productSortSchema = z.enum(PRODUCT_SORT_VALUES).catch("newest");

const productPageSchema = z.coerce.number().int().min(1).catch(1);

const productPriceSchema = z.coerce
  .number()
  .nonnegative()
  .optional()
  .catch(undefined);

const toSingle = (value: unknown) => (Array.isArray(value) ? value[0] : value);
const toArray = (value: unknown) =>
  value === undefined ? undefined : Array.isArray(value) ? value : [value];

// z.preprocess(fn, schema)
export const productQueryParamsSchema = z
  .object({
    q: z.preprocess(
      toSingle,
      z.string().trim().min(1).optional().catch(undefined),
    ),
    category: z.preprocess(
      toArray,
      z.array(z.uuid()).optional().catch(undefined),
    ),
    minPrice: z.preprocess(toSingle, productPriceSchema),
    maxPrice: z.preprocess(toSingle, productPriceSchema),
    sort: z.preprocess(toSingle, productSortSchema),
    page: z.preprocess(toSingle, productPageSchema),
  })
  .transform(({ q, category, minPrice, maxPrice, sort, page }) => ({
    filters: {
      search: q,
      categoryIds: category,
      minPrice,
      maxPrice,
    } satisfies ProductFilters,
    sort,
    page,
  }));

export type ProductQueryParams = z.infer<typeof productQueryParamsSchema>;

export type RawProductSearchParams = Record<
  string,
  string | string[] | undefined
>;

export function parseProductSearchParams(
  searchParams: RawProductSearchParams,
): ProductQueryParams {
  return productQueryParamsSchema.parse(searchParams);
}

export function searchParamsToRecord(
  searchParams: URLSearchParams,
): RawProductSearchParams {
  const record: RawProductSearchParams = {};
  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key);
    record[key] = values.length > 1 ? values : values[0];
  }
  return record;
}
