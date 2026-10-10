import { Heart, Sparkles, Users, Zap, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AuthMessageKey } from "@/features/auth/authMessages";

const features = [
  { icon: Heart, title: "benefitFavoritesTitle", description: "benefitFavoritesText" },
  { icon: Sparkles, title: "benefitRecommendationsTitle", description: "benefitRecommendationsText" },
  { icon: Zap, title: "benefitAnywhereTitle", description: "benefitAnywhereText" },
  { icon: Users, title: "benefitCommunityTitle", description: "benefitCommunityText" },
] as const satisfies readonly { icon: LucideIcon; title: AuthMessageKey; description: AuthMessageKey }[];

export function AuthFeatureList() {
  const t = useTranslations("Auth");
  return (
    <ul className="space-y-4">
      {features.map(({ icon: Icon, title, description }) => (
        <li key={title} className="flex gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-foreground">{t(title)}</p>
            <p className="text-sm text-muted-foreground">{t(description)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
