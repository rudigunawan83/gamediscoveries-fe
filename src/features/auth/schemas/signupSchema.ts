import { z } from "zod";
import { authKey } from "@/features/auth/authMessages";

export const signupSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, authKey("displayNameMin"))
    .max(40, authKey("displayNameMax")),
  email: z
    .string()
    .trim()
    .min(1, authKey("emailRequired"))
    .email(authKey("emailInvalid")),
  password: z
    .string()
    .min(8, authKey("passwordMin"))
    .regex(/[A-Za-z]/, authKey("passwordLetter"))
    .regex(/[0-9]/, authKey("passwordNumber")),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

export function getPasswordChecks(password: string) {
  const hasMinLength = password.length >= 8;
  const hasLetterAndNumber = /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  const isStrong = hasMinLength && hasLetterAndNumber && password.length >= 10;

  return [
    { id: "length", label: authKey("checkLength"), met: hasMinLength },
    { id: "mix", label: authKey("checkMix"), met: hasLetterAndNumber },
    { id: "strong", label: authKey("checkStrong"), met: isStrong },
  ] as const;
}
