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
    <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/40 px-2.5 py-3 backdrop-blur-md sm:mt-8 sm:gap-3 sm:px-5 sm:py-4">
      {features.map(({ icon: Icon, title, description }) => (
        <div
          key={title}
          className="flex min-w-0 flex-col items-center gap-1.5 text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary sm:size-10">
            <Icon className="size-3.5 sm:size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.7rem] font-semibold leading-tight text-foreground sm:text-sm">
              {title}
            </p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              {description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
