import { formatChangesetDiffValue } from '@hellfall/shared/utils';
import { useState } from 'react';
import { usePendingChangesetsState } from '../hooks/usePendingChangesets';
import { createStyles } from '@workday/canvas-kit-styling';
import {
  createStyledDiv,
  createStyledDivClickable,
  createStyledLink,
  createStyledSpan,
} from '../../styling';

export function PendingChanges({ cardId }: { cardId: string }) {
  const { changesets, loading } = usePendingChangesetsState(cardId);
  const [expanded, setExpanded] = useState(false);

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
            {cs.diff?.map((row, index) => (
              <FieldDiff key={index}>
                <strong>{row.field}:</strong> {formatChangesetDiffValue(row.before)} &rarr;{' '}
                {formatChangesetDiffValue(row.after)}
              </FieldDiff>
            ))}
            <ReviewLink to={`/review/${cardId}`}>View in Review</ReviewLink>
          </ChangesetBlock>
        ))}
    </Container>
  );
}

const containerStyles = createStyles({
  marginTop: 6,
  marginBottom: 4,
});
const Container = createStyledDiv(containerStyles, 'Container');

const toggleRowStyles = createStyles({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  cursor: 'pointer',
  userSelect: 'none',
});
const ToggleRow = createStyledDivClickable(toggleRowStyles, 'ToggleRow');

const badgeStyles = createStyles({
  fontSize: 12,
  fontWeight: 600,
});
const Badge = createStyledSpan(badgeStyles, 'Badge');

const toggleTextStyles = createStyles({
  fontSize: 12,
  color: '#555',
});
const ToggleText = createStyledSpan(toggleTextStyles, 'ToggleText');

const changesetBlockStyles = createStyles({
  marginTop: 6,
  padding: '6px 8px',
  border: '1px solid #ccc',
});
const ChangesetBlock = createStyledDiv(changesetBlockStyles, 'ChangesetBlock');

const csMetaStyles = createStyles({
  fontSize: 12,
  color: '#666',
});
const CsMeta = createStyledDiv(csMetaStyles, 'CsMeta');

const csCommentStyles = createStyles({
  fontSize: 12,
  fontStyle: 'italic',
  color: '#555',
  marginTop: 2,
});
const CsComment = createStyledDiv(csCommentStyles, 'CsComment');

const fieldDiffStyles = createStyles({
  marginTop: 4,
});
const FieldDiff = createStyledDiv(fieldDiffStyles, 'FieldDiff');

const reviewLinkStyles = createStyles({
  display: 'inline-block',
  marginTop: 4,
  fontSize: 12,
  color: 'inherit',
  '&:hover': { textDecoration: 'underline' },
});
const ReviewLink = createStyledLink(reviewLinkStyles, 'ReviewLink');
