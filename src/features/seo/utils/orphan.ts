import type { OrphanPageReport } from "@/features/seo/types";

/** Known high-value internal entry points that should link outward. */
const CORE_HUBS = [
  "/",
  "/games",
  "/trending",
  "/new",
  "/mobile",
  "/multiplayer",
  "/community",
  "/collections",
] as const;

/**
 * Lightweight orphan heuristic for admin diagnostics.
 * incomingLinks is estimated from hub membership + explicit backlinks list.
 */
export function detectOrphanPages(
  pages: Array<{
    path: string;
    indexable: boolean;
    linkedFrom: string[];
  }>,
): OrphanPageReport[] {
  return pages.map((page) => {
    const incoming = new Set(page.linkedFrom);
    for (const hub of CORE_HUBS) {
      if (page.linkedFrom.includes(hub)) incoming.add(hub);
    }
    const incomingLinks = incoming.size;
    let status: OrphanPageReport["status"] = "ok";
    if (!page.indexable) status = "private";
    else if (incomingLinks === 0) status = "orphan";

    return {
      page: page.path,
      incomingLinks,
      indexable: page.indexable,
      status,
    };
  });
}
