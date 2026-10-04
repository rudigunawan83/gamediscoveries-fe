"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Mail, User, UserPlus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthError } from "@/features/auth/components/AuthError";
import { AuthField } from "@/features/auth/components/AuthField";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getPasswordChecks,
  signupSchema,
  type SignupFormValues,
} from "@/features/auth/schemas/signupSchema";
import { Button } from "@/components/ui/button";
import { ApiClientError } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function toUserFacingError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 409) {
      return "An account with this email already exists.";
    }
    if (error.status === 422) {
      return "Please check your details and try again.";
    }
    if (error.status === 404) {
      return "Sign-up is not available yet. The registration API is not configured.";
    }
    if (error.status === 0 || error.status === 408) {
      return "Unable to reach the server. Please try again.";
    }
    return "Unable to create your account right now. Please try again.";
  }

  return "Unable to create your account right now. Please try again.";
}

export function SignupForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { register: registerAccount } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const password = watch("password") ?? "";
  const checks = getPasswordChecks(password);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerAccount(values, callbackUrl);
    } catch (error) {
      setFormError(toUserFacingError(error));
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <AuthField
        id="signup-display-name"
        label="Display Name"
        icon={User}
        type="text"
        autoComplete="nickname"
        placeholder="Choose a display name"
        error={errors.displayName?.message}
        disabled={isSubmitting}
        {...register("displayName")}
      />

      <AuthField
        id="signup-email"
        label="Email"
        icon={Mail}
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="Enter your email"
        error={errors.email?.message}
        disabled={isSubmitting}
        {...register("email")}
      />

      <div className="space-y-2">
        <label
          htmlFor="signup-password"
          className="text-sm font-medium text-foreground"
        >
          Password
        </label>
        <PasswordInput
          id="signup-password"
          autoComplete="new-password"
          placeholder="Create a password"
          invalid={Boolean(errors.password)}
          aria-describedby="signup-password-checks"
          disabled={isSubmitting}
          {...register("password")}
        />
        <ul id="signup-password-checks" className="space-y-1.5 pt-1">
          {checks.map((check) => (
            <li
              key={check.id}
              className={cn(
                "flex items-center gap-2 text-xs",
                check.met ? "text-emerald-400" : "text-muted-foreground",
              )}
            >
              <Check className="size-3.5" aria-hidden="true" />
              {check.label}
            </li>
          ))}
        </ul>
        {errors.password ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      {formError ? (
        <AuthError id="signup-form-error" message={formError} />
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-xl bg-brand-gradient text-sm font-semibold text-white shadow-[0_12px_30px_rgba(168,85,247,0.35)]"
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>Creating account...</span>
          </>
        ) : (
          <>
            <UserPlus className="size-4" aria-hidden="true" />
            Create Account
          </>
        )}
      </Button>
    </form>
  );
}
