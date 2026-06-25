import { Card, TextProps } from '@workday/canvas-kit-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
// import { Changeset } from './types';
import { ErrorText } from './ErrorText';
import { Changeset, ChangesetStatus } from '@hellfall/shared/utils';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import {
  createStenciledSpan,
  createStyledButton,
  createStyledDiv,
  createStyledIntrinsic,
  createStyledSpan,
  createStyledTable,
} from '../styling';

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
    if (!cs.id) {
      setError('Missing changeset id');
      return;
    }
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
    <Card cs={cardStyles}>
      <Card.Body>
        <HeaderRow>
          <div>
            <strong>
              <Link to={`/card/${encodeURIComponent(cs.cardId)}`}>{cs.cardId}</Link>
            </strong>
            <StatusBadge data_status={cs.status}>{cs.status}</StatusBadge>
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
        {error && <ErrorText size="large">{error}</ErrorText>}
      </Card.Body>
    </Card>
  );
}

const cardStyles = createStyles({
  marginBottom: 16,
});

const headerRowStyles = createStyles({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 8,
});
const HeaderRow = createStyledDiv(headerRowStyles, 'HeaderRow');

const statusBadgeStencil = createStencil({
  vars: {},
  base: {
    display: 'inline-block',
    marginLeft: 8,
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  modifiers: {
    data_status: {
      pending: { background: '#fff3cd', color: '#856404' },
      accepted: { background: '#d4edda', color: '#155724' },
      rejected: { background: '#f8d7da', color: '#721c24' },
    },
  },
});
interface StatusProps extends TextProps {
  data_status?: ChangesetStatus;
}
const StatusBadge = createStenciledSpan<StatusProps>(statusBadgeStencil, 'StatusBadge');

const metaStyles = createStyles({
  fontSize: 13,
  color: '#666',
});
const Meta = createStyledSpan(metaStyles, 'Meta');

const commentStyles = createStyles({
  fontStyle: 'italic',
  color: '#555',
  margin: '4px 0 8px',
});
const Comment = createStyledIntrinsic('p', commentStyles, 'Comment');

const changesTableStyles = createStyles({
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
const ChangesTable = createStyledTable(changesTableStyles, 'ChangesTable');

const diffValueStyles = createStyles({
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontFamily: 'monospace',
  fontSize: 13,
});
const DiffValue = createStyledSpan(diffValueStyles, 'DiffValue');

const actionRowStyles = createStyles({
  display: 'flex',
  gap: 8,
  marginTop: 12,
});
const ActionRow = createStyledDiv(actionRowStyles, 'ActionRow');

const buttonBase = createStyles({
  padding: '6px 16px',
  border: 'none',
  borderRadius: 4,
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14,
  '&:disabled': { opacity: 0.5, cursor: 'default' },
});

const acceptButtonStyles = createStyles(buttonBase, {
  background: '#28a745',
  color: '#fff',
  '&:hover:not(:disabled)': { background: '#218838' },
});
const AcceptButton = createStyledButton(acceptButtonStyles, 'AcceptButton');

const rejectButtonStyles = createStyles(buttonBase, {
  background: '#dc3545',
  color: '#fff',
  '&:hover:not(:disabled)': { background: '#c82333' },
});
const RejectButton = createStyledButton(rejectButtonStyles, 'RejectButton');

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
