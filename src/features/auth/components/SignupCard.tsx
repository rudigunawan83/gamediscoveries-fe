"use client";

import Link from "next/link";
import { SignupForm } from "@/features/auth/components/SignupForm";
import { SocialAuthButtons } from "@/features/auth/components/SocialAuthButtons";

export function SignupCard() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/12 bg-[#0b1224]/82 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:rounded-3xl sm:p-7">
      <div className="mb-5 space-y-1.5 sm:mb-6 sm:space-y-2">
        <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
          Create Account
        </h2>
        <p className="text-sm text-muted-foreground">
          Join thousands of gamers around the world.
        </p>
      </div>

      <div className="space-y-5 sm:space-y-6">
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
