import { z } from "zod";

export const EGYPT_GOVERNORATES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Sharqia",
  "Dakahlia",
  "Beheira",
  "Gharbia",
  "Monufia",
  "Kafr El Sheikh",
  "Damietta",
  "Port Said",
  "Ismailia",
  "Suez",
  "North Sinai",
  "South Sinai",
  "Faiyum",
  "Beni Suef",
  "Minya",
  "Asyut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "New Valley",
  "Matrouh",
] as const;

export const shippingAddressSchema = z.object({
  street: z.string().trim().min(5, "Enter a full street address"),
  city: z.string().trim().min(2, "Enter a city"),
  governorate: z.enum(EGYPT_GOVERNORATES, {
    error: "Select a governorate",
  }),
  postal_code: z.string().trim().optional(),
  notes: z
    .string()
    .trim()
    .max(300, "Notes must be under 300 characters")
    .optional(),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export const customerInfoSchema = z.object({
  customer_name: z.string().trim().min(2, "Enter your full name"),
  customer_phone: z
    .string()
    .trim()
    .regex(/^01[0125][0-9]{8}$/, "Enter a valid Egyptian phone number"),
});

export type CustomerInfo = z.infer<typeof customerInfoSchema>;

export const checkoutSchema = customerInfoSchema.extend({
  shipping: shippingAddressSchema,
  payment_method: z.literal("cod"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
