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

/** Mirrors the backend `Avatar:MaxUploadBytes` default. */
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

/** Uploads a new avatar and returns the updated current user. */
export async function uploadAvatar(file: File): Promise<AuthUser> {
  const body = new FormData();
  body.append("file", file);
  const response = await apiClient.post<unknown>("/api/v1/users/me/avatar", body, {
    timeoutMs: 60_000,
  });
  const user = mapUser(response.data ?? response);
  if (!user) {
    throw new Error("Avatar response was invalid.");
  }
  return user;
}

/** Removes the avatar and returns the updated current user. */
export async function removeAvatar(): Promise<AuthUser> {
  const response = await apiClient.delete<unknown>("/api/v1/users/me/avatar");
  const user = mapUser(response.data ?? response);
  if (!user) {
    throw new Error("Avatar response was invalid.");
  }
  return user;
}
