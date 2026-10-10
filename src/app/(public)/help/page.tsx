import { MobileHelp } from "@/features/mobile-tabs/components/MobileAccount";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Help & Support",
  description: "Answers to common GameDiscoveries questions.",
  path: "/help",
  noIndex: true,
});

export default function HelpRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileHelp />
    </div>
  );
}
