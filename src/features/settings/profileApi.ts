import { mapUser } from "@/features/auth/api/authApi";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { apiClient } from "@/lib/api/client";

/** Returns the updated current user. */
export async function updateProfile(input: {
  displayName: string;
  username: string;
}): Promise<AuthUser> {
  const response = await apiClient.put<unknown>("/api/v1/users/me/profile", {
    displayName: input.displayName.trim(),
    username: input.username.trim().toLowerCase(),
  });
  const user = mapUser(response.data ?? response);
  if (!user) {
    throw new Error("Profile response was invalid.");
  }
  return user;
}
