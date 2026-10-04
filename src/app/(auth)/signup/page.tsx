import { Suspense } from "react";
import { SignupGate } from "@/app/(auth)/signup/SignupGate";
import { AuthFeatureList } from "@/features/auth/components/AuthFeatureList";
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
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:gap-14 xl:gap-20">
          <div className="max-w-xl space-y-8 hero-enter">
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Join the{" "}
                <span className="text-brand-gradient">Adventure</span>
              </h1>
              <p className="max-w-md text-base text-muted-foreground sm:text-lg hero-enter-delay">
                Create your account and start discovering amazing games today.
                It&apos;s free and only takes a minute.
              </p>
            </div>
            <div className="hero-enter-delay">
              <AuthFeatureList />
            </div>
          </div>
          <div className="justify-self-stretch lg:justify-self-end hero-enter-delay">
            <SignupCard />
          </div>
        </div>
      </SignupGate>
    </Suspense>
  );
}
