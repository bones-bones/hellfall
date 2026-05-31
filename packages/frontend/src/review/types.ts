
export interface ChangesetUser {
    userId: string;
    username: string;
}

export interface FieldChange {
    before: unknown;
    after: unknown;
}

export interface Changeset {
    id: string;
    cardId: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string | null;
    resolvedAt: string | null;
    submittedBy: ChangesetUser;
    resolvedBy: ChangesetUser | null;
    changes: Record<string, FieldChange>;
    comment: string | null;
}

export type StatusFilter = 'pending' | 'accepted' | 'rejected' | 'all';
