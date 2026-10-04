export interface AuthUser {
  id: string;
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  roles?: string[];
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
