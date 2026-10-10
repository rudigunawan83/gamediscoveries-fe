import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("Player");

  return createMetadata({
    title: game ? t("metaTitle", { title: game.title }) : t("metaTitleFallback"),
    description: game
      ? t("metaDescription", { title: game.title })
      : t("metaDescriptionFallback"),
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
