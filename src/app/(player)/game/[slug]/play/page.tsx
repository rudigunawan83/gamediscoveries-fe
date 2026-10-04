import { notFound } from "next/navigation";
import { GamePlayer } from "@/features/game-player/components/GamePlayer";
import { fetchGameBySlug } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";

interface PlayPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PlayPageProps) {
  const { slug } = await params;
  const game = await fetchGameBySlug(slug);

  return createMetadata({
    title: game ? `Play ${game.title}` : "Play Game",
    description: game
      ? `Play ${game.title} online for free on GameDiscoveries.`
      : "Play free online games on GameDiscoveries.",
    path: `/game/${slug}/play`,
    noIndex: true,
    image: game?.coverUrl ?? game?.thumbnailUrl,
  });
}

export default async function GamePlayPage({ params }: PlayPageProps) {
  const { slug } = await params;
  const game = await fetchGameBySlug(slug);

  if (!game) {
    notFound();
  }

  return (
    <GamePlayer
      gameId={game.id}
      gameSlug={game.slug}
      title={game.title}
      playUrl={game.playUrl ?? game.gameUrl}
      status={game.status}
      orientation={game.orientation}
      width={game.width}
      height={game.height}
      backHref={`/game/${game.slug}`}
    />
  );
}
