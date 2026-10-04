import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Notifications",
  description: "Your GameDiscoveries community notifications.",
  path: "/community/notifications",
  noIndex: true,
});

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
