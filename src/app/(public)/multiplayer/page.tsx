import { GameSection } from "@/components/game/GameSection";
import { mockMultiplayerGames } from "@/features/games/mock/games.mock";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Multiplayer",
  path: "/multiplayer",
});

export default function MultiplayerPage() {
  return (
    <GameSection
      title="Multiplayer"
      description="Play with friends — competitive or co-op."
      games={mockMultiplayerGames}
    />
  );
}
