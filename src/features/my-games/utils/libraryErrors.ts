import { ApiClientError } from "@/lib/api/types";

export function mapLibraryError(error: unknown, fallback: string): string {
  if (!(error instanceof ApiClientError)) {
    return fallback;
  }

  switch (error.status) {
    case 401:
      return "Please sign in to access your games.";
    case 403:
      return "You don't have permission to access this resource.";
    case 404:
      return "Game or library item not found.";
    case 409:
      return "This game is already in your favorites.";
    case 429:
      return "Too many requests. Please try again shortly.";
    default:
      if (error.status >= 500) {
        return "Something went wrong. Please try again.";
      }
      return error.message || fallback;
  }
}
