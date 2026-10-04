import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Admin Community",
  description: "Community moderation tools.",
  path: "/admin/community",
  noIndex: true,
});

export default function AdminCommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
