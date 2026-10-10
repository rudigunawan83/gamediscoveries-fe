import type { LanguageMode } from "@/i18n/config";

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string | null;
  /** Public @handle; older sessions omit it until the next refresh. */
  username?: string | null;
  avatarUrl?: string | null;
  roles?: string[];
  /** Language saved on the account; older API builds omit it. */
  preferredLanguage?: LanguageMode | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number | null;
  user?: AuthUser | null;
}

export interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
}
