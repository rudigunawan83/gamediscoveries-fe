"use client";

import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SocialAuthButtons } from "@/features/auth/components/SocialAuthButtons";

export function LoginCard() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-primary/20 bg-[#151820]/88 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:rounded-3xl sm:p-7">
      <div className="mb-5 space-y-1.5 sm:mb-6 sm:space-y-2">
        <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
          Sign In
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account.
        </p>
      </div>

      <div className="space-y-5 sm:space-y-6">
        <LoginForm />
        <SocialAuthButtons mode="continue" />
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
