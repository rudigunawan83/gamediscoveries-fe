import { GameSection } from "@/components/game/GameSection";
import { mockNewGames } from "@/features/games/mock/games.mock";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "New Games",
  path: "/new",
});

export default function NewGamesPage() {
  return (
    <GameSection
      title="New Discoveries"
      description="Recently added titles from the mock catalog."
      games={mockNewGames}
    />
  );
}
