import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth';
import { getAuthApiUrl } from '../auth/getAuthApiUrl';
import { ChangesetCard } from './ChangesetCard';
import { ErrorText } from './ErrorText';
import { Changeset, isChangesetStatus, isStatusFilter, StatusFilter } from '@hellfall/shared/utils';
import { useParams } from 'react-router-dom';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import { createStenciledButton, createStyledButton, createStyledDiv } from '../styling';
import { Heading } from '@workday/canvas-kit-react';

export function ReviewPage() {
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
  }, [baseUrl, filter, canViewChangesets]);

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
      {!loading && !error && changesets.length === 0 && <p>No changesets found.</p>}
      {changesets.map(cs => (
        <ChangesetCard
          key={cs.id}
          cs={cs}
          isAdmin={user.isAdmin || cs.submittedBy.userId == user.id}
          onAction={handleAction}
        />
      ))}
    </PageContainer>
  );
}

const pageContainerStyles = createStyles({
  maxWidth: 900,
  margin: '0 auto',
  padding: '20px 16px',
});
const PageContainer = createStyledDiv(pageContainerStyles);

const headerRowStyles = createStyles({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 12,
  marginBottom: 8,
});
const HeaderRow = createStyledDiv(headerRowStyles);

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
const SyncButton = createStyledButton(syncButtonStyles);

const syncMessageStyles = createStyles({
  marginBottom: 12,
  fontSize: 14,
  color: '#155724',
});
const SyncMessage = createStyledDiv(syncMessageStyles);

const filterRowStyles = createStyles({
  display: 'flex',
  gap: 4,
  marginBottom: 16,
});
const FilterRow = createStyledDiv(filterRowStyles);

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
const FilterButton = createStenciledButton<FilterButtonProps>(filterButtonStencil);
