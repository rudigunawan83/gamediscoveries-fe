export function formatPlayCount(count?: number): string {
  if (count === undefined) {
    return "—";
  }

  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }

  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }

  return String(count);
}

export function formatRating(rating?: number): string {
  if (rating === undefined) {
    return "N/A";
  }

  return rating.toFixed(1);
}
