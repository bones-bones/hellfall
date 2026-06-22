import { useState, useCallback, useMemo } from 'react';
import { Card, FormField } from '@workday/canvas-kit-react';
import type { HCCard } from '@hellfall/shared/types';
import { useAuth } from '../../auth';
import { getAuthApiUrl } from '../../auth/getAuthApiUrl';
import {
  anyChange,
  faceChange,
  faceMappedType,
  faceValueType,
  getFaceEntries,
  toFaces,
} from '@hellfall/shared/utils';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import {
  createStenciledInput,
  createStenciledTextArea,
  createStyledButton,
  createStyledDiv,
  createStyledLabel,
  createStyledSpan,
  createStyledSubtext,
} from '../../styling';

export type EditableFields = {
  name: string;
  mana_cost: string;
  supertypes: string;
  types: string;
  subtypes: string;
  oracle_text: string;
  flavor_text: string;
  power: string;
  toughness: string;
  loyalty: string;
  defense: string;
  // rarity: string;
  // set: string;
  // collector_number: string;
};

function extractEditableFields(card: HCCard.Any): EditableFields {
  const face = toFaces(card)[0];
  return {
    name: card.name ?? '',
    mana_cost: face.mana_cost ?? '',
    supertypes: face.supertypes?.join(';') ?? '',
    types: face.types?.join(';') ?? '',
    subtypes: face.subtypes?.join(';') ?? '',
    oracle_text: face.oracle_text ?? '',
    flavor_text: ('flavor_text' in face ? (face as any).flavor_text : '') ?? '',
    power: ('power' in face ? (face as any).power : '') ?? '',
    toughness: ('toughness' in face ? (face as any).toughness : '') ?? '',
    loyalty: ('loyalty' in face ? (face as any).loyalty : '') ?? '',
    defense: ('defense' in face ? (face as any).defense : '') ?? '',
    // rarity: card.rarity ?? '',
    // set: card.set ?? '',
    // collector_number: card.collector_number ?? '',
  };
}

const FIELD_LABELS: Record<keyof EditableFields, string> = {
  name: 'Name',
  mana_cost: 'Mana Cost',
  supertypes: 'Supertypes',
  types: 'Types',
  subtypes: 'Subtypes',
  oracle_text: 'Oracle Text',
  flavor_text: 'Flavor Text',
  power: 'Power',
  toughness: 'Toughness',
  loyalty: 'Loyalty',
  defense: 'Defense',
  // rarity: 'Rarity',
  // set: 'Set',
  // collector_number: 'Collector #',
};

const TEXTAREA_FIELDS: (keyof EditableFields)[] = ['oracle_text', 'flavor_text'];

const convertFieldToChange = <T extends keyof EditableFields>(
  prop: T,
  value: EditableFields[T]
): anyChange => {
  const change: faceChange<T> = {
    location: 'face',
    change_type: 'add',
    prop,
    index: 0,
  };
  if (['supertypes', 'types', 'subtypes'].includes(prop)) {
    change.value = value.split(';') as faceValueType<T>;
  } else {
    change.value = value as faceValueType<T>;
  }
  return change;
};

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

  const changeMap = useMemo(() => {
    const changed: faceMappedType /* Record<string, { before: unknown; after: unknown }> */ = {};
    for (const key of Object.keys(fields) as (keyof EditableFields)[]) {
      if (fields[key] !== original[key]) {
        (changed as any)[key] = fields[key] /* { before: original[key], after: fields[key] } */;
      }
    }
    return changed;
  }, [fields, original]);

  const hasChanges = Object.keys(changedFields).length > 0;

  const handleChange = useCallback((field: keyof EditableFields, value: string) => {
    setFields(prev => ({ ...prev, [field]: value }));
  }, []);

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
          changes: getFaceEntries(changeMap).map(([prop, value]) =>
            convertFieldToChange(prop as keyof EditableFields, value as string)
          ),
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
            <SuccessMessage size="small">Change submitted for review.</SuccessMessage>
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
              const fieldId = `field-${key}`;
              return (
                <FieldRow key={key}>
                  <FormField orientation="vertical">
                    <Label>{FIELD_LABELS[key]}</Label>
                    {TEXTAREA_FIELDS.includes(key) ? (
                      <StyledTextarea
                        changed={isChanged}
                        id={fieldId}
                        value={fields[key]}
                        onChange={e => handleChange(key, e.target.value)}
                        rows={4}
                      />
                    ) : (
                      <StyledInput
                        changed={isChanged}
                        id={fieldId}
                        value={fields[key]}
                        onChange={e => handleChange(key, e.target.value)}
                      />
                    )}
                  </FormField>
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
            <FormField orientation="vertical">
              <Label>Comment (optional)</Label>
              <StyledInput
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Describe your change..."
              />
            </FormField>
          </CommentRow>
          {error && <ErrorMsg size="small">{error}</ErrorMsg>}
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

const panelStyles = createStyles({
  marginTop: 12,
  width: '100%',
});
const Panel = createStyledDiv(panelStyles);

const panelHeaderStyles = createStyles({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
});
const PanelHeader = createStyledDiv(panelHeaderStyles);

const panelTitleStyles = createStyles({
  fontSize: 16,
  fontWeight: 600,
});
const PanelTitle = createStyledSpan(panelTitleStyles);

const fieldsGridStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});
const FieldsGrid = createStyledDiv(fieldsGridStyles);

const fieldRowStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
});
const FieldRow = createStyledDiv(fieldRowStyles);

const labelStyles = createStyles({
  fontSize: 12,
  fontWeight: 600,
  color: '#555',
});
const Label = createStyledLabel(labelStyles);

const inputStyles = {
  padding: '4px 8px',
  boxSizing: 'border-box',
  border: '1px solid #ccc',
  borderRadius: '2px',
  fontSize: 14,
  fontFamily: 'inherit',
  background: '#fff',
  width: '100%',
  height: 'auto',
};

const inputStencil = createStencil({
  vars: {},
  base: inputStyles,
  modifiers: {
    changed: {
      true: {
        border: '1px solid #888',
        background: '#ffe',
      },
    },
  },
});
interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  changed?: boolean;
}
const StyledInput = createStenciledInput<InputProps>(inputStencil);

const textAreaStencil = createStencil({
  vars: {},
  base: {
    ...inputStyles,
    resize: 'vertical',
  },
  modifiers: {
    changed: {
      true: {
        border: '1px solid #888',
        background: '#ffe',
      },
    },
  },
});
interface TextAreaProps extends React.ComponentPropsWithoutRef<'textarea'> {
  changed?: boolean;
}
const StyledTextarea = createStenciledTextArea<TextAreaProps>(textAreaStencil);

const changeSummaryStyles = createStyles({
  marginTop: 12,
  padding: '8px 10px',
  border: '1px solid #ccc',
});
const ChangeSummary = createStyledDiv(changeSummaryStyles);

const summaryTitleStyles = createStyles({
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
});
const SummaryTitle = createStyledDiv(summaryTitleStyles);

const changeRowStyles = createStyles({
  marginBottom: 4,
});
const ChangeRow = createStyledDiv(changeRowStyles);

const changeFieldStyles = createStyles({
  fontSize: 12,
  fontWeight: 600,
  color: '#666',
  display: 'block',
});
const ChangeField = createStyledSpan(changeFieldStyles);

const changeValuesStyles = createStyles({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 6,
  fontSize: 13,
  fontFamily: 'monospace',
});
const ChangeValues = createStyledDiv(changeValuesStyles);

const beforeValueStyles = createStyles({
  color: '#900',
  textDecoration: 'line-through',
  wordBreak: 'break-word',
  maxWidth: '40%',
});
const BeforeValue = createStyledSpan(beforeValueStyles);

const afterValueStyles = createStyles({
  color: '#060',
  wordBreak: 'break-word',
  maxWidth: '40%',
});
const AfterValue = createStyledSpan(afterValueStyles);

const arrowStyles = createStyles({
  color: '#999',
  flexShrink: 0,
});
const Arrow = createStyledSpan(arrowStyles);

const commentRowStyles = createStyles({
  marginTop: 10,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
});
const CommentRow = createStyledDiv(commentRowStyles);

const errorMsgStyles = createStyles({
  color: '#c00',
  fontSize: 13,
  margin: '6px 0',
});
const ErrorMsg = createStyledSubtext(errorMsgStyles);

const successMessageStyles = createStyles({
  // fontSize: 14,
  margin: 0,
});
const SuccessMessage = createStyledSubtext(successMessageStyles);

const actionRowStyles = createStyles({
  display: 'flex',
  gap: 8,
  marginTop: 12,
});
const ActionRow = createStyledDiv(actionRowStyles);

const submitButtonStyles = createStyles({
  padding: '4px 14px',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 13,
  cursor: 'pointer',
  background: '#fff',
  '&:hover:not(:disabled)': { borderColor: '#888' },
  '&:disabled': { opacity: 0.4, cursor: 'default' },
});
const SubmitButton = createStyledButton(submitButtonStyles);

const cancelButtonStyles = createStyles({
  padding: '4px 14px',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 13,
  cursor: 'pointer',
  background: '#fff',
  '&:hover': { borderColor: '#888' },
});
const CancelButton = createStyledButton(cancelButtonStyles);

const closeButtonStyles = createStyles({
  background: 'transparent',
  border: 'none',
  fontSize: 18,
  cursor: 'pointer',
  color: '#666',
  lineHeight: 1,
  padding: '2px 6px',
  '&:hover': { color: '#000' },
});

const CloseButton = createStyledButton(closeButtonStyles);
