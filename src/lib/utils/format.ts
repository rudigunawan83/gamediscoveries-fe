export function formatRating(rating?: number): string {
  if (rating === undefined) {
    return "N/A";
  }

  return rating.toFixed(1);
}
