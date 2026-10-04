/**
 * Authentication foundation placeholder.
 * JWT/OAuth/OIDC session helpers will be added in a later phase.
 */
export interface AuthSession {
  userId: string;
  email?: string;
  roles: string[];
}

export function getAuthToken(): string | null {
  return null;
}
