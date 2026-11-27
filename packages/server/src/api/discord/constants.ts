export const DATABASE_CONTRIBUTOR = '917512171896832110';

/** Discord role allowed to publish Firestore → catalog cache/GCS and approve changesets. */
export const CATALOG_SYNC_ROLE = '1216943367926055012';

/** Discord role allowed to submit rulings-only card changesets. */
export const JUDGE_ROLE = '1249771148674203728';

export function hasChangesetApproverRole(
  roles: string[],
  adminRoleId: string,
  catalogSyncRoleId: string = CATALOG_SYNC_ROLE
): boolean {
  return (Boolean(adminRoleId) && roles.includes(adminRoleId)) || roles.includes(catalogSyncRoleId);
}
