import { useState } from 'react';
import { createStyles } from '@workday/canvas-kit-styling';
import { createCardDocumentChange } from '@hellfall/shared/utils';
import { getAuthApiUrl } from '../../../auth/getAuthApiUrl.ts';
import {
  createStyledButton,
  createStyledDiv,
  createStyledSpan,
} from '../../../styling/StyledElements.tsx';

export const CardEditingControls = ({
  canEdit,
  cardId,
  cardName,
  onEditStart,
  onDeleteSubmitted,
}: {
  canEdit: boolean;
  cardId: string;
  cardName: string;
  onEditStart: () => void;
  onDeleteSubmitted?: () => void;
}) => {
  const baseUrl = getAuthApiUrl();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canEdit) return null;

  const submitDelete = async () => {
    if (!baseUrl) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/api/changesets`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          changes: [createCardDocumentChange('delete')],
          comment: `Delete ${cardName}`,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.reason || `Error ${res.status}`);
      }
      setConfirming(false);
      onDeleteSubmitted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit delete');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Controls>
      <EditCardButton type="button" onClick={onEditStart}>
        Edit Card Data
      </EditCardButton>
      {!confirming ? (
        <DeleteCardButton type="button" onClick={() => setConfirming(true)}>
          Propose Delete
        </DeleteCardButton>
      ) : (
        <ConfirmRow>
          <ConfirmText>Submit delete for approval?</ConfirmText>
          <ConfirmDeleteButton type="button" disabled={submitting} onClick={submitDelete}>
            {submitting ? 'Submitting…' : 'Confirm'}
          </ConfirmDeleteButton>
          <CancelButton type="button" disabled={submitting} onClick={() => setConfirming(false)}>
            Cancel
          </CancelButton>
        </ConfirmRow>
      )}
      {error && <ErrorText>{error}</ErrorText>}
    </Controls>
  );
};

const controlsStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 4,
  marginTop: 6,
  marginBottom: 4,
});
const Controls = createStyledDiv(controlsStyles, 'CardEditingControls');

const editCardButtonStyles = createStyles({
  display: 'block',
  padding: '3px 10px',
  background: '#fff',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 12,
  cursor: 'pointer',
  '&:hover': { borderColor: '#888' },
});
const EditCardButton = createStyledButton(editCardButtonStyles, 'EditCardButton');

const deleteCardButtonStyles = createStyles({
  display: 'block',
  padding: '3px 10px',
  background: '#fff',
  border: '1px solid #dc3545',
  color: '#dc3545',
  borderRadius: 2,
  fontSize: 12,
  cursor: 'pointer',
  '&:hover': { background: '#fff5f5' },
});
const DeleteCardButton = createStyledButton(deleteCardButtonStyles, 'DeleteCardButton');

const confirmRowStyles = createStyles({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  alignItems: 'center',
});
const ConfirmRow = createStyledDiv(confirmRowStyles);

const confirmTextStyles = createStyles({
  fontSize: 12,
  color: '#555',
});
const ConfirmText = createStyledSpan(confirmTextStyles);

const confirmDeleteButtonStyles = createStyles({
  padding: '3px 10px',
  background: '#dc3545',
  color: '#fff',
  border: 'none',
  borderRadius: 2,
  fontSize: 12,
  cursor: 'pointer',
  '&:disabled': { opacity: 0.5, cursor: 'default' },
});
const ConfirmDeleteButton = createStyledButton(confirmDeleteButtonStyles);

const cancelButtonStyles = createStyles({
  padding: '3px 10px',
  background: '#fff',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 12,
  cursor: 'pointer',
  '&:disabled': { opacity: 0.5, cursor: 'default' },
});
const CancelButton = createStyledButton(cancelButtonStyles);

const errorTextStyles = createStyles({
  fontSize: 12,
  color: '#b00020',
});
const ErrorText = createStyledSpan(errorTextStyles);
