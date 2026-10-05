import { ProgressPageView } from "@/features/progress/components/ProgressPageView";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Progress",
  description: "Your GameDiscoveries level, XP, and play progress.",
  path: "/progress",
  noIndex: true,
});

export default function ProgressRoutePage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <ProgressPageView />
    </main>
  );
}
