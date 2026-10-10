"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getChallenges } from "@/lib/api/community";

export default function ChallengesPage() {
  const t = useTranslations("Community");
  const tCommon = useTranslations("Common");
  const { data, isPending } = useQuery({
    queryKey: ["community", "challenges"],
    queryFn: async () => (await getChallenges()).data ?? [],
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-white">
          {t("challengesTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("challengesIntro")}</p>
      </header>
      {isPending ? (
        <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
      ) : (
        <div className="space-y-3">
          {(data as Array<{
            id: string;
            title: string;
            description: string;
            targetValue: number;
            progress: number;
            completed: boolean;
            status: string;
            endAt: string;
          }>).map((challenge) => (
            <article
              key={challenge.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-medium text-white">{challenge.title}</h2>
                <span className="text-xs uppercase text-muted-foreground">
                  {challenge.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {challenge.description}
              </p>
              <p className="mt-2 text-xs text-primary">
                {t(challenge.completed ? "challengeProgressDone" : "challengeProgress", {
                  current: challenge.progress,
                  target: challenge.targetValue,
                })}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
