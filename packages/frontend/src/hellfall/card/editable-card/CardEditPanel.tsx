import { useState, useCallback, useMemo } from 'react';
import { Card } from '@workday/canvas-kit-react/card';
import { FormField } from '@workday/canvas-kit-react/form-field';
import { HCCard } from '@hellfall/shared/types';
import { useAuth } from '../../../auth/index.ts';
import { getAuthApiUrl } from '../../../auth/getAuthApiUrl.ts';
import { createStyles, createStencil } from '@workday/canvas-kit-styling';
import {
  createStenciledInput,
  createStenciledTextArea,
  createStenciledButton,
  createStyledButton,
  createStyledDiv,
  createStyledLabel,
  createStyledSelect,
  createStyledSpan,
  createStyledSubtext,
} from '../../../styling';
import { ROOT_FIELD_CONFIGS, buildEditFormState, buildChangesFromForm } from './cardEditFields.ts';
import { useSyncPendingChangesets } from '../../hooks/usePendingChangesets.ts';
import { EditFormState, FieldConfig } from './types.ts';
import { addPendingFace } from './faces/addPendingFace.ts';
import { FACE_FIELD_CONFIGS } from './constants.ts';

export const CardEditPanel = ({
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
  const original = useMemo(() => buildEditFormState(card), [card]);
  const [form, setForm] = useState<EditFormState>(() => structuredClone(original));
  const [activeFace, setActiveFace] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const changes = useMemo(() => buildChangesFromForm(card, original, form), [card, original, form]);
  const hasChanges = changes.length > 0;

  const setRootField = useCallback((key: string, value: string) => {
    setForm(prev => ({ ...prev, root: { ...prev.root, [key]: value } }));
  }, []);

  const setFaceField = useCallback((faceIndex: number, key: string, value: string) => {
    setForm(prev => {
      const faces = [...prev.faces];
      faces[faceIndex] = { ...faces[faceIndex], [key]: value };
      return { ...prev, faces };
    });
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
          changes,
          comment: comment.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.reason || `Error ${res.status}`);
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
            <SuccessMessage size="small">Change submitted for review.</SuccessMessage>
            <CloseButton onClick={onClose}>Close</CloseButton>
          </Card.Body>
        </Card>
      </Panel>
    );
  }

  const faceCount = form.faces.length;
  const isMulti = 'card_faces' in card || form.faces.length > original.faces.length;

  return (
    <Panel>
      <Card>
        <Card.Body>
          <PanelHeader>
            <PanelTitle>Edit Card</PanelTitle>
            <CloseButton onClick={onClose}>&times;</CloseButton>
          </PanelHeader>

          <SectionTitle>Card-level fields</SectionTitle>
          <FieldsGrid>
            {ROOT_FIELD_CONFIGS.map(cfg => (
              <FieldEditor
                key={cfg.key}
                config={cfg}
                value={form.root[cfg.key] ?? ''}
                changed={(form.root[cfg.key] ?? '') !== (original.root[cfg.key] ?? '')}
                onChange={v => setRootField(cfg.key, v)}
              />
            ))}
          </FieldsGrid>

          <SectionTitle>Face fields</SectionTitle>
          <FaceTabs>
            {Array.from({ length: faceCount }, (_, i) => (
              <FaceTab
                key={i}
                type="button"
                active={activeFace === i}
                onClick={() => setActiveFace(i)}
              >
                Side {i + 1}
                {i >= original.faces.length ? ' (new)' : ''}
              </FaceTab>
            ))}
            <AddFaceButton
              type="button"
              onClick={() => {
                setForm(prev => addPendingFace(prev, card));
                setActiveFace(faceCount);
              }}
            >
              + Add Side
            </AddFaceButton>
          </FaceTabs>
          {isMulti && activeFace > 0 && (
            <SideNote>
              Some layouts (transform, MDFC, etc.) are controlled by tags. Add layout tags below if
              needed.
            </SideNote>
          )}
          <FieldsGrid>
            {FACE_FIELD_CONFIGS.filter(
              cfg =>
                (isMulti || cfg.key !== 'name') &&
                !cfg.shouldHide?.(card, activeFace, form.faces[activeFace] ?? {})
            ).map(cfg => (
              <FieldEditor
                key={`${activeFace}-${cfg.key}`}
                config={cfg}
                value={form.faces[activeFace]?.[cfg.key] ?? ''}
                changed={
                  (form.faces[activeFace]?.[cfg.key] ?? '') !==
                  (original.faces[activeFace]?.[cfg.key] ?? '')
                }
                onChange={v => setFaceField(activeFace, cfg.key, v)}
              />
            ))}
          </FieldsGrid>

          {hasChanges && (
            <ChangeSummary>
              <SummaryTitle>{changes.length} change(s) to submit</SummaryTitle>
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
};

function FieldEditor({
  config,
  value,
  changed,
  onChange,
}: {
  config: FieldConfig;
  value: string;
  changed: boolean;
  onChange: (value: string) => void;
}) {
  const [showExplanation, setShowExplanation] = useState(false);
  const fieldId = `field-${config.key}`;
  return (
    <FieldRow>
      <FormField orientation="vertical">
        <LabelRow>
          <Label htmlFor={fieldId}>{config.label}</Label>
          {config.explanation && (
            <HelpButton
              type="button"
              aria-label={`Explain ${config.label}`}
              aria-expanded={showExplanation}
              onClick={() => setShowExplanation(open => !open)}
            >
              ?
            </HelpButton>
          )}
        </LabelRow>
        {showExplanation && config.explanation && (
          <ExplanationText>{config.explanation}</ExplanationText>
        )}
        {config.type === 'textarea' ? (
          <StyledTextarea
            changed={changed}
            id={fieldId}
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={3}
          />
        ) : config.type === 'boolean' ? (
          <input
            type="checkbox"
            id={fieldId}
            checked={value === 'true'}
            onChange={e => onChange(e.target.checked ? 'true' : '')}
            style={changed ? { border: '1px solid #888', background: '#ffe' } : undefined}
          />
        ) : config.type === 'enum' && config.enumValues ? (
          <StyledSelect
            id={fieldId}
            value={value}
            onChange={e => onChange(e.target.value)}
            style={changed ? { border: '1px solid #888', background: '#ffe' } : undefined}
          >
            <option value="">(unset)</option>
            {config.enumValues.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </StyledSelect>
        ) : (
          <StyledInput
            changed={changed}
            id={fieldId}
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        )}
      </FormField>
    </FieldRow>
  );
}

const panelStyles = createStyles({ marginTop: 12, width: '100%' });
const Panel = createStyledDiv(panelStyles, 'Panel');

const panelHeaderStyles = createStyles({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
});
const PanelHeader = createStyledDiv(panelHeaderStyles, 'PanelHeader');

const panelTitleStyles = createStyles({ fontSize: 16, fontWeight: 600 });
const PanelTitle = createStyledSpan(panelTitleStyles, 'PanelTitle');

const sectionTitleStyles = createStyles({
  fontSize: 13,
  fontWeight: 600,
  marginTop: 12,
  marginBottom: 6,
});
const SectionTitle = createStyledDiv(sectionTitleStyles, 'SectionTitle');

const fieldsGridStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});
const FieldsGrid = createStyledDiv(fieldsGridStyles, 'FieldsGrid');

const fieldRowStyles = createStyles({ display: 'flex', flexDirection: 'column', gap: 2 });
const FieldRow = createStyledDiv(fieldRowStyles, 'FieldRow');

const labelRowStyles = createStyles({ display: 'flex', alignItems: 'center', gap: 4 });
const LabelRow = createStyledDiv(labelRowStyles, 'LabelRow');

const labelStyles = createStyles({ fontSize: 12, fontWeight: 600, color: '#555' });
const Label = createStyledLabel(labelStyles, 'Label');

const helpButtonStyles = createStyles({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 14,
  height: 14,
  padding: 0,
  border: '1px solid #aaa',
  borderRadius: '50%',
  background: '#f5f5f5',
  color: '#666',
  fontSize: 10,
  fontWeight: 700,
  lineHeight: 1,
  cursor: 'pointer',
  flexShrink: 0,
  '&:hover': { borderColor: '#666', color: '#333' },
});
const HelpButton = createStyledButton(helpButtonStyles, 'HelpButton');

const explanationTextStyles = createStyles({
  fontSize: 11,
  color: '#666',
  marginBottom: 2,
  lineHeight: 1.4,
});
const ExplanationText = createStyledDiv(explanationTextStyles, 'ExplanationText');

const inputStyles = {
  padding: '4px 8px',
  boxSizing: 'border-box' as const,
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
  modifiers: { changed: { true: { border: '1px solid #888', background: '#ffe' } } },
});
interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  changed?: boolean;
}
const StyledInput = createStenciledInput<InputProps>(inputStencil, 'StyledInput');

