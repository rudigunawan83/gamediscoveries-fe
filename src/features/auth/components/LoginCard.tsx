"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginCard() {
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  return (
    <div className="w-full max-w-md rounded-2xl border border-primary/20 bg-[#151820]/88 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:rounded-3xl sm:p-7">
      <div className="mb-5 space-y-1.5 sm:mb-6 sm:space-y-2">
        <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
          {tCommon("signIn")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("loginCardSubtitle")}</p>
      </div>

      <div className="space-y-5 sm:space-y-6">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          {t("noAccountPrompt")}{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary hover:underline"
          >
            {t("signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
