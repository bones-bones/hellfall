import { atom } from 'jotai';
import { atomFamily } from 'jotai-family';
import { anyChange, ChangesetDiffRow } from '@hellfall/shared/utils';

export interface ChangesetUser {
  userId: string;
  username: string;
}

export interface PendingChangeset {
  id: string;
  cardId: string;
  status: 'pending';
  createdAt: string | null;
  submittedBy: ChangesetUser;
  changes: anyChange[];
  comment: string | null;
  diff?: ChangesetDiffRow[];
}

export type PendingTagStaging = {
  toAdd: string[];
  toRemove: string[];
};

export type PendingChangesetsState = {
  changesets: PendingChangeset[];
  loading: boolean;
};

export const emptyPendingChangesetsState: PendingChangesetsState = {
  changesets: [],
  loading: false,
};

export const pendingChangesetsAtomFamily = atomFamily(() =>
  atom<PendingChangesetsState>({ changesets: [], loading: true })
);

export const emptyPendingChangesetsAtom = atom(emptyPendingChangesetsState);

export function derivePendingTagStaging(changesets: PendingChangeset[]): PendingTagStaging | null {
  const pending: PendingTagStaging = { toAdd: [], toRemove: [] };
  for (const cs of changesets) {
    for (const change of cs.changes ?? []) {
      if (change.location !== 'tag') continue;
      if (change.change_type === 'add') {
        pending.toAdd.push(change.full_tag);
      } else {
        pending.toRemove.push(change.full_tag);
      }
    }
  }
  return pending.toAdd.length > 0 || pending.toRemove.length > 0 ? pending : null;
}

export async function fetchPendingChangesets(
  baseUrl: string,
  cardId: string
): Promise<PendingChangeset[]> {
  const res = await fetch(
    `${baseUrl}/api/changesets?cardId=${encodeURIComponent(cardId)}&status=pending`,
    { credentials: 'include' }
  );
  if (!res.ok) {
    throw new Error(`${res.status}`);
  }
  const data = (await res.json()) as { changesets?: PendingChangeset[] };
  return data.changesets ?? [];
}
