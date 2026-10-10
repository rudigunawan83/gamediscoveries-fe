import { MobileAccountSettings } from "@/features/mobile-tabs/components/MobileAccount";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Account Settings",
  description: "Manage your GameDiscoveries account and privacy.",
  path: "/settings",
  noIndex: true,
});

export default function SettingsRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileAccountSettings />
    </div>
  );
}
