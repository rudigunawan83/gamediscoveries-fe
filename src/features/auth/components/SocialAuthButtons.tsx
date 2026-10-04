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
      <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground sm:gap-3 sm:text-xs sm:tracking-[0.18em]">
        <span className="h-px flex-1 bg-white/10" />
        <span className="shrink-0">
          {mode === "signup" ? "Or sign up with" : "Or continue with"}
        </span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-primary/15 bg-[#12161f]/80 px-1 text-xs font-medium text-foreground hover:bg-primary/10 sm:h-11 sm:text-sm"
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
