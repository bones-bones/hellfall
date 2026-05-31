import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { getAuthApiUrl } from '../../auth/getAuthApiUrl';

interface ChangesetUser {
  userId: string;
  username: string;
}

interface FieldChange {
  before: unknown;
  after: unknown;
}

interface PendingChangeset {
  id: string;
  cardId: string;
  status: 'pending';
  createdAt: string | null;
  submittedBy: ChangesetUser;
  changes: Record<string, FieldChange>;
  comment: string | null;
}

export function PendingChanges({ cardId }: { cardId: string }) {
  const baseUrl = getAuthApiUrl();
  const [changesets, setChangesets] = useState<PendingChangeset[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!baseUrl || !cardId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${baseUrl}/api/changesets?cardId=${encodeURIComponent(cardId)}&status=pending`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data: { changesets: PendingChangeset[] }) => {
        setChangesets(data.changesets ?? []);
      })
      .catch(() => setChangesets([]))
      .finally(() => setLoading(false));
  }, [baseUrl, cardId]);

  if (loading || changesets.length === 0) return null;

  return (
    <Container>
      <ToggleRow onClick={() => setExpanded(prev => !prev)}>
        <Badge>{changesets.length}</Badge>
        <ToggleText>
          Pending change{changesets.length !== 1 ? 's' : ''}
          {expanded ? ' ▾' : ' ▸'}
        </ToggleText>
      </ToggleRow>
      {expanded &&
        changesets.map(cs => (
          <ChangesetBlock key={cs.id}>
            <CsMeta>
              by {cs.submittedBy.username}
              {cs.createdAt && <> &middot; {new Date(cs.createdAt).toLocaleDateString()}</>}
            </CsMeta>
            {cs.comment && <CsComment>{cs.comment}</CsComment>}
            {Object.entries(cs.changes).map(([field, change]) => (
              <FieldDiff key={field}>
                <FieldName>{field}</FieldName>
                <DiffRow>
                  <Before>{formatVal(change.before)}</Before>
                  <Arrow>&rarr;</Arrow>
                  <After>{formatVal(change.after)}</After>
                </DiffRow>
              </FieldDiff>
            ))}
            <ReviewLink to="/review">View in Review</ReviewLink>
          </ChangesetBlock>
        ))}
    </Container>
  );
}

function formatVal(val: unknown): string {
  if (val == null) return '(empty)';
  if (Array.isArray(val)) return val.join(', ') || '(empty)';
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  return String(val);
}

const Container = styled('div')({
  marginTop: 8,
  marginBottom: 4,
});

const ToggleRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  cursor: 'pointer',
  userSelect: 'none',
  '&:hover': { opacity: 0.8 },
});

const Badge = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#fff3cd',
  color: '#856404',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 11,
  minWidth: 20,
  height: 20,
  padding: '0 6px',
});

const ToggleText = styled('span')({
  fontSize: 13,
  fontWeight: 600,
  color: '#856404',
});

const ChangesetBlock = styled('div')({
  marginTop: 8,
  padding: '8px 10px',
  background: '#fffcf0',
  border: '1px solid #f0e5b0',
  borderRadius: 6,
});

const CsMeta = styled('div')({
  fontSize: 12,
  color: '#666',
});

const CsComment = styled('div')({
  fontSize: 13,
  fontStyle: 'italic',
  color: '#555',
  marginTop: 2,
});

const FieldDiff = styled('div')({
  marginTop: 6,
});

const FieldName = styled('div')({
  fontSize: 11,
  fontWeight: 700,
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const DiffRow = styled('div')({
  display: 'flex',
  gap: 8,
  alignItems: 'flex-start',
  fontSize: 13,
  fontFamily: 'monospace',
  lineHeight: 1.4,
});

const Before = styled('span')({
  color: '#c00',
  textDecoration: 'line-through',
  wordBreak: 'break-word',
  maxWidth: '40%',
});

const After = styled('span')({
  color: '#155724',
  fontWeight: 600,
  wordBreak: 'break-word',
  maxWidth: '40%',
});

const Arrow = styled('span')({
  color: '#999',
  flexShrink: 0,
});

const ReviewLink = styled(Link)({
  display: 'inline-block',
  marginTop: 6,
  fontSize: 12,
  color: '#C690FF',
  textDecoration: 'none',
  '&:hover': { textDecoration: 'underline' },
});
