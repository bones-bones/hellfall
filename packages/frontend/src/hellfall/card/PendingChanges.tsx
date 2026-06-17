import { useState } from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { usePendingChangesetsState } from '../hooks/usePendingChangesets';
import { createStyles } from '@workday/canvas-kit-styling';
import { Box, Text } from '@workday/canvas-kit-react';

export function PendingChanges({ cardId }: { cardId: string }) {
  const { changesets, loading } = usePendingChangesetsState(cardId);
  const [expanded, setExpanded] = useState(false);

  if (loading || changesets.length === 0) return null;

  return (
    <Box cs={container}>
      <Box cs={toggleRow} onClick={() => setExpanded(prev => !prev)}>
        <Text cs={badge}>{changesets.length}</Text>
        <Text cs={toggleText}>
          Pending change{changesets.length !== 1 ? 's' : ''}
          {expanded ? ' ▾' : ' ▸'}
        </Text>
      </Box>
      {expanded &&
        changesets.map(cs => (
          <Box cs={changesetBlock} key={cs.id}>
            <Box cs={csMeta}>
              by {cs.submittedBy.username}
              {cs.createdAt && <> &middot; {new Date(cs.createdAt).toLocaleDateString()}</>}
            </Box>
            {cs.comment && <Box cs={csComment}>{cs.comment}</Box>}
            {cs.changes.map(change => (
              <Box cs={fieldDiff} key={`${change.location}-${change.change_type}`}>
                {/* TODO: improve formatting */}
                {/* <FieldName>{field}</FieldName> */}
                {formatVal(change)}
              </Box>
            ))}
            <Link className={reviewLinkStyles} to={`/review/${cardId}`}>
              View in Review
            </Link>
          </Box>
        ))}
    </Box>
  );
}

function formatVal(val: unknown): string {
  if (val == null) return '(empty)';
  if (Array.isArray(val)) return val.join(', ') || '(empty)';
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  return String(val);
}

const container = createStyles({
  marginTop: 6,
  marginBottom: 4,
});

const toggleRow = createStyles({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  cursor: 'pointer',
  userSelect: 'none',
});

const badge = createStyles({
  fontSize: 12,
  fontWeight: 600,
});

const toggleText = createStyles({
  fontSize: 12,
  color: '#555',
});

const changesetBlock = createStyles({
  marginTop: 6,
  padding: '6px 8px',
  border: '1px solid #ccc',
});

const csMeta = createStyles({
  fontSize: 12,
  color: '#666',
});

const csComment = createStyles({
  fontSize: 12,
  fontStyle: 'italic',
  color: '#555',
  marginTop: 2,
});

const fieldDiff = createStyles({
  marginTop: 4,
});

const fieldName = createStyles({
  fontSize: 11,
  fontWeight: 600,
  color: '#888',
});

const reviewLinkStyles = createStyles({
  display: 'inline-block',
  marginTop: 4,
  fontSize: 12,
  color: 'inherit',
  '&:hover': { textDecoration: 'underline' },
});
