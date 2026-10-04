import type { ReactNode } from "react";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "SEO Admin",
  path: "/admin/seo",
  noIndex: true,
});

export default function AdminSeoLayout({ children }: { children: ReactNode }) {
  return children;
}
