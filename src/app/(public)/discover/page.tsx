import { PlaceholderPage } from "@/components/common/PlaceholderPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Discover",
  path: "/discover",
});

export default function DiscoverPage() {
  return (
    <PlaceholderPage
      title="Discover"
      description="Personalized discovery feeds will live here in a later phase."
    />
  );
}
