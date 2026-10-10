"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getAchievements } from "@/lib/api/community";

export default function AchievementsPage() {
  const t = useTranslations("Community");
  const tCommon = useTranslations("Common");
  const { data, isPending } = useQuery({
    queryKey: ["community", "achievements"],
    queryFn: async () => (await getAchievements()).data ?? [],
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-white">
          {t("achievementsTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("achievementsIntro")}</p>
      </header>
      {isPending ? (
        <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(data as Array<{
            id: string;
            icon: string;
            name: string;
            description: string;
            rarity: string;
            unlockedAt?: string | null;
          }>).map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-sm font-medium text-white">
                {item.icon} {item.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.description}
              </p>
              <p className="mt-2 text-xs text-primary">
                {item.unlockedAt ? t("rarityUnlocked", { rarity: item.rarity }) : item.rarity}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
