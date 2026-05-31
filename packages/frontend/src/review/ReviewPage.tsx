import { useEffect, useState, useCallback } from 'react';
import { Heading } from '@workday/canvas-kit-react';
import styled from '@emotion/styled';
import { useAuth } from '../auth';
import { getAuthApiUrl } from '../auth/getAuthApiUrl';
import { Changeset, StatusFilter } from './types';
import { ChangesetCard } from './ChangesetCard';
import { ErrorText } from './ErrorText';

export function ReviewPage() {
  const { user, loading: authLoading } = useAuth();
  const baseUrl = getAuthApiUrl();
  const [changesets, setChangesets] = useState<Changeset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('pending');

  const canViewChangesets = Boolean(user?.isAdmin || user?.isContributor);

  const fetchChangesets = useCallback(async () => {
    if (!baseUrl || !canViewChangesets) return;
    setLoading(true);
    setError(null);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await fetch(`${baseUrl}/api/changesets${params}`, {
        credentials: 'include',
      });
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
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.reason || `${res.status}`);
    }
    await fetchChangesets();
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
      <Heading size="medium">Review Changesets</Heading>
      <FilterRow>
        {(['pending', 'accepted', 'rejected', 'all'] as StatusFilter[]).map(s => (
          <FilterButton key={s} data-active={filter === s} onClick={() => setFilter(s)}>
            {s}
          </FilterButton>
        ))}
      </FilterRow>
      {loading && <p>Loading...</p>}
      {error && <ErrorText>{error}</ErrorText>}
      {!loading && !error && changesets.length === 0 && <p>No changesets found.</p>}
      {changesets.map(cs => (
        <ChangesetCard key={cs.id} cs={cs} isAdmin={user.isAdmin} onAction={handleAction} />
      ))}
    </PageContainer>
  );
}

const PageContainer = styled('div')({
  maxWidth: 900,
  margin: '0 auto',
  padding: '20px 16px',
});

const FilterRow = styled('div')({
  display: 'flex',
  gap: 4,
  marginBottom: 16,
});

const FilterButton = styled('button')({
  padding: '4px 12px',
  border: '1px solid #ccc',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer',
  fontSize: 13,
  '&[data-active="true"]': {
    background: '#C690FF',
    color: '#fff',
    borderColor: '#C690FF',
  },
});
