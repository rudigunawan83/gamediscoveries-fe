import { createMetadata } from "@/lib/seo/metadata";

export function generateMetadata() {
  return createMetadata({
    title: "Admin Community",
    description: "Community moderation tools.",
    path: "/admin/community",
    noIndex: true,
  });
}

/** Admin is excluded from i18n and stays in English. */
export default function AdminCommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div lang="en" className="contents">
      {children}
    </div>
  );
}
