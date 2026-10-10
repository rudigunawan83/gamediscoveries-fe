"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type AuthMessageKey, useAuthMessage } from "@/features/auth/authMessages";
import { AuthError } from "@/features/auth/components/AuthError";
import { AuthField } from "@/features/auth/components/AuthField";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/loginSchema";
import { Button } from "@/components/ui/button";
import { ApiClientError } from "@/lib/api/types";

const REMEMBER_EMAIL_KEY = "gd_remember_email";

export function loginErrorMessage(error: unknown): AuthMessageKey {
  if (error instanceof ApiClientError) {
    if (error.status === 401) {
      return "errorInvalidCredentials";
    }
    if (error.status === 404) {
      return "errorLoginUnavailable";
    }
    if (error.status === 0 || error.status === 408) {
      return "errorNetwork";
    }
  }

  return "errorLoginGeneric";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { login } = useAuth();
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const message = useAuthMessage();
  const [formError, setFormError] = useState<AuthMessageKey | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (saved) setValue("email", saved);
    } catch {
      // Ignore storage access errors.
    }
  }, [setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values, callbackUrl);
      try {
        if (rememberMe) {
          window.localStorage.setItem(REMEMBER_EMAIL_KEY, values.email);
        } else {
          window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      } catch {
        // Ignore storage access errors.
      }
    } catch (error) {
      setFormError(loginErrorMessage(error));
    }
  });

  return (
    <form className="space-y-4 sm:space-y-5" onSubmit={onSubmit} noValidate>
      <AuthField
        id="login-email"
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
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="login-password"
            className="text-sm font-medium text-foreground"
          >
            {t("password")}
          </label>
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => toast.message(t("passwordResetSoon"))}
          >
            {t("forgotPassword")}
          </button>
        </div>
        <PasswordInput
          id="login-password"
          placeholder={t("passwordPlaceholder")}
          invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "login-password-error" : undefined
          }
          disabled={isSubmitting}
          {...register("password")}
        />
        {errors.password ? (
          <p
            id="login-password-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {message(errors.password.message)}
          </p>
        ) : null}
      </div>

      <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
          className="size-4 rounded border-primary/30 bg-[#12161f] accent-primary"
        />
        {t("rememberMe")}
      </label>

      {formError ? <AuthError id="login-form-error" message={t(formError)} /> : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-xl bg-brand-gradient text-sm font-semibold text-white shadow-[0_12px_30px_rgba(168,85,247,0.35)]"
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>{t("signingIn")}</span>
            <span className="sr-only">{t("signingInWait")}</span>
          </>
        ) : (
          <>
            <LogIn className="size-4" aria-hidden="true" />
            {tCommon("signIn")}
          </>
        )}
      </Button>
    </form>
  );
}
