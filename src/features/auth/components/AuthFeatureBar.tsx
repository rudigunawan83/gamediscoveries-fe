import { Gamepad2, Heart, Zap } from "lucide-react";

const features = [
  {
    icon: Gamepad2,
    title: "Discover",
    description: "Thousands of free games",
  },
  {
    icon: Zap,
    title: "Play Anytime",
    description: "No download required",
  },
  {
    icon: Heart,
    title: "Save Favorites",
    description: "Build your collection",
  },
] as const;

export function AuthFeatureBar() {
  return (
    <div className="mt-auto grid gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-4 backdrop-blur-md sm:grid-cols-3 sm:px-6">
      {features.map(({ icon: Icon, title, description }) => (
        <div key={title} className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
