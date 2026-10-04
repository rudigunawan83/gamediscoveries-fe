import { Suspense } from "react";
import { LoginGate } from "@/app/(auth)/login/LoginGate";
import { AuthFeatureBar } from "@/features/auth/components/AuthFeatureBar";
import { LoginCard } from "@/features/auth/components/LoginCard";
import { LoginViewTracker } from "@/features/auth/components/LoginViewTracker";
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
        <div className="flex flex-1 flex-col gap-8 lg:gap-10">
          <div className="grid flex-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:gap-12 xl:gap-16">
            <div className="max-w-xl space-y-4 hero-enter">
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Welcome{" "}
                <span className="text-brand-gradient">Back</span>
              </h1>
              <p className="max-w-md text-base text-muted-foreground sm:text-lg hero-enter-delay">
                Continue your gaming journey. Discover new games, save your
                favorites, and play anytime.
              </p>
            </div>
            <div className="justify-self-stretch lg:justify-self-end hero-enter-delay">
              <LoginCard />
            </div>
          </div>
          <AuthFeatureBar />
        </div>
      </LoginGate>
    </Suspense>
  );
}
