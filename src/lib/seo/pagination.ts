/** Parses `?page=`; anything that is not a positive integer is page 1. */
export function parsePageParam(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !/^\d+$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

/** Page 1 lives at the bare path so it has a single URL. */
export function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

/** Page numbers to link around the current page, always including the first and last. */
export function pageWindow(current: number, total: number, radius = 2): number[] {
  if (total <= 0) return [];
  const pages = new Set<number>([1, total]);
  for (let page = current - radius; page <= current + radius; page += 1) {
    if (page >= 1 && page <= total) pages.add(page);
  }
  return [...pages].sort((a, b) => a - b);
}
