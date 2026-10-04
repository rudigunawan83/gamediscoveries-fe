import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Leaderboards",
  description:
    "See top players, explorers, reviewers, and community contributors on GameDiscoveries.",
  path: "/community/leaderboards",
});

export default function LeaderboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
