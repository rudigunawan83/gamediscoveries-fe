import { MobileHistory } from "@/features/mobile-tabs/components/MobileLibrary";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Play History",
  description: "Games you played recently on GameDiscoveries.",
  path: "/history",
  noIndex: true,
});

export default function HistoryRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileHistory />
    </div>
  );
}
