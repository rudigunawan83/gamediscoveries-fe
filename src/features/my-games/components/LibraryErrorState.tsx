"use client";

import { Button } from "@/components/ui/button";

type LibraryErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function LibraryErrorState({ message, onRetry }: LibraryErrorStateProps) {
  return (
    <div
      className="rounded-2xl border border-border/50 bg-card/30 px-4 py-8 text-center"
      role="alert"
    >
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}
