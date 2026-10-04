"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends Omit<React.ComponentProps<"input">, "className"> {
  label: string;
  icon: LucideIcon;
  error?: string;
  trailing?: ReactNode;
  inputClassName?: string;
}

export function AuthField({
  id,
  label,
  icon: Icon,
  error,
  trailing,
  inputClassName,
  disabled,
  ...props
}: AuthFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={id}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={errorId}
          className={cn(
            "h-12 rounded-xl border-white/10 bg-[#0b1224]/85 pl-11 text-sm placeholder:text-muted-foreground/80",
            trailing ? "pr-11" : undefined,
            inputClassName,
          )}
          {...props}
        />
        {trailing}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
