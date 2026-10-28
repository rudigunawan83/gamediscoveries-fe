import type { ReactNode } from "react";
import { createMetadata } from "@/lib/seo/metadata";
import { AdminShell } from "@/features/admin-monitoring/components/MonitoringShell";

export function generateMetadata() {
  return createMetadata({
    title: "SEO Admin",
    path: "/admin/seo",
    noIndex: true,
  });
}

export default function AdminSeoLayout({ children }: { children: ReactNode }) {
  return <AdminShell section="portal">{children}</AdminShell>;
}
