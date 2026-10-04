"use client";

import { ErrorState } from "@/components/common/ErrorState";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Something went wrong."
      description="We hit an unexpected issue while loading this page."
      onRetry={reset}
    />
  );
}
