"use client";

import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SocialAuthButtons } from "@/features/auth/components/SocialAuthButtons";

export function LoginCard() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1428]/78 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
      <div className="mb-6 space-y-2">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">
          Sign In
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account.
        </p>
      </div>

      <div className="space-y-6">
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
