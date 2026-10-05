"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { GameSection } from "@/components/game/GameSection";
import { SectionSkeleton } from "@/components/game/SectionSkeleton";
import { mapRecommendationItems } from "@/features/recommendations/mappers";
import { analytics } from "@/lib/analytics/client";
import {
  getRecommendationHome,
  postRecommendationImpression,
} from "@/lib/api/recommendations";

export function RecommendationHomeShelves() {
  const reported = useRef(new Set<string>());
  const { data, isPending } = useQuery({
    queryKey: ["recommendations", "home"],
    queryFn: async () => (await getRecommendationHome(12)).data!,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!data?.sections?.length) return;
    const requestId = data.recommendationRequestId;
    for (const section of data.sections) {
      for (const item of section.items) {
        const position = item.position ?? item.rank;
        const key = `${requestId}:${section.type}:${item.game.id}:${position}`;
        if (reported.current.has(key)) continue;
        reported.current.add(key);

        analytics.track("recommendation_impression", {
          recommendationRequestId: requestId,
          gameId: item.game.id,
          position,
          section: section.type,
          strategy: data.algorithmVersion,
        });

        void postRecommendationImpression({
          recommendationRequestId: requestId,
          gameId: item.game.id,
          position,
          section: section.type,
          eventType: "IMPRESSION",
        }).catch(() => {
          /* best-effort */
        });
      }
    }
  }, [data]);

  if (isPending) {
    return (
      <div className="space-y-10">
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
    );
  }

  if (!data?.sections?.length) return null;

  return (
    <div className="space-y-10 md:space-y-14">
      {data.sections.map((section) => (
        <GameSection
          key={section.type}
          title={section.title}
          description={
            section.type === "EXPLORATION"
              ? "High-quality picks outside your usual genres."
              : undefined
          }
          games={mapRecommendationItems(section.items)}
          href="/"
          variant="discovery"
        />
      ))}
    </div>
  );
}
