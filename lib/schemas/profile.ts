import { z } from "zod";

import { EGYPT_PHONE_REGEX } from "./checkout";

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name"),
  phone: z
    .string()
    .trim()
    .regex(EGYPT_PHONE_REGEX, "Enter a valid Egyptian phone number"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
