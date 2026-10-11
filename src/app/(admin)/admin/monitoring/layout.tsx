import type { ReactNode } from "react";
import { createMetadata } from "@/lib/seo/metadata";
import { MonitoringShell } from "@/features/admin-monitoring/components/MonitoringShell";

export function generateMetadata() {
  return createMetadata({
    title: "Monitoring",
    path: "/admin/monitoring",
    noIndex: true,
  });
}

export default function MonitoringLayout({ children }: { children: ReactNode }) {
  return <MonitoringShell>{children}</MonitoringShell>;
}
