import { Suspense } from "react";
import { SignupGate } from "@/app/(auth)/signup/SignupGate";
import { AuthFeatureList } from "@/features/auth/components/AuthFeatureList";
import { MobileSignup } from "@/features/auth/components/MobileAuth";
import { SignupCard } from "@/features/auth/components/SignupCard";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Create Account",
  path: "/signup",
  noIndex: true,
});

export default function SignupPage() {
  return (
    <Suspense
      fallback={<div className="text-sm text-muted-foreground">Loading…</div>}
    >
      <SignupGate>
        <div className="lg:hidden">
          <MobileSignup />
        </div>
        <div className="hidden flex-1 items-start lg:grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:items-center lg:gap-14 xl:gap-20">
          <div className="max-w-xl space-y-4 hero-enter lg:space-y-8">
            <div className="space-y-2 sm:space-y-4">
              <h1 className="font-display text-[2rem] font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Join the{" "}
                <span className="text-brand-gradient">Adventure</span>
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-white/80 sm:text-base sm:text-muted-foreground lg:text-lg">
                Create your account and start discovering amazing games today.
                It&apos;s free and only takes a minute.
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
