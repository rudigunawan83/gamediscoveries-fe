"use client";

import Link from "next/link";
import { SignupForm } from "@/features/auth/components/SignupForm";
import { SocialAuthButtons } from "@/features/auth/components/SocialAuthButtons";

export function SignupCard() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1428]/78 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
      <div className="mb-6 space-y-2">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">
          Create Account
        </h2>
        <p className="text-sm text-muted-foreground">
          Join thousands of gamers around the world.
        </p>
      </div>

      <div className="space-y-6">
        <SignupForm />
        <SocialAuthButtons mode="signup" />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
