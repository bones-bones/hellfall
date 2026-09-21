export const DATABASE_CONTRIBUTOR = '917512171896832110';

/** Discord role allowed to publish Firestore → catalog cache/GCS and approve changesets. */
export const CATALOG_SYNC_ROLE = '1216943367926055012';

export function hasChangesetApproverRole(
  roles: string[],
  adminRoleId: string,
  catalogSyncRoleId: string = CATALOG_SYNC_ROLE
): boolean {
  return (Boolean(adminRoleId) && roles.includes(adminRoleId)) || roles.includes(catalogSyncRoleId);
}
