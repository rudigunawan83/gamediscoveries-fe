import type { LibraryTranslator } from "@/features/my-games/utils/formatPlayedAt";
import { ApiClientError } from "@/lib/api/types";

export function mapLibraryError(
  error: unknown,
  t: LibraryTranslator,
  fallback: string,
  generic: string,
): string {
  if (!(error instanceof ApiClientError)) {
    return fallback;
  }

  switch (error.status) {
    case 401:
      return t("errorSignIn");
    case 403:
      return t("errorForbidden");
    case 404:
      return t("errorNotFound");
    case 409:
      return t("errorAlreadyFavorite");
    case 429:
      return t("errorRateLimited");
    default:
      if (error.status >= 500) {
        return generic;
      }
      return error.message || fallback;
  }
}
