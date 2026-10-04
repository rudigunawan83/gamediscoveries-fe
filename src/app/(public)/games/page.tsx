import { GamesCatalog } from "@/features/games/components/GamesCatalog";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Games",
  path: "/games",
});

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;

  return (
    <GamesCatalog category={params.category} search={params.q} />
  );
}
