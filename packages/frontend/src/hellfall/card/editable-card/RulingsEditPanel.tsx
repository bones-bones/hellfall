import { useMemo, useState } from 'react';
import { Card } from '@workday/canvas-kit-react/card';
import { FormField } from '@workday/canvas-kit-react/form-field';
import { HCCard } from '@hellfall/shared/types';
import { createRootChange } from '@hellfall/shared/utils';
import { createStyles } from '@workday/canvas-kit-styling';
import { useAuth } from '../../../auth/index.ts';
import { getAuthApiUrl } from '../../../auth/getAuthApiUrl.ts';
import {
  createStyledButton,
  createStyledDiv,
  createStyledLabel,
  createStyledSubtext,
  createStyledTextArea,
} from '../../../styling';
import { useSyncPendingChangesets } from '../../hooks/usePendingChangesets.ts';

export const RulingsEditPanel = ({
  card,
  onClose,
  onSubmitted,
}: {
  card: HCCard.Any;
  onClose: () => void;
  onSubmitted?: () => void;
}) => {
  const { user } = useAuth();
  const baseUrl = getAuthApiUrl();
  const reloadPendingChangesets = useSyncPendingChangesets(card.id);
  const original = card.rulings ?? '';
  const [rulings, setRulings] = useState(original);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const changed = rulings !== original;
  const canSubmit = changed && Boolean(baseUrl);

  const previewLines = useMemo(
    () => (rulings.trim() ? rulings.split('\n').filter(Boolean) : []),
    [rulings]
  );

  const handleSubmit = async () => {
    if (!baseUrl || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/api/changesets`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card.id,
          changes: [createRootChange('add', 'rulings', rulings)],
          comment: comment.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.reason || `Error ${res.status}`);
      }
      setSuccess(true);
      await reloadPendingChangesets();
      onSubmitted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  if (success) {
    return (
      <Panel>
        <Card>
          <Card.Body>
            <SuccessMessage size="small">Rulings change submitted for review.</SuccessMessage>
            <CloseButton onClick={onClose}>Close</CloseButton>
          </Card.Body>
        </Card>
      </Panel>
    );
  }

  return (
    <Panel>
      <Card>
        <Card.Body>
          <Title>Edit Rulings</Title>
          <Hint>One ruling per line. Submitted changes go through review.</Hint>
          <FormField orientation="vertical">
            <Label>Rulings</Label>
            <RulingsArea
              value={rulings}
              onChange={e => setRulings(e.target.value)}
              rows={Math.max(6, previewLines.length + 2)}
            />
          </FormField>
          <FormField orientation="vertical">
            <Label>Comment (optional)</Label>
            <CommentArea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={2}
              placeholder="Why this rulings update?"
            />
          </FormField>
          {error && <ErrorMsg size="small">{error}</ErrorMsg>}
          <ActionRow>
            <SubmitButton type="button" disabled={!canSubmit || submitting} onClick={handleSubmit}>
              {submitting ? 'Submitting…' : 'Submit for review'}
            </SubmitButton>
            <CancelButton type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </CancelButton>
          </ActionRow>
        </Card.Body>
      </Card>
    </Panel>
  );
};

const panelStyles = createStyles({
  width: '100%',
  maxWidth: 480,
});
const Panel = createStyledDiv(panelStyles, 'RulingsEditPanel');

const titleStyles = createStyles({
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 4,
});
const Title = createStyledDiv(titleStyles, 'Title');

const hintStyles = createStyles({
  fontSize: 12,
  color: '#666',
  marginBottom: 10,
});
const Hint = createStyledDiv(hintStyles, 'Hint');

const labelStyles = createStyles({
  fontSize: 12,
  fontWeight: 600,
  color: '#555',
});
const Label = createStyledLabel(labelStyles, 'Label');

const rulingsAreaStyles = createStyles({
  width: '100%',
  fontFamily: 'inherit',
  fontSize: 13,
  lineHeight: 1.4,
  padding: '6px 8px',
  border: '1px solid #ccc',
  borderRadius: 2,
  resize: 'vertical',
});
const RulingsArea = createStyledTextArea(rulingsAreaStyles, 'RulingsArea');

const commentAreaStyles = createStyles({
  width: '100%',
  fontFamily: 'inherit',
  fontSize: 13,
  padding: '6px 8px',
  border: '1px solid #ccc',
  borderRadius: 2,
  resize: 'vertical',
});
const CommentArea = createStyledTextArea(commentAreaStyles, 'CommentArea');

const errorMsgStyles = createStyles({ color: '#c00', fontSize: 13, margin: '6px 0' });
const ErrorMsg = createStyledSubtext(errorMsgStyles, 'ErrorMsg');

const successMessageStyles = createStyles({ margin: 0 });
const SuccessMessage = createStyledSubtext(successMessageStyles, 'SuccessMessage');

const actionRowStyles = createStyles({ display: 'flex', gap: 8, marginTop: 12 });
const ActionRow = createStyledDiv(actionRowStyles, 'ActionRow');

const buttonStyles = createStyles({
  padding: '4px 14px',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 13,
  cursor: 'pointer',
  background: '#fff',
  '&:hover:not(:disabled)': { borderColor: '#888' },
  '&:disabled': { opacity: 0.4, cursor: 'default' },
});
const SubmitButton = createStyledButton(buttonStyles, 'SubmitButton');
const CancelButton = createStyledButton(buttonStyles, 'CancelButton');
const CloseButton = createStyledButton(buttonStyles, 'CloseButton');
