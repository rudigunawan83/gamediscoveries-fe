import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  AuthUser,
  LoginCredentials,
  LoginResult,
  RegisterCredentials,
} from "@/features/auth/types/auth.types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function mapUser(value: unknown): AuthUser | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const id = record.id ?? record.userId;
  const email = record.email;
  if (typeof id !== "string" || typeof email !== "string") {
    return null;
  }

  return {
    id,
    email,
    displayName:
      typeof record.displayName === "string"
        ? record.displayName
        : typeof record.name === "string"
          ? record.name
          : null,
    avatarUrl:
      typeof record.avatarUrl === "string"
        ? record.avatarUrl
        : typeof record.imageUrl === "string"
          ? record.imageUrl
          : null,
    roles: Array.isArray(record.roles)
      ? record.roles.filter((role): role is string => typeof role === "string")
      : [],
  };
}

function mapLoginResult(payload: unknown): LoginResult {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  if (!data) {
    throw new Error("Login response was empty.");
  }

  const accessToken =
    (typeof data.accessToken === "string" && data.accessToken) ||
    (typeof data.token === "string" && data.token) ||
    (typeof data.access_token === "string" && data.access_token) ||
    null;

  if (!accessToken) {
    throw new Error("Login response did not include an access token.");
  }

  return {
    accessToken,
    refreshToken:
      typeof data.refreshToken === "string"
        ? data.refreshToken
        : typeof data.refresh_token === "string"
          ? data.refresh_token
          : null,
    expiresIn:
      typeof data.expiresIn === "number"
        ? data.expiresIn
        : typeof data.expires_in === "number"
          ? data.expires_in
          : null,
    user: mapUser(data.user),
  };
}

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  const response = await apiClient.post<unknown>("/api/v1/auth/login", {
    email: credentials.email,
    password: credentials.password,
  });

  return mapLoginResult(response.data ?? response);
}

export async function registerRequest(
  credentials: RegisterCredentials,
): Promise<LoginResult> {
  const response = await apiClient.post<unknown>("/api/v1/auth/register", {
    email: credentials.email,
    password: credentials.password,
    displayName: credentials.displayName,
  });

  return mapLoginResult(response.data ?? response);
}

export async function logoutRequest(): Promise<void> {
  try {
    await apiClient.post<unknown>("/api/v1/auth/logout", {});
  } catch (error) {
    // Expired/missing sessions should still clear local auth state.
    const status =
      error && typeof error === "object" && "status" in error
        ? Number((error as { status?: number }).status)
        : 0;
    if (status === 401 || status === 404) {
      return;
    }
    throw error;
  }
}

export async function getCurrentUserRequest(): Promise<AuthUser> {
  const response = await apiClient.get<unknown>("/api/v1/users/me");
  const user = mapUser(response.data ?? response);
  if (!user) {
    throw new Error("Current user response was invalid.");
  }
  return user;
}

export type { ApiResponse };
