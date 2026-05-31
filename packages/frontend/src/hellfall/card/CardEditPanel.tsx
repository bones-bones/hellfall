import { useState, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import { Card } from '@workday/canvas-kit-react';
import type { HCCard } from '@hellfall/shared/types';
import { useAuth } from '../../auth';
import { getAuthApiUrl } from '../../auth/getAuthApiUrl';

type EditableFields = {
  name: string;
  mana_cost: string;
  type_line: string;
  oracle_text: string;
  flavor_text: string;
  power: string;
  toughness: string;
  loyalty: string;
  defense: string;
  rarity: string;
  set: string;
  collector_number: string;
};

function extractEditableFields(card: HCCard.Any): EditableFields {
  const face = 'card_faces' in card ? card.card_faces[0] : card;
  return {
    name: card.name ?? '',
    mana_cost: face.mana_cost ?? '',
    type_line: face.type_line ?? '',
    oracle_text: face.oracle_text ?? '',
    flavor_text: ('flavor_text' in face ? (face as any).flavor_text : '') ?? '',
    power: ('power' in face ? (face as any).power : '') ?? '',
    toughness: ('toughness' in face ? (face as any).toughness : '') ?? '',
    loyalty: ('loyalty' in face ? (face as any).loyalty : '') ?? '',
    defense: ('defense' in face ? (face as any).defense : '') ?? '',
    rarity: card.rarity ?? '',
    set: card.set ?? '',
    collector_number: card.collector_number ?? '',
  };
}

const FIELD_LABELS: Record<keyof EditableFields, string> = {
  name: 'Name',
  mana_cost: 'Mana Cost',
  type_line: 'Type Line',
  oracle_text: 'Oracle Text',
  flavor_text: 'Flavor Text',
  power: 'Power',
  toughness: 'Toughness',
  loyalty: 'Loyalty',
  defense: 'Defense',
  rarity: 'Rarity',
  set: 'Set',
  collector_number: 'Collector #',
};

const TEXTAREA_FIELDS: (keyof EditableFields)[] = ['oracle_text', 'flavor_text'];

export function CardEditPanel({
  card,
  onClose,
  onSubmitted,
}: {
  card: HCCard.Any;
  onClose: () => void;
  onSubmitted?: () => void;
}) {
  const { user } = useAuth();
  const baseUrl = getAuthApiUrl();
  const original = useMemo(() => extractEditableFields(card), [card]);
  const [fields, setFields] = useState<EditableFields>(() => ({ ...original }));
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const changedFields = useMemo(() => {
    const changed: Record<string, { before: unknown; after: unknown }> = {};
    for (const key of Object.keys(fields) as (keyof EditableFields)[]) {
      if (fields[key] !== original[key]) {
        changed[key] = { before: original[key], after: fields[key] };
      }
    }
    return changed;
  }, [fields, original]);

  const hasChanges = Object.keys(changedFields).length > 0;

  const handleChange = useCallback(
    (field: keyof EditableFields, value: string) => {
      setFields(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = async () => {
    if (!baseUrl || !hasChanges) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/api/changesets`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card.id,
          changes: changedFields,
          comment: comment.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.reason || `Error ${res.status}`);
      }
      setSuccess(true);
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
            <SuccessMessage>Change submitted for review.</SuccessMessage>
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
          <PanelHeader>
            <PanelTitle>Edit Card</PanelTitle>
            <CloseButton onClick={onClose}>&times;</CloseButton>
          </PanelHeader>
          <FieldsGrid>
            {(Object.keys(FIELD_LABELS) as (keyof EditableFields)[]).map(key => {
              const isChanged = fields[key] !== original[key];
              return (
                <FieldRow key={key}>
                  <Label>{FIELD_LABELS[key]}</Label>
                  {TEXTAREA_FIELDS.includes(key) ? (
                    <StyledTextarea
                      value={fields[key]}
                      onChange={e => handleChange(key, e.target.value)}
                      rows={4}
                      $changed={isChanged}
                    />
                  ) : (
                    <StyledInput
                      value={fields[key]}
                      onChange={e => handleChange(key, e.target.value)}
                      $changed={isChanged}
                    />
                  )}
                </FieldRow>
              );
            })}
          </FieldsGrid>
          {hasChanges && (
            <ChangeSummary>
              <SummaryTitle>Changes to submit:</SummaryTitle>
              {Object.entries(changedFields).map(([field, change]) => (
                <ChangeRow key={field}>
                  <ChangeField>{FIELD_LABELS[field as keyof EditableFields] ?? field}</ChangeField>
                  <ChangeValues>
                    <BeforeValue>{String(change.before) || '(empty)'}</BeforeValue>
                    <Arrow>&rarr;</Arrow>
                    <AfterValue>{String(change.after) || '(empty)'}</AfterValue>
                  </ChangeValues>
                </ChangeRow>
              ))}
            </ChangeSummary>
          )}
          <CommentRow>
            <Label>Comment (optional)</Label>
            <StyledInput
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Describe your change..."
              $changed={false}
            />
          </CommentRow>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <ActionRow>
            <SubmitButton disabled={!hasChanges || submitting} onClick={handleSubmit}>
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </SubmitButton>
            <CancelButton onClick={onClose}>Cancel</CancelButton>
          </ActionRow>
        </Card.Body>
      </Card>
    </Panel>
  );
}

const Panel = styled('div')({
  marginTop: 16,
  width: '100%',
});

const PanelHeader = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
});

const PanelTitle = styled('span')({
  fontSize: 18,
  fontWeight: 700,
});

const FieldsGrid = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
});

const FieldRow = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
});

const Label = styled('label')({
  fontSize: 13,
  fontWeight: 600,
  color: '#333',
});

const StyledInput = styled('input')<{ $changed: boolean }>(({ $changed }) => ({
  padding: '6px 10px',
  border: `1px solid ${$changed ? '#C690FF' : '#ccc'}`,
  borderRadius: 4,
  fontSize: 14,
  fontFamily: 'inherit',
  background: $changed ? '#faf5ff' : '#fff',
  '&:focus': {
    outline: 'none',
    borderColor: '#C690FF',
    boxShadow: '0 0 0 2px rgba(198,144,255,0.2)',
  },
}));

const StyledTextarea = styled('textarea')<{ $changed: boolean }>(({ $changed }) => ({
  padding: '6px 10px',
  border: `1px solid ${$changed ? '#C690FF' : '#ccc'}`,
  borderRadius: 4,
  fontSize: 14,
  fontFamily: 'inherit',
  resize: 'vertical',
  background: $changed ? '#faf5ff' : '#fff',
  '&:focus': {
    outline: 'none',
    borderColor: '#C690FF',
    boxShadow: '0 0 0 2px rgba(198,144,255,0.2)',
  },
}));

const ChangeSummary = styled('div')({
  marginTop: 16,
  padding: 12,
  background: '#f8f5ff',
  borderRadius: 6,
  border: '1px solid #e0d4f5',
});

const SummaryTitle = styled('div')({
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 8,
  color: '#5a3d8a',
});

const ChangeRow = styled('div')({
  marginBottom: 6,
});

const ChangeField = styled('span')({
  fontSize: 12,
  fontWeight: 600,
  color: '#666',
  display: 'block',
});

const ChangeValues = styled('div')({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  fontSize: 13,
  fontFamily: 'monospace',
});

const BeforeValue = styled('span')({
  color: '#c00',
  textDecoration: 'line-through',
  wordBreak: 'break-word',
  maxWidth: '40%',
});

const AfterValue = styled('span')({
  color: '#155724',
  fontWeight: 600,
  wordBreak: 'break-word',
  maxWidth: '40%',
});

const Arrow = styled('span')({
  color: '#999',
  flexShrink: 0,
});

const CommentRow = styled('div')({
  marginTop: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
});

const ErrorMsg = styled('p')({
  color: '#c00',
  fontSize: 14,
  margin: '8px 0',
});

const SuccessMessage = styled('p')({
  color: '#155724',
  fontSize: 16,
  fontWeight: 600,
  background: '#d4edda',
  padding: 12,
  borderRadius: 6,
});

const ActionRow = styled('div')({
  display: 'flex',
  gap: 8,
  marginTop: 16,
});

const SubmitButton = styled('button')({
  padding: '8px 20px',
  background: '#C690FF',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  '&:hover:not(:disabled)': { background: '#a870e0' },
  '&:disabled': { opacity: 0.5, cursor: 'default' },
});

const CancelButton = styled('button')({
  padding: '8px 20px',
  background: '#fff',
  color: '#333',
  border: '1px solid #ccc',
  borderRadius: 4,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  '&:hover': { background: '#f5f5f5' },
});

const CloseButton = styled('button')({
  background: 'transparent',
  border: 'none',
  fontSize: 22,
  cursor: 'pointer',
  color: '#666',
  lineHeight: 1,
  padding: '4px 8px',
  '&:hover': { color: '#333' },
});
