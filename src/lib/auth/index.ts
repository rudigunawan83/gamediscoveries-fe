import { getAuthToken } from "@/lib/auth/token";
import type { AuthUser } from "@/features/auth/types/auth.types";

export type { AuthUser };
export { getAuthToken };

export interface AuthSession {
  userId: string;
  email?: string;
  roles: string[];
}

export function toAuthSession(user: AuthUser | null): AuthSession | null {
  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    roles: user.roles ?? [],
  };
}
