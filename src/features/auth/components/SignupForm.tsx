"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Mail, User, UserPlus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { type AuthMessageKey, useAuthMessage } from "@/features/auth/authMessages";
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

export function signupErrorMessage(error: unknown): AuthMessageKey {
  if (error instanceof ApiClientError) {
    if (error.status === 409) {
      return "errorEmailTaken";
    }
    if (error.status === 422) {
      return "errorCheckDetails";
    }
    if (error.status === 404) {
      return "errorSignupUnavailable";
    }
    if (error.status === 0 || error.status === 408) {
      return "errorNetwork";
    }
  }

  return "errorSignupGeneric";
}

export function SignupForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { register: registerAccount } = useAuth();
  const t = useTranslations("Auth");
  const message = useAuthMessage();
  const [formError, setFormError] = useState<AuthMessageKey | null>(null);

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
      setFormError(signupErrorMessage(error));
    }
  });

  return (
    <form className="space-y-4 sm:space-y-5" onSubmit={onSubmit} noValidate>
      <AuthField
        id="signup-display-name"
        label={t("displayName")}
        icon={User}
        type="text"
        autoComplete="nickname"
        placeholder={t("displayNamePlaceholder")}
        error={message(errors.displayName?.message)}
        disabled={isSubmitting}
        {...register("displayName")}
      />

      <AuthField
        id="signup-email"
        label={t("email")}
        icon={Mail}
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder={t("emailPlaceholder")}
        error={message(errors.email?.message)}
        disabled={isSubmitting}
        {...register("email")}
      />

      <div className="space-y-2">
        <label
          htmlFor="signup-password"
          className="text-sm font-medium text-foreground"
        >
          {t("password")}
        </label>
        <PasswordInput
          id="signup-password"
          autoComplete="new-password"
          placeholder={t("newPasswordPlaceholder")}
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
              {t(check.label)}
            </li>
          ))}
        </ul>
        {errors.password ? (
          <p role="alert" className="text-sm text-destructive">
            {message(errors.password.message)}
          </p>
        ) : null}
      </div>

      {formError ? (
        <AuthError id="signup-form-error" message={t(formError)} />
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
            <span>{t("creatingAccount")}</span>
          </>
        ) : (
          <>
            <UserPlus className="size-4" aria-hidden="true" />
            {t("createAccount")}
          </>
        )}
      </Button>
    </form>
  );
}
