import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="The page you were looking for doesn't exist or has moved."
      action={
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      }
    />
  );
}
