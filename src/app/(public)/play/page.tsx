import { MobilePlay } from "@/features/mobile-tabs/components/MobilePlay";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Play",
  description: "Continue your games and jump into quick play picks.",
  path: "/play",
  noIndex: true,
});

export default function PlayRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobilePlay />
    </div>
  );
}
