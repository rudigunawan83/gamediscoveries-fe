import { GameSection } from "@/components/game/GameSection";
import { fetchGames } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Mobile Games",
  path: "/mobile",
});

export const dynamic = "force-dynamic";

export default async function MobileGamesPage() {
  const mobileGames = await fetchGames({
    page: 1,
    pageSize: 48,
    mobileReady: true,
    sort: "newest",
  });

  return (
    <GameSection
      title="Mobile Ready"
      description="Games optimized for portrait and on-the-go play."
      games={mobileGames}
    />
  );
}
