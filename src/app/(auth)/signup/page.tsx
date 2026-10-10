import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { SignupGate } from "@/app/(auth)/signup/SignupGate";
import { AuthFeatureList } from "@/features/auth/components/AuthFeatureList";
import { MobileSignup } from "@/features/auth/components/MobileAuth";
import { SignupCard } from "@/features/auth/components/SignupCard";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const t = await getTranslations("Auth");
  return createMetadata({
    title: t("createAccount"),
    path: "/signup",
    noIndex: true,
  });
}

export default function SignupPage() {
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  return (
    <Suspense
      fallback={<div className="text-sm text-muted-foreground">{tCommon("loading")}</div>}
    >
      <SignupGate>
        <div className="lg:hidden">
          <MobileSignup />
        </div>
        <div className="hidden flex-1 items-start lg:grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:items-center lg:gap-14 xl:gap-20">
          <div className="max-w-xl space-y-4 hero-enter lg:space-y-8">
            <div className="space-y-2 sm:space-y-4">
              <h1 className="font-display text-[2rem] font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {t.rich("signupHeroTitle", {
                  highlight: (chunks) => <span className="text-brand-gradient">{chunks}</span>,
                })}
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-white/80 sm:text-base sm:text-muted-foreground lg:text-lg">
                {t("signupHeroText")}
              </p>
            </div>
            <div className="hidden lg:block hero-enter-delay">
              <AuthFeatureList />
            </div>
          </div>
          <div className="w-full justify-self-stretch lg:justify-self-end hero-enter-delay">
            <SignupCard />
          </div>
        </div>
      </SignupGate>
    </Suspense>
  );
}
