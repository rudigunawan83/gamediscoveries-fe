import { z } from "zod";
import { authKey } from "@/features/auth/authMessages";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, authKey("emailRequired"))
    .email(authKey("emailInvalid")),
  password: z.string().min(1, authKey("passwordRequired")),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
