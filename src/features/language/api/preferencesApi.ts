import { mapUser } from "@/features/auth/api/authApi";
import type { AuthUser } from "@/features/auth/types/auth.types";
import type { LanguageMode } from "@/i18n/config";
import { apiClient } from "@/lib/api/client";

/** Returns the updated current user. */
export async function updatePreferredLanguage(mode: LanguageMode): Promise<AuthUser> {
  const response = await apiClient.put<unknown>("/api/v1/users/me/preferences", {
    preferredLanguage: mode,
  });
  const user = mapUser(response.data ?? response);
  if (!user) {
    throw new Error("Preferences response was invalid.");
  }
  return user;
}