const selectStyles = createStyles(inputStyles);
const StyledSelect = createStyledSelect(selectStyles, 'StyledSelect');

const textAreaStencil = createStencil({
  vars: {},
  base: { ...inputStyles, resize: 'vertical' as const },
  modifiers: { changed: { true: { border: '1px solid #888', background: '#ffe' } } },
});
interface TextAreaProps extends React.ComponentPropsWithoutRef<'textarea'> {
  changed?: boolean;
}
const StyledTextarea = createStenciledTextArea<TextAreaProps>(textAreaStencil, 'StyledTextarea');

const changeSummaryStyles = createStyles({
  marginTop: 12,
  padding: '8px 10px',
  border: '1px solid #ccc',
});
const ChangeSummary = createStyledDiv(changeSummaryStyles, 'ChangeSummary');

const summaryTitleStyles = createStyles({ fontSize: 12, fontWeight: 600 });
const SummaryTitle = createStyledDiv(summaryTitleStyles, 'SummaryTitle');

const commentRowStyles = createStyles({
  marginTop: 10,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
});
const CommentRow = createStyledDiv(commentRowStyles, 'CommentRow');

const errorMsgStyles = createStyles({ color: '#c00', fontSize: 13, margin: '6px 0' });
const ErrorMsg = createStyledSubtext(errorMsgStyles, 'ErrorMsg');

