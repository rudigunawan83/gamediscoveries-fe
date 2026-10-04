import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Challenges",
  description:
    "Join time-bounded GameDiscoveries community challenges and track your progress.",
  path: "/community/challenges",
});

export default function ChallengesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
