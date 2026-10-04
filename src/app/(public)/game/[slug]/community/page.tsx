import { notFound } from "next/navigation";
import { GameCommunitySection } from "@/features/community/components/GameCommunitySection";
import { fetchGameBySlug } from "@/features/games/api/games.api";
import {
  createMetadata,
  generateCommunityMetadata,
} from "@/lib/seo/metadata";
import { communityGameTitle } from "@/lib/seo/titles";
import { SEO_CONFIG } from "@/lib/seo/config";

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

  return generateCommunityMetadata({
    title: communityGameTitle(game.title),
    description: `Discuss ${game.title}, share tips, and read player conversations on GameDiscoveries.`,
    path: `/game/${slug}/community`,
    image: game.thumbnailUrl ?? game.coverUrl,
    indexable: SEO_CONFIG.enableCommunityIndexing,
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
