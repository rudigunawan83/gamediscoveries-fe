"use client";

import { Eye, EyeOff, Lock, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  invalid?: boolean;
  icon?: LucideIcon;
}

export function PasswordInput({
  className,
  invalid,
  id,
  icon: Icon = Lock,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("Auth");

  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={props.autoComplete ?? "current-password"}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-12 rounded-xl border-primary/15 bg-[#12161f]/90 pl-11 pr-11 text-sm placeholder:text-muted-foreground/80",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? t("hidePassword") : t("showPassword")}
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
