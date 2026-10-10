import { Suspense } from "react";
import { LoginGate } from "@/app/(auth)/login/LoginGate";
import { AuthFeatureBar } from "@/features/auth/components/AuthFeatureBar";
import { LoginCard } from "@/features/auth/components/LoginCard";
import { LoginViewTracker } from "@/features/auth/components/LoginViewTracker";
import { MobileLogin } from "@/features/auth/components/MobileAuth";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Sign In",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="text-sm text-muted-foreground">Loading…</div>}
    >
      <LoginGate>
        <LoginViewTracker />
        <div className="lg:hidden">
          <MobileLogin />
        </div>
        <div className="hidden flex-1 flex-col lg:flex">
          <div className="grid flex-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:items-center lg:gap-12 xl:gap-16">
            <div className="max-w-xl space-y-2 hero-enter sm:space-y-4">
              <h1 className="font-display text-[2rem] font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Welcome{" "}
                <span className="text-brand-gradient">Back</span>
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-white/80 sm:text-base sm:text-muted-foreground lg:text-lg">
                Continue your gaming journey. Discover new games, save your
                favorites, and play anytime.
              </p>
            </div>
            <div className="w-full justify-self-stretch lg:justify-self-end hero-enter-delay">
              <LoginCard />
            </div>
          </div>
          <AuthFeatureBar />
        </div>
      </LoginGate>
    </Suspense>
  );
}
