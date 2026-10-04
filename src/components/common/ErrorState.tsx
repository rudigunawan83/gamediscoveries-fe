import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong.",
  description = "We couldn't load the games.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/70 bg-card/60 px-6 py-16 text-center"
    >
      <AlertTriangle className="size-10 text-warning" aria-hidden="true" />
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        <p className="max-w-md text-muted-foreground">{description}</p>
      </div>
      {onRetry ? (
        <Button type="button" onClick={onRetry}>
          Try Again
        </Button>
      ) : null}
    </div>
  );
}
