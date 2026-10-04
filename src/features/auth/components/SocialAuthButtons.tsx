"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const providers = [
  { id: "google", label: "Google" },
  { id: "discord", label: "Discord" },
  { id: "apple", label: "Apple" },
] as const;

interface SocialAuthButtonsProps {
  mode?: "continue" | "signup";
}

export function SocialAuthButtons({ mode = "continue" }: SocialAuthButtonsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <span className="h-px flex-1 bg-white/10" />
        <span>{mode === "signup" ? "Or sign up with" : "Or continue with"}</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-white/10 bg-[#0b1224]/70 text-sm font-medium text-foreground hover:bg-white/5"
            onClick={() =>
              toast.message(`${provider.label} sign-in is coming soon.`)
            }
          >
            {provider.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
