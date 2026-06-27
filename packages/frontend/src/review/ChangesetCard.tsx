import { Card, TextProps } from '@workday/canvas-kit-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { ErrorText } from './ErrorText';
import { Changeset, ChangesetStatus, formatChangesetDiffValue } from '@hellfall/shared/utils';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import {
  createStenciledSpan,
  createStyledButton,
  createStyledDiv,
  createStyledImg,
  createStyledInput,
  createStyledIntrinsic,
  createStyledLink,
  createStyledSpan,
  createStyledTable,
} from '../styling';
import { cardsAtom } from '../hellfall/atoms/cardsAtom';
import { getPrimaryImageUrl, previewCardWithChanges } from './cardImage';

export function ChangesetCard({
  cs,
  isAdmin,
  onAction,
  selectable,
  selected,
  onToggleSelect,
}: {
  cs: Changeset;
  isAdmin: boolean;
  onAction: (id: string, action: 'accept' | 'reject') => Promise<void>;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const cards = useAtomValue(cardsAtom);
  const card = cards.get(cs.cardId);
  const preview = card ? previewCardWithChanges(card, cs.changes) : undefined;
  const imageUrl = preview ? getPrimaryImageUrl(preview) : undefined;
  const cardName = preview?.name ?? card?.name;

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
        <TopRow>
          {selectable && (
            <SelectCheckbox
              type="checkbox"
              checked={selected}
              onChange={onToggleSelect}
              aria-label={`Select changeset for ${cardName ?? cs.cardId}`}
            />
          )}
          {imageUrl ? (
            <ImageLink to={`/card/${encodeURIComponent(card?.hcid ?? cs.cardId)}`}>
              <CardThumbnail src={imageUrl} alt={cardName ?? cs.cardId} referrerPolicy="no-referrer" />
            </ImageLink>
          ) : (
            <ImagePlaceholder>No image</ImagePlaceholder>
          )}
          <ContentColumn>
            <HeaderRow>
              <div>
                <strong>
                  <Link to={`/card/${encodeURIComponent(card?.hcid ?? cs.cardId)}`}>
                    {cardName ?? cs.cardId}
                  </Link>
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
            {cs.diff?.length ? (
              cs.diff.map((row, index) => (
                <tr key={`${row.field}-${index}`}>
                  <td>
                    <code>{row.field}</code>
                  </td>
                  <td>
                    <DiffValue>{formatChangesetDiffValue(row.before)}</DiffValue>
                  </td>
                  <td>
                    <DiffValue>{formatChangesetDiffValue(row.after)}</DiffValue>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>
                  <Meta>Could not load before/after diff for this card.</Meta>
                </td>
              </tr>
            )}
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
                {cs.status} by {cs.resolvedBy.username} &middot;{' '}
                {formatTime(cs.resolvedAt as string)}
              </Meta>
            )}
            {error && <ErrorText size="large">{error}</ErrorText>}
          </ContentColumn>
        </TopRow>
      </Card.Body>
    </Card>
  );
}

const cardStyles = createStyles({
  marginBottom: 16,
});

const topRowStyles = createStyles({
  display: 'flex',
  gap: 12,
  alignItems: 'flex-start',
});
const TopRow = createStyledDiv(topRowStyles);

const selectCheckboxStyles = createStyles({
  marginTop: 8,
  width: 18,
  height: 18,
  flexShrink: 0,
  cursor: 'pointer',
});
const SelectCheckbox = createStyledInput(selectCheckboxStyles);

const imageLinkStyles = createStyles({
  flexShrink: 0,
  textDecoration: 'none',
});
const ImageLink = createStyledLink(imageLinkStyles);

const cardThumbnailStyles = createStyles({
  display: 'block',
  width: 120,
  height: 'auto',
  borderRadius: '4.75% / 3.5%',
  objectFit: 'contain',
});
const CardThumbnail = createStyledImg(cardThumbnailStyles);

const imagePlaceholderStyles = createStyles({
  flexShrink: 0,
  width: 120,
  height: 168,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f0f0f0',
  borderRadius: 4,
  fontSize: 12,
  color: '#888',
  textAlign: 'center',
});
const ImagePlaceholder = createStyledDiv(imagePlaceholderStyles);

const contentColumnStyles = createStyles({
  flex: 1,
  minWidth: 0,
});
const ContentColumn = createStyledDiv(contentColumnStyles);

const headerRowStyles = createStyles({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 8,
});
const HeaderRow = createStyledDiv(headerRowStyles);

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
const StatusBadge = createStenciledSpan<StatusProps>(statusBadgeStencil);

const metaStyles = createStyles({
  fontSize: 13,
  color: '#666',
});
const Meta = createStyledSpan(metaStyles);

const commentStyles = createStyles({
  fontStyle: 'italic',
  color: '#555',
  margin: '4px 0 8px',
});
const Comment = createStyledIntrinsic('p', commentStyles);

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
const ChangesTable = createStyledTable(changesTableStyles);

const diffValueStyles = createStyles({
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontFamily: 'monospace',
  fontSize: 13,
});
const DiffValue = createStyledSpan(diffValueStyles);

const actionRowStyles = createStyles({
  display: 'flex',
  gap: 8,
  marginTop: 12,
});
const ActionRow = createStyledDiv(actionRowStyles);

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
const AcceptButton = createStyledButton(acceptButtonStyles);

const rejectButtonStyles = createStyles(buttonBase, {
  background: '#dc3545',
  color: '#fff',
  '&:hover:not(:disabled)': { background: '#c82333' },
});
const RejectButton = createStyledButton(rejectButtonStyles);

function formatTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString();
}
