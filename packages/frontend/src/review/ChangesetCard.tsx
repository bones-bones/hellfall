import { Card } from '@workday/canvas-kit-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
// import { Changeset } from './types';
import styled from '@emotion/styled';
import { ErrorText } from './ErrorText';
import { Changeset } from '@hellfall/shared/utils';

export function ChangesetCard({
  cs,
  isAdmin,
  onAction,
}: {
  cs: Changeset;
  isAdmin: boolean;
  onAction: (id: string, action: 'accept' | 'reject') => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async (action: 'accept' | 'reject') => {
    setBusy(true);
    setError(null);
    try {
      await onAction(cs.id, action);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <StyledCard>
      <Card.Body>
        <HeaderRow>
          <div>
            <strong>
              <Link to={`/card/${encodeURIComponent(cs.cardId)}`}>{cs.cardId}</Link>
            </strong>
            <StatusBadge data-status={cs.status}>{cs.status}</StatusBadge>
          </div>
          <Meta>
            by {cs.submittedBy.username} &middot; {formatTime(cs.createdAt as string)}
          </Meta>
        </HeaderRow>
        {cs.comment && <Comment>{cs.comment}</Comment>}
        <ChangesTable>
          <thead>
            <tr>
              <th>Field</th>
              <th>Before</th>
              <th>After</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(cs.changes).map(([field, change]) => (
              <tr key={field}>
                <td>
                  <code>{field}</code>
                </td>
                {/* <td>
                  <DiffValue>{formatValue(change.before)}</DiffValue>
                </td> */}
                <td>
                  <DiffValue>{formatValue(change)}</DiffValue>
                </td>
              </tr>
            ))}
          </tbody>
        </ChangesTable>
        {cs.status === 'pending' && isAdmin && (
          <ActionRow>
            <AcceptButton disabled={busy} onClick={() => handle('accept')}>
              Accept
            </AcceptButton>
            <RejectButton disabled={busy} onClick={() => handle('reject')}>
              Reject
            </RejectButton>
          </ActionRow>
        )}
        {cs.status !== 'pending' && cs.resolvedBy && (
          <Meta>
            {cs.status} by {cs.resolvedBy.username} &middot; {formatTime(cs.resolvedAt as string)}
          </Meta>
        )}
        {error && <ErrorText>{error}</ErrorText>}
      </Card.Body>
    </StyledCard>
  );
}

const StyledCard = styled(Card)({
  marginBottom: 16,
});

const HeaderRow = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 8,
});

const StatusBadge = styled('span')({
  display: 'inline-block',
  marginLeft: 8,
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'uppercase',
  '&[data-status="pending"]': { background: '#fff3cd', color: '#856404' },
  '&[data-status="accepted"]': { background: '#d4edda', color: '#155724' },
  '&[data-status="rejected"]': { background: '#f8d7da', color: '#721c24' },
});

const Meta = styled('span')({
  fontSize: 13,
  color: '#666',
});

const Comment = styled('p')({
  fontStyle: 'italic',
  color: '#555',
  margin: '4px 0 8px',
});

const ChangesTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: 8,
  fontSize: 14,
  '& th, & td': {
    border: '1px solid #ddd',
    padding: '6px 10px',
    textAlign: 'left',
    verticalAlign: 'top',
  },
  '& th': {
    background: '#f5f5f5',
    fontWeight: 600,
  },
});

const DiffValue = styled('span')({
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontFamily: 'monospace',
  fontSize: 13,
});

const ActionRow = styled('div')({
  display: 'flex',
  gap: 8,
  marginTop: 12,
});

const buttonBase = {
  padding: '6px 16px',
  border: 'none',
  borderRadius: 4,
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14,
  '&:disabled': { opacity: 0.5, cursor: 'default' },
} as const;

const AcceptButton = styled('button')({
  ...buttonBase,
  background: '#28a745',
  color: '#fff',
  '&:hover:not(:disabled)': { background: '#218838' },
});

const RejectButton = styled('button')({
  ...buttonBase,
  background: '#dc3545',
  color: '#fff',
  '&:hover:not(:disabled)': { background: '#c82333' },
});

function formatValue(val: unknown): string {
  if (val == null) return '(empty)';
  if (Array.isArray(val)) return val.join(', ') || '(empty)';
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  return String(val);
}

function formatTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString();
}
