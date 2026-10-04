import { Heart, Sparkles, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Save Your Favorites",
    description: "Keep track of games you love.",
  },
  {
    icon: Sparkles,
    title: "Get Personalized Recommendations",
    description: "Discover games you’ll enjoy.",
  },
  {
    icon: Zap,
    title: "Play Anytime, Anywhere",
    description: "Access your games on any device.",
  },
  {
    icon: Users,
    title: "Join the Community",
    description: "Be part of a growing gaming community.",
  },
] as const;

export function AuthFeatureList() {
  return (
    <ul className="space-y-4">
      {features.map(({ icon: Icon, title, description }) => (
        <li key={title} className="flex gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
