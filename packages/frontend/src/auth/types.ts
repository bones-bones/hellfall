export interface AuthUser {
  id: string;
  username: string;
  avatar: string | null;
  email: string | null;
  isContributor: boolean;
  isAdmin: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  /** Full URL to start Discord login (redirect). Empty if auth server not configured. */
  loginUrl: string;
  /** Full URL to logout (redirect). Empty if auth server not configured. */
  logoutUrl: string;
  refetch: () => Promise<void>;
}
