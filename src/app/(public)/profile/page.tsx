import { MobileProfile } from "@/features/mobile-tabs/components/MobileProfile";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Profile",
  description: "Your GameDiscoveries profile, level and stats.",
  path: "/profile",
  noIndex: true,
});

export default function ProfileRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileProfile />
    </div>
  );
}
