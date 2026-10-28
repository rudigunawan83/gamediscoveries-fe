import type { ReactNode } from "react";
import { createMetadata } from "@/lib/seo/metadata";
import { AdminShell } from "@/features/admin-monitoring/components/MonitoringShell";

export function generateMetadata() {
  return createMetadata({
    title: "Users",
    path: "/admin/users",
    noIndex: true,
  });
}

export default function AdminUsersLayout({ children }: { children: ReactNode }) {
  return <AdminShell section="portal">{children}</AdminShell>;
}
