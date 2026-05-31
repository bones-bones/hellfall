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
  marginTop: 6,
  marginBottom: 4,
});

const ToggleRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  cursor: 'pointer',
  userSelect: 'none',
});

const Badge = styled('span')({
  fontSize: 12,
  fontWeight: 600,
});

const ToggleText = styled('span')({
  fontSize: 12,
  color: '#555',
});

const ChangesetBlock = styled('div')({
  marginTop: 6,
  padding: '6px 8px',
  border: '1px solid #ccc',
});

const CsMeta = styled('div')({
  fontSize: 12,
  color: '#666',
});

const CsComment = styled('div')({
  fontSize: 12,
  fontStyle: 'italic',
  color: '#555',
  marginTop: 2,
});

const FieldDiff = styled('div')({
  marginTop: 4,
});

const FieldName = styled('div')({
  fontSize: 11,
  fontWeight: 600,
  color: '#888',
});

const DiffRow = styled('div')({
  display: 'flex',
  gap: 6,
  alignItems: 'flex-start',
  fontSize: 13,
  fontFamily: 'monospace',
  lineHeight: 1.4,
});

const Before = styled('span')({
  color: '#900',
  textDecoration: 'line-through',
  wordBreak: 'break-word',
  maxWidth: '40%',
});

const After = styled('span')({
  color: '#060',
  wordBreak: 'break-word',
  maxWidth: '40%',
});

const Arrow = styled('span')({
  color: '#999',
  flexShrink: 0,
});

const ReviewLink = styled(Link)({
  display: 'inline-block',
  marginTop: 4,
  fontSize: 12,
  color: 'inherit',
  '&:hover': { textDecoration: 'underline' },
});
