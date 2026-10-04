import { PlaceholderPage } from "@/components/common/PlaceholderPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "My Games",
  path: "/my-games",
  noIndex: true,
});

export default function MyGamesPage() {
  return (
    <PlaceholderPage
      title="My Games"
      description="Your personal game library will live here in a later phase. Authentication routing is active."
    />
  );
}
