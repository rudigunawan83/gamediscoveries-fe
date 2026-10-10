import { AppDownloadView } from "@/features/app-download/components/AppDownloadView";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Download the Android App",
  description:
    "Download the official GameDiscoveries app for Android. Play free games, earn XP and keep your streak on your phone.",
  path: "/download",
});

export default function DownloadPage() {
  return <AppDownloadView />;
}
