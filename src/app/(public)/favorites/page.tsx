import { MobileFavorites } from "@/features/mobile-tabs/components/MobileLibrary";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "My Favorites",
  description: "Games you saved on GameDiscoveries.",
  path: "/favorites",
  noIndex: true,
});

export default function FavoritesRoutePage() {
  return (
    <div className="mx-auto max-w-xl">
      <MobileFavorites />
    </div>
  );
}
