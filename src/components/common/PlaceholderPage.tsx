import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-border/60 bg-card/40 px-6 py-16 text-center">
      <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </section>
  );
}
