import { MobileProgress } from "@/features/mobile-tabs/components/MobileGamification";
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
    <>
      <div className="mx-auto max-w-xl lg:hidden">
        <MobileProgress />
      </div>
      <main className="container mx-auto hidden px-4 py-8 md:py-12 lg:block">
        <ProgressPageView />
      </main>
    </>
  );
}
