import { notFound } from "next/navigation";
import { GameCommunitySection } from "@/features/community/components/GameCommunitySection";
import { fetchGameBySlug } from "@/features/games/api/games.api";
import { createMetadata } from "@/lib/seo/metadata";

interface GameCommunityPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GameCommunityPageProps) {
  const { slug } = await params;
  const game = await fetchGameBySlug(slug);
  if (!game) {
    return createMetadata({
      title: "Game Community",
      path: `/game/${slug}/community`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: `${game.title} Community`,
    description: `Discuss ${game.title}, share tips, and read player conversations on GameDiscoveries.`,
    path: `/game/${slug}/community`,
    image: game.thumbnailUrl ?? game.coverUrl,
  });
}

export default async function GameCommunityPage({
  params,
}: GameCommunityPageProps) {
  const { slug } = await params;
  const game = await fetchGameBySlug(slug);
  if (!game) notFound();

  return (
    <GameCommunitySection
      slug={game.slug}
      gameId={game.id}
      gameTitle={game.title}
    />
  );
}