const successMessageStyles = createStyles({ margin: 0 });
const SuccessMessage = createStyledSubtext(successMessageStyles, 'SuccessMessage');

const actionRowStyles = createStyles({ display: 'flex', gap: 8, marginTop: 12 });
const ActionRow = createStyledDiv(actionRowStyles, 'ActionRow');

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
const SubmitButton = createStyledButton(submitButtonStyles, 'SubmitButton');

const cancelButtonStyles = createStyles({
  padding: '4px 14px',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 13,
  cursor: 'pointer',
  background: '#fff',
  '&:hover': { borderColor: '#888' },
});
const CancelButton = createStyledButton(cancelButtonStyles, 'CancelButton');

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
const CloseButton = createStyledButton(closeButtonStyles, 'CloseButton');

const faceTabsStyles = createStyles({ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 });
const FaceTabs = createStyledDiv(faceTabsStyles, 'FaceTabs');

const faceTabStencil = createStencil({
  vars: {},
  base: {
    padding: '2px 10px',
    fontSize: 12,
    border: '1px solid #ccc',
    borderRadius: 2,
    background: '#fff',
    cursor: 'pointer',
  },
  modifiers: {
    active: {
      true: { background: '#C690FF', borderColor: '#888' },
    },
  },
});
interface FaceTabProps extends React.ComponentPropsWithoutRef<'button'> {
  active?: boolean;
}
const FaceTab = createStenciledButton<FaceTabProps>(faceTabStencil, 'FaceTab');

const addFaceButtonStyles = createStyles({
  padding: '2px 10px',
  fontSize: 12,
  border: '1px dashed #888',
  borderRadius: 2,
  background: '#fafafa',
  cursor: 'pointer',
});
const AddFaceButton = createStyledButton(addFaceButtonStyles, 'AddFaceButton');

const sideNoteStyles = createStyles({
  fontSize: 11,
  color: '#666',
  marginBottom: 8,
  fontStyle: 'italic',
});
const SideNote = createStyledDiv(sideNoteStyles, 'SideNote');
