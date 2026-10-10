import { MobileAchievements } from "@/features/mobile-tabs/components/MobileGamification";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Achievements",
  description: "Badges you unlocked on GameDiscoveries.",
  path: "/achievements",
  noIndex: true,
});

export default function AchievementsRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileAchievements />
    </div>
  );
}
