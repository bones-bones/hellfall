export interface AuthUser {
  id: string;
  username: string;
  avatar: string | null;
  email: string | null;
  isContributor: boolean;
  isAdmin: boolean;
  defaultCludes?: string[];
  defaultSorts?: string[];
  /**
   * @todo This hasn't been implemented yet. Once it is, this will control the card/all prints toggle
   */
  defaultPrints?: boolean;
  /**
   * @todo This hasn't been implemented yet. Once it is, this will control the card format display
   * option (i.e. images/checklist/text/full)
   */
  defaultFormat?: string;
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
