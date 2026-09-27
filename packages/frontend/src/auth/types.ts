import { displayType, uniqueType } from '@hellfall/shared/filters';

export interface AuthUser {
  id: string;
  username: string;
  avatar: string | null;
  email: string | null;
  isContributor: boolean;
  isAdmin: boolean;
  /** Publish Firestore → site catalog cache (admin or catalog-sync role). */
  canSyncCatalog?: boolean;
  /** Accept/reject pending changesets (admin or catalog-sync role). */
  canApproveChangesets?: boolean;
  defaultCludes?: string[];
  defaultSorts?: string[];
  defaultUnique?: uniqueType;
  defaultDisplay?: displayType;
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
