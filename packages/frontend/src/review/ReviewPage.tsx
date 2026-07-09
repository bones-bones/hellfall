import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth';
import { getAuthApiUrl } from '../auth/getAuthApiUrl';
import { ChangesetCard } from './ChangesetCard';
import { ErrorText } from './ErrorText';
import { Changeset, isChangesetStatus, isStatusFilter, StatusFilter } from '@hellfall/shared/utils';
import { useParams } from 'react-router-dom';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import {
  createStenciledButton,
  createStyledButton,
  createStyledDiv,
  createStyledInput,
  createStyledSpan,
} from '../styling';
import { Heading } from '@workday/canvas-kit-react';

export const ReviewPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { '*': cardId } = useParams();

  const baseUrl = getAuthApiUrl();
  const [changesets, setChangesets] = useState<Changeset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const canViewChangesets = Boolean(user?.isAdmin || user?.isContributor);

  const fetchChangesets = useCallback(async () => {
    if (!baseUrl || !canViewChangesets) return;
    setLoading(true);
    setError(null);
    try {
      // filter !== 'all' ? `?status=${filter}` : ''

      const params = new URLSearchParams();
      if (isChangesetStatus(filter)) {
        params.append('status', filter);
      }
      if (cardId) {
        params.append('cardId', cardId);
      }
      const res = await fetch(
        `${baseUrl}/api/changesets${params.size ? `?${params.toString()}` : ''}`,
        {
          credentials: 'include',
        }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const data = (await res.json()) as { changesets: Changeset[] };
      setChangesets(data.changesets);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [baseUrl, filter, cardId, canViewChangesets]);

  useEffect(() => {
    if (!user && !authLoading) {
      setLoading(false);
      setChangesets([]);
      return;
    }
    if (!canViewChangesets) {
      setLoading(false);
      setChangesets([]);
      setError(null);
      return;
    }
    fetchChangesets();
  }, [user, canViewChangesets, fetchChangesets]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [filter, cardId]);

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    if (!baseUrl) return;
    const res = await fetch(`${baseUrl}/api/changesets/${id}/${action}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    // TODO: make users able to reject their own requests
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.reason || `${res.status}`);
    }
    await fetchChangesets();
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const pendingChangesets = changesets.filter(cs => cs.status === 'pending' && cs.id);
  const canBulkApprove = user?.isAdmin && filter === 'pending' && pendingChangesets.length > 0;
  const allPendingSelected =
    canBulkApprove && pendingChangesets.every(cs => selectedIds.has(cs.id!));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allPendingSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingChangesets.map(cs => cs.id!)));
    }
  };

  const handleBulkAccept = async () => {
    if (!baseUrl || selectedIds.size === 0) return;
    setBulkBusy(true);
    setBulkError(null);
    const ids = Array.from(selectedIds);
    const results = await Promise.allSettled(
      ids.map(id =>
        fetch(`${baseUrl}/api/changesets/${id}/accept`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        })
      )
    );
    const failed = results.filter(
      r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok)
    );
    if (failed.length > 0) {
      setBulkError(`${failed.length} of ${ids.length} failed to accept`);
    } else {
      setSelectedIds(new Set());
    }
    setBulkBusy(false);
    await fetchChangesets();
  };

  const handleCatalogSync = async () => {
    if (!baseUrl || !user?.isAdmin) return;
    setSyncBusy(true);
    setSyncMessage(null);
    setSyncError(null);
    try {
      const res = await fetch(`${baseUrl}/api/admin/catalog/sync`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.reason || `${res.status}`);
      const gcsNote = data.gcs ? ` (GCS v${data.version})` : '';
      setSyncMessage(`Synced ${data.cardCount?.toLocaleString() ?? '?'} cards${gcsNote}`);
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncBusy(false);
    }
  };

  if (authLoading) {
    return (
      <PageContainer>
        <Heading size="medium">Review Changesets</Heading>
        <p>Loading...</p>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <Heading size="medium">Review Changesets</Heading>
        <p> log in to view changesets.</p>
      </PageContainer>
    );
  }

  if (!canViewChangesets) {
    return (
      <PageContainer>
        <Heading size="medium">Review Changesets</Heading>
        <p>You need admin or database contributor access to view changesets.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderRow>
        <Heading size="medium">Review Changesets</Heading>
        {user.isAdmin && (
          <SyncButton disabled={syncBusy} onClick={handleCatalogSync}>
            {syncBusy ? 'Syncing catalog…' : 'Sync catalog to site'}
          </SyncButton>
        )}
      </HeaderRow>
      {syncMessage && <SyncMessage>{syncMessage}</SyncMessage>}
      {syncError && <ErrorText size="large">{syncError}</ErrorText>}
      <FilterRow>
        {(['pending', 'accepted', 'rejected', 'all'] as StatusFilter[]).map(s => (
          <FilterButton key={s} data_active={filter === s} onClick={() => setFilter(s)}>
            {s}
          </FilterButton>
        ))}
      </FilterRow>
      {loading && <p>Loading...</p>}
      {error && <ErrorText size="large">{error}</ErrorText>}
      {canBulkApprove && (
        <BulkBar>
          <BulkCheckbox
            type="checkbox"
            checked={allPendingSelected}
            onChange={toggleSelectAll}
            aria-label="Select all pending changesets"
          />
          <BulkLabel>
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
          </BulkLabel>
          {selectedIds.size > 0 && (
            <BulkAcceptButton disabled={bulkBusy} onClick={handleBulkAccept}>
              {bulkBusy ? 'Accepting…' : `Accept ${selectedIds.size}`}
            </BulkAcceptButton>
          )}
          {bulkError && <ErrorText size="medium">{bulkError}</ErrorText>}
        </BulkBar>
      )}
      {!loading && !error && changesets.length === 0 && <p>No changesets found.</p>}
      {changesets.map(cs => (
        <ChangesetCard
          key={cs.id}
          cs={cs}
          isAdmin={user.isAdmin || cs.submittedBy.userId == user.id}
          onAction={handleAction}
          selectable={user.isAdmin && cs.status === 'pending'}
          selected={cs.id ? selectedIds.has(cs.id) : false}
          onToggleSelect={cs.id ? () => toggleSelect(cs.id!) : undefined}
        />
      ))}
    </PageContainer>
  );
};

const pageContainerStyles = createStyles({
  maxWidth: 900,
  margin: '0 auto',
  padding: '20px 16px',
});
const PageContainer = createStyledDiv(pageContainerStyles, 'PageContainer');

const headerRowStyles = createStyles({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 12,
  marginBottom: 8,
});
const HeaderRow = createStyledDiv(headerRowStyles, 'HeaderRow');

const syncButtonStyles = createStyles({
  padding: '6px 14px',
  border: '1px solid #C690FF',
  borderRadius: 4,
  background: '#C690FF',
  color: '#fff',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  '&:disabled': { opacity: 0.6, cursor: 'default' },
});
const SyncButton = createStyledButton(syncButtonStyles, 'SyncButton');

const syncMessageStyles = createStyles({
  marginBottom: 12,
  fontSize: 14,
  color: '#155724',
});
const SyncMessage = createStyledDiv(syncMessageStyles, 'SyncMessage');

const filterRowStyles = createStyles({
  display: 'flex',
  gap: 4,
  marginBottom: 16,
});
const FilterRow = createStyledDiv(filterRowStyles, 'FilterRow');

const filterButtonStencil = createStencil({
  vars: {},
  base: {
    padding: '4px 12px',
    border: '1px solid #ccc',
    borderRadius: 4,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
  },
  modifiers: {
    data_active: {
      true: {
        background: '#C690FF',
        color: '#fff',
        borderColor: '#C690FF',
      },
    },
  },
});
interface FilterButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  data_active?: boolean;
}
const FilterButton = createStenciledButton<FilterButtonProps>(filterButtonStencil, 'FilterButton');

const bulkBarStyles = createStyles({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 12,
  padding: '8px 12px',
  background: '#f8f8f8',
  borderRadius: 4,
  border: '1px solid #ddd',
});
const BulkBar = createStyledDiv(bulkBarStyles);

const bulkCheckboxStyles = createStyles({
  width: 18,
  height: 18,
  cursor: 'pointer',
});
const BulkCheckbox = createStyledInput(bulkCheckboxStyles);

const bulkLabelStyles = createStyles({
  fontSize: 14,
  color: '#333',
});
const BulkLabel = createStyledSpan(bulkLabelStyles);

const bulkAcceptButtonStyles = createStyles({
  padding: '6px 16px',
  border: 'none',
  borderRadius: 4,
  background: '#28a745',
  color: '#fff',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  '&:disabled': { opacity: 0.5, cursor: 'default' },
  '&:hover:not(:disabled)': { background: '#218838' },
});
const BulkAcceptButton = createStyledButton(bulkAcceptButtonStyles);
