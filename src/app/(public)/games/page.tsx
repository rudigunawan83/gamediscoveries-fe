import { GamesCatalog } from "@/features/games/components/GamesCatalog";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Games — Play Free Online",
  description:
    "Browse free HTML5 browser games on GameDiscoveries. Filter by category via SEO-friendly /games/[category] URLs.",
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
