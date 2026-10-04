import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Achievements",
  description:
    "Unlock GameDiscoveries achievements by playing, reviewing, and joining the community.",
  path: "/community/achievements",
});

export default function AchievementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
