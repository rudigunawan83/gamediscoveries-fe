import type { ReactNode } from "react";
import { createMetadata } from "@/lib/seo/metadata";

export function generateMetadata() {
  return createMetadata({
    title: "SEO Admin",
    path: "/admin/seo",
    noIndex: true,
  });
}

/** Admin is excluded from i18n and stays in English. */
export default function AdminSeoLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="en" className="contents">
      {children}
    </div>
  );
}
