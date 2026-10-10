"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail, User, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type ComponentProps, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { type AuthMessageKey, useAuthMessage } from "@/features/auth/authMessages";
import { loginErrorMessage } from "@/features/auth/components/LoginForm";
import { signupErrorMessage } from "@/features/auth/components/SignupForm";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/loginSchema";
import { signupSchema, type SignupFormValues } from "@/features/auth/schemas/signupSchema";
import { MobileSubpageHeader } from "@/features/mobile-tabs/components/MobileSubpageHeader";
import { cn } from "@/lib/utils";

function useCallbackUrl() {
  return useSearchParams().get("callbackUrl") || "/";
}

function withCallback(path: string, callbackUrl: string) {
  return callbackUrl === "/" ? path : `${path}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

function MobileAuthScaffold({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl pb-8">
      <MobileSubpageHeader title={null} fallbackHref="/" />
      <div className="px-2">
        <div className="flex flex-col items-center">
          <Image src="/images/logo-mark.png" alt="" width={72} height={72} priority />
          <p className="mt-2 font-display text-2xl font-black tracking-tight text-white">
            Game
            <span className="bg-brand-gradient bg-clip-text text-transparent">Discoveries</span>
          </p>
        </div>
        <h1 className="mt-7 text-2xl font-black text-white">{title}</h1>
        <p className="mt-1.5 text-sm text-[#9c9cb0]">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

type AppFieldProps = ComponentProps<"input"> & {
  icon: LucideIcon;
  error?: string;
  trailing?: ReactNode;
};

function AppField({ id, icon: Icon, error, trailing, ...props }: AppFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#9c9cb0]"
          aria-hidden="true"
        />
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            "h-14 w-full rounded-[14px] bg-[#1e1e29] pl-12 text-base text-white outline-none ring-1 ring-transparent placeholder:text-[#6b6b7e] focus:ring-[#ffc83d] disabled:opacity-60",
            trailing ? "pr-12" : "pr-4",
            error && "ring-[#ff5d73]",
          )}
          {...props}
        />
        {trailing}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 px-3 text-xs text-[#ff5d73]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PasswordField(props: Omit<AppFieldProps, "icon" | "trailing" | "type">) {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("Auth");
  return (
    <AppField
      {...props}
      icon={Lock}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? t("hidePassword") : t("showPassword")}
          className="absolute inset-y-0 right-1 grid w-11 place-items-center text-[#9c9cb0]"
        >
          {visible ? (
            <EyeOff className="size-5" aria-hidden="true" />
          ) : (
            <Eye className="size-5" aria-hidden="true" />
          )}
        </button>
      }
    />
  );
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mb-3 rounded-xl border border-[#ff5d73]/40 bg-[#ff5d73]/12 p-3 text-sm text-[#ff5d73]"
    >
      {message}
    </p>
  );
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  const t = useTranslations("Auth");
  return (
    <button
      type="submit"
      disabled={busy}
      aria-busy={busy}
      className="grid h-[52px] w-full place-items-center rounded-2xl bg-[#ffc83d] text-base font-extrabold text-[#1a1205] disabled:opacity-70"
    >
      {busy ? (
        <Loader2 className="size-5 animate-spin" aria-label={t("busy", { label })} />
      ) : (
        label
      )}
    </button>
  );
}

function SwitchLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      replace
      className="mt-3 block py-3 text-center text-sm font-semibold text-[#ffc83d]"
    >
      {children}
    </Link>
  );
}

export function MobileLogin() {
  const callbackUrl = useCallbackUrl();
  const { login } = useAuth();
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const message = useAuthMessage();
  const [formError, setFormError] = useState<AuthMessageKey | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values, callbackUrl);
    } catch (error) {
      setFormError(loginErrorMessage(error));
    }
  });

  return (
    <MobileAuthScaffold title={t("loginTitle")} subtitle={t("loginSubtitle")}>
      <form onSubmit={onSubmit} noValidate>
        <div className="space-y-3">
          <AppField
            id="m-login-email"
            icon={Mail}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t("email")}
            aria-label={t("email")}
            error={message(errors.email?.message)}
            disabled={isSubmitting}
            {...register("email")}
          />
          <PasswordField
            id="m-login-password"
            autoComplete="current-password"
            placeholder={t("password")}
            aria-label={t("password")}
            error={message(errors.password?.message)}
            disabled={isSubmitting}
            {...register("password")}
          />
        </div>
        <div className="mt-5">
          <FormError message={formError && t(formError)} />
          <SubmitButton busy={isSubmitting} label={tCommon("signIn")} />
        </div>
      </form>
      <SwitchLink href={withCallback("/signup", callbackUrl)}>{t("noAccount")}</SwitchLink>
    </MobileAuthScaffold>
  );
}

export function MobileSignup() {
  const callbackUrl = useCallbackUrl();
  const { register: registerAccount } = useAuth();
  const t = useTranslations("Auth");
  const message = useAuthMessage();
  const [formError, setFormError] = useState<AuthMessageKey | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { displayName: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerAccount(values, callbackUrl);
    } catch (error) {
      setFormError(signupErrorMessage(error));
    }
  });

  return (
    <MobileAuthScaffold title={t("signupTitle")} subtitle={t("signupSubtitle")}>
      <form onSubmit={onSubmit} noValidate>
        <div className="space-y-3">
          <AppField
            id="m-signup-name"
            icon={User}
            type="text"
            autoComplete="nickname"
            placeholder={t("displayName")}
            aria-label={t("displayName")}
            error={message(errors.displayName?.message)}
            disabled={isSubmitting}
            {...register("displayName")}
          />
          <AppField
            id="m-signup-email"
            icon={Mail}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t("email")}
            aria-label={t("email")}
            error={message(errors.email?.message)}
            disabled={isSubmitting}
            {...register("email")}
          />
          <PasswordField
            id="m-signup-password"
            autoComplete="new-password"
            placeholder={t("password")}
            aria-label={t("password")}
            error={message(errors.password?.message)}
            disabled={isSubmitting}
            {...register("password")}
          />
        </div>
        <div className="mt-5">
          <FormError message={formError && t(formError)} />
          <SubmitButton busy={isSubmitting} label={t("createAccount")} />
        </div>
      </form>
      <SwitchLink href={withCallback("/login", callbackUrl)}>{t("haveAccount")}</SwitchLink>
    </MobileAuthScaffold>
  );
}
