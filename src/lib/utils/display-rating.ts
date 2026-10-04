/** Stable visual rating for catalog rows that don't yet carry analytics scores. */
export function displayRating(id: string, rating?: number): number {
  if (typeof rating === "number" && Number.isFinite(rating)) {
    return Math.min(5, Math.max(0, rating));
  }

  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }

  return Math.round((4.3 + (hash % 70) / 100) * 10) / 10;
}
