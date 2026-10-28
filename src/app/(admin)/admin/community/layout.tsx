import type { ReactNode } from "react";
import { createMetadata } from "@/lib/seo/metadata";
import { AdminShell } from "@/features/admin-monitoring/components/MonitoringShell";

export function generateMetadata() {
  return createMetadata({
    title: "Content Moderation",
    description: "Community moderation tools.",
    path: "/admin/community",
    noIndex: true,
  });
}

export default function AdminCommunityLayout({ children }: { children: ReactNode }) {
  return <AdminShell section="portal">{children}</AdminShell>;
}
