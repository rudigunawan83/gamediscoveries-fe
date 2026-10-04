import { z } from "zod";

export const signupSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(40, "Display name must be at most 40 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Za-z]/, "Password must include a letter.")
    .regex(/[0-9]/, "Password must include a number."),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

export function getPasswordChecks(password: string) {
  const hasMinLength = password.length >= 8;
  const hasLetterAndNumber = /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  const isStrong = hasMinLength && hasLetterAndNumber && password.length >= 10;

  return [
    { id: "length", label: "At least 8 characters", met: hasMinLength },
    {
      id: "mix",
      label: "Include a letter and a number",
      met: hasLetterAndNumber,
    },
    { id: "strong", label: "Use a strong password", met: isStrong },
  ] as const;
}
