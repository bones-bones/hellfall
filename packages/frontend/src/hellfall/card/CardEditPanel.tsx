import { useState, useCallback, useMemo } from 'react';
// import styled from '@emotion/styled';
import { Box, Card, Subtext, Text, TextArea } from '@workday/canvas-kit-react';
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
import { FormField } from '@workday/canvas-kit-preview-react';

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
      <Box cs={panel}>
        <Card>
          <Card.Body>
            <Subtext size="small" cs={successMessage}>
              Change submitted for review.
            </Subtext>
            <button className={closeButton} onClick={onClose}>
              Close
            </button>
          </Card.Body>
        </Card>
      </Box>
    );
  }

  return (
    <Box cs={panel}>
      <Card>
        <Card.Body>
          <Box cs={panelHeader}>
            <Text cs={panelTitle}>Edit Card</Text>
            <button className={closeButton} onClick={onClose}>
              &times;
            </button>
          </Box>
          <Box cs={fieldsGrid}>
            {(Object.keys(FIELD_LABELS) as (keyof EditableFields)[]).map(key => {
              const isChanged = fields[key] !== original[key];
              const fieldId = `field-${key}`;
              return (
                <Box cs={fieldRow} key={key}>
                  <FormField orientation="vertical">
                    <Text as="label" cs={label}>
                      {FIELD_LABELS[key]}
                    </Text>
                    {TEXTAREA_FIELDS.includes(key) ? (
                      <textarea
                        {...inputAreaStencil({ changed: isChanged })}
                        id={fieldId}
                        value={fields[key]}
                        onChange={e => handleChange(key, e.target.value)}
                        rows={4}
                      />
                    ) : (
                      <input
                        {...inputStencil({ changed: isChanged })}
                        id={fieldId}
                        value={fields[key]}
                        onChange={e => handleChange(key, e.target.value)}
                      />
                    )}
                  </FormField>
                </Box>
              );
            })}
          </Box>
          {hasChanges && (
            <Box cs={changeSummary}>
              <Box cs={summaryTitle}>Changes to submit:</Box>
              {Object.entries(changedFields).map(([field, change]) => (
                <Box cs={changeRow} key={field}>
                  <Text cs={changeField}>
                    {FIELD_LABELS[field as keyof EditableFields] ?? field}
                  </Text>
                  <Box cs={changeValues}>
                    <Text cs={beforeValue}>{String(change.before) || '(empty)'}</Text>
                    <Text cs={arrow}>&rarr;</Text>
                    <Text cs={afterValue}>{String(change.after) || '(empty)'}</Text>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
          <Box cs={commentRow}>
            <FormField orientation="vertical">
              <Text as="label" cs={label}>
                Comment (optional)
              </Text>
              <input
                {...inputStencil({ changed: false })}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Describe your change..."
              />
            </FormField>
          </Box>
          {error && (
            <Subtext size="small" cs={errorMsg}>
              {error}
            </Subtext>
          )}
          <Box cs={actionRow}>
            <button
              className={submitButton}
              disabled={!hasChanges || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </button>
            <button className={cancelButton} onClick={onClose}>
              Cancel
            </button>
          </Box>
        </Card.Body>
      </Card>
    </Box>
  );
}

const panel = createStyles({
  marginTop: 12,
  width: '100%',
});

const panelHeader = createStyles({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
});

const panelTitle = createStyles({
  fontSize: 16,
  fontWeight: 600,
});

const fieldsGrid = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

const fieldRow = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
});

const label = createStyles({
  fontSize: 12,
  fontWeight: 600,
  color: '#555',
});

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

const inputAreaStencil = createStencil({
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

const changeSummary = createStyles({
  marginTop: 12,
  padding: '8px 10px',
  border: '1px solid #ccc',
});

const summaryTitle = createStyles({
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
});

const changeRow = createStyles({
  marginBottom: 4,
});

const changeField = createStyles({
  fontSize: 12,
  fontWeight: 600,
  color: '#666',
  display: 'block',
});

const changeValues = createStyles({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 6,
  fontSize: 13,
  fontFamily: 'monospace',
});

const beforeValue = createStyles({
  color: '#900',
  textDecoration: 'line-through',
  wordBreak: 'break-word',
  maxWidth: '40%',
});

const afterValue = createStyles({
  color: '#060',
  wordBreak: 'break-word',
  maxWidth: '40%',
});

const arrow = createStyles({
  color: '#999',
  flexShrink: 0,
});

const commentRow = createStyles({
  marginTop: 10,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
});

const errorMsg = createStyles({
  color: '#c00',
  fontSize: 13,
  margin: '6px 0',
});

const successMessage = createStyles({
  // fontSize: 14,
  margin: 0,
});

const actionRow = createStyles({
  display: 'flex',
  gap: 8,
  marginTop: 12,
});

const submitButton = createStyles({
  padding: '4px 14px',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 13,
  cursor: 'pointer',
  background: '#fff',
  '&:hover:not(:disabled)': { borderColor: '#888' },
  '&:disabled': { opacity: 0.4, cursor: 'default' },
});

const cancelButton = createStyles({
  padding: '4px 14px',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 13,
  cursor: 'pointer',
  background: '#fff',
  '&:hover': { borderColor: '#888' },
});

const closeButton = createStyles({
  background: 'transparent',
  border: 'none',
  fontSize: 18,
  cursor: 'pointer',
  color: '#666',
  lineHeight: 1,
  padding: '2px 6px',
  '&:hover': { color: '#000' },
});
