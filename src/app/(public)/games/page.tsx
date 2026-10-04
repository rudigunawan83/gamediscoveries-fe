import { GameSection } from "@/components/game/GameSection";
import { mockGames } from "@/features/games/mock/games.mock";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Games",
  path: "/games",
});

export default function GamesPage() {
  return (
    <GameSection
      title="All Games"
      description="Browse the current mock catalog foundation."
      games={mockGames}
    />
  );
}
