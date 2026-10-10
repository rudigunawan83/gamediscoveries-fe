import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { GameCommunitySection } from "@/features/community/components/GameCommunitySection";
import { fetchGameBySlug } from "@/features/games/api/games.api";
import {
  createMetadata,
  generateCommunityMetadata,
} from "@/lib/seo/metadata";
import { SEO_CONFIG } from "@/lib/seo/config";

interface GameCommunityPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GameCommunityPageProps) {
  const { slug } = await params;
  const [game, t, tCommunity] = await Promise.all([
    fetchGameBySlug(slug),
    getTranslations("Seo"),
    getTranslations("Community"),
  ]);
  if (!game) {
    return createMetadata({
      title: t("gameCommunityFallback"),
      path: `/game/${slug}/community`,
      noIndex: true,
    });
  }

  return generateCommunityMetadata({
    title: tCommunity("gameCommunityTitle", { game: game.title }),
    description: t("gameCommunityDescription", { game: game.title }),
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
