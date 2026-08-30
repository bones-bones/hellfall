import { useState, useCallback, useMemo } from 'react';
import { Card } from '@workday/canvas-kit-react/card';
import { FormField } from '@workday/canvas-kit-react/form-field';
import {
  HCCard,
  HCFormat,
  HCLegality,
  HCLegalitiesField,
  formatList,
  isLegalitiesField,
} from '@hellfall/shared/types';
import { useAuth } from '../../../auth/index.ts';
import { getAuthApiUrl } from '../../../auth/getAuthApiUrl.ts';
import { createStyles, createStencil } from '@workday/canvas-kit-styling';
import {
  createStenciledInput,
  createStenciledTextArea,
  createStenciledButton,
  createStenciledDiv,
  createStyledButton,
  createStyledDiv,
  createStyledLabel,
  createStyledSelect,
  createStyledSpan,
  createStyledSubtext,
} from '../../../styling';
import {
  DEFAULT_LEGALITIES,
  LEGALITY_FORMAT_LABELS,
  ROOT_FIELD_CONFIGS,
  buildEditFormState,
  buildChangesFromForm,
  sumFaceColors,
} from './cardEditFields.ts';
import { useSyncPendingChangesets } from '../../hooks/usePendingChangesets.ts';
import { EditFormState, FieldConfig, groupFieldConfigs } from './types.ts';
import { addPendingFace } from './faces/addPendingFace.ts';
import { FACE_FIELD_CONFIGS } from './constants.ts';
import { getInvalidFields, isFieldValueInvalid } from './fieldValidation.ts';
import { ImageUploadControl, type ImageTarget } from './ImageUploadControl.tsx';
import { parseFieldValue } from './parseFieldValue.ts';
import { semiSplit } from '@hellfall/shared/utils';

const IMAGE_URL_KEYS = new Set<ImageTarget['imageProp']>([
  'image',
  'still_image',
  'rotated_image',
  'print_image',
  'still_print_image',
  'rotated_print_image',
]);

const COLLAPSED_NAME_KEYS = new Set(['flavor_name', 'export_name']);

function isImageUrlKey(key: string): key is ImageTarget['imageProp'] {
  return IMAGE_URL_KEYS.has(key as ImageTarget['imageProp']);
}

function partitionCollapsedNameFields(fields: FieldConfig[]): {
  main: FieldConfig[];
  collapsed: FieldConfig[];
} {
  const main: FieldConfig[] = [];
  const collapsed: FieldConfig[] = [];
  for (const cfg of fields) {
    if (COLLAPSED_NAME_KEYS.has(cfg.key)) collapsed.push(cfg);
    else main.push(cfg);
  }
  return { main, collapsed };
}

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
  const faceCount = form.faces.length;
  const isMulti = 'card_faces' in card || form.faces.length > original.faces.length;
  const invalidFields = useMemo(() => getInvalidFields(card, form, isMulti), [card, form, isMulti]);
  const canSubmit = hasChanges && invalidFields.length === 0;

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

  return (
    <Panel>
      <Card>
        <Card.Body>
          <PanelHeader>
            <PanelTitle>Edit Card</PanelTitle>
            <CloseButton onClick={onClose}>&times;</CloseButton>
          </PanelHeader>

          <SectionTitle>Card-level fields</SectionTitle>
          <RootFields
            cardId={card.id}
            form={form}
            original={original}
            setRootField={setRootField}
          />

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
          <FacePanel>
            {isMulti && activeFace > 0 && (
              <SideNote>
                Some layouts (transform, MDFC, etc.) are controlled by tags. Add layout tags below
                if needed.
              </SideNote>
            )}
            {groupFieldConfigs(FACE_FIELD_CONFIGS).map(group => {
              const visibleFields = group.fields.filter(
                cfg =>
                  (isMulti || cfg.key !== 'name') &&
                  !cfg.shouldHide?.(card, activeFace, form.faces[activeFace] ?? {})
              );
              if (visibleFields.length === 0) return null;
              const { main, collapsed } = partitionCollapsedNameFields(visibleFields);
              return (
                <div key={group.label ?? 'default'}>
                  {group.label && <SubSectionTitle>{group.label}</SubSectionTitle>}
                  <FieldsGrid>
                    {main.map(cfg => (
                      <FieldEditor
                        key={`${activeFace}-${cfg.key}`}
                        config={cfg}
                        value={form.faces[activeFace]?.[cfg.key] ?? ''}
                        changed={
                          (form.faces[activeFace]?.[cfg.key] ?? '') !==
                          (original.faces[activeFace]?.[cfg.key] ?? '')
                        }
                        invalid={isFieldValueInvalid(cfg, form.faces[activeFace]?.[cfg.key] ?? '')}
                        cardId={card.id}
                        faceIndex={activeFace}
                        rootImageUrl={form.root.image ?? ''}
                        onChange={v => setFaceField(activeFace, cfg.key, v)}
                      />
                    ))}
                    <CollapsibleNameFields
                      fields={collapsed}
                      values={form.faces[activeFace] ?? {}}
                      originals={original.faces[activeFace] ?? {}}
                      cardId={card.id}
                      faceIndex={activeFace}
                      rootImageUrl={form.root.image ?? ''}
                      onChange={(key, v) => setFaceField(activeFace, key, v)}
                    />
                  </FieldsGrid>
                </div>
              );
            })}
          </FacePanel>

          {hasChanges && invalidFields.length > 0 && (
            <ValidationSummary>
              <SummaryTitle>Fix before submitting</SummaryTitle>
              {invalidFields.map(({ scope, faceIndex, config, message }) => (
                <ValidationItem key={`${scope}-${faceIndex ?? 'root'}-${config.key}`}>
                  {scope === 'face' ? `Side ${faceIndex! + 1}: ${config.label}` : config.label}
                  {message !== 'Required' ? ` — ${message}` : ' (required)'}
                </ValidationItem>
              ))}
            </ValidationSummary>
          )}
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
            <SubmitButton disabled={!canSubmit || submitting} onClick={handleSubmit}>
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </SubmitButton>
            <CancelButton onClick={onClose}>Cancel</CancelButton>
          </ActionRow>
        </Card.Body>
      </Card>
    </Panel>
  );
};

function RootFields({
  cardId,
  form,
  original,
  setRootField,
}: {
  cardId: string;
  form: EditFormState;
  original: EditFormState;
  setRootField: (key: string, value: string) => void;
}) {
  const { main, collapsed } = partitionCollapsedNameFields(ROOT_FIELD_CONFIGS);
  const derivedColors = sumFaceColors(form.faces);
  return (
    <FieldsGrid>
      {main.map(cfg => {
        const value = cfg.key === 'colors' ? derivedColors : form.root[cfg.key] ?? '';
        const originalValue = original.root[cfg.key] ?? '';
        const changed = value !== originalValue;
        return (
          <FieldEditor
            key={cfg.key}
            config={cfg}
            value={value}
            changed={changed}
            invalid={isFieldValueInvalid(cfg, value)}
            cardId={cardId}
            onChange={v => setRootField(cfg.key, v)}
          />
        );
      })}
      <CollapsibleNameFields
        fields={collapsed}
        values={form.root}
        originals={original.root}
        cardId={cardId}
        onChange={(key, v) => setRootField(key, v)}
      />
    </FieldsGrid>
  );
}

function CollapsibleNameFields({
  fields,
  values,
  originals,
  cardId,
  faceIndex,
  rootImageUrl,
  onChange,
}: {
  fields: FieldConfig[];
  values: Record<string, string>;
  originals: Record<string, string>;
  cardId: string;
  faceIndex?: number;
  rootImageUrl?: string;
  onChange: (key: string, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  if (fields.length === 0) return null;
  const hasValues = fields.some(cfg => (values[cfg.key] ?? '').trim() !== '');
  return (
    <CollapsedBlock>
      <CollapseToggle
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(open => !open)}
      >
        {expanded ? '▾' : '▸'} Flavor & Export name
        {!expanded && hasValues ? ' (set)' : ''}
      </CollapseToggle>
      {expanded &&
        fields.map(cfg => (
          <FieldEditor
            key={cfg.key}
            config={cfg}
            value={values[cfg.key] ?? ''}
            changed={(values[cfg.key] ?? '') !== (originals[cfg.key] ?? '')}
            invalid={isFieldValueInvalid(cfg, values[cfg.key] ?? '')}
            cardId={cardId}
            faceIndex={faceIndex}
            rootImageUrl={rootImageUrl}
            onChange={v => onChange(cfg.key, v)}
          />
        ))}
    </CollapsedBlock>
  );
}

function MultiEnumEditor({
  id,
  options,
  value,
  changed,
  invalid,
  disabled,
  onChange,
}: {
  id: string;
  options: readonly string[];
  value: string;
  changed: boolean;
  invalid: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const selected = useMemo(() => semiSplit(value), [value]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggle = (option: string) => {
    if (disabled) return;
    const next = selectedSet.has(option)
      ? selected.filter(v => v !== option)
      : [...selected, option];
    onChange(next.join(';'));
  };

  return (
    <MultiEnumBox
      id={id}
      role="group"
      changed={changed}
      invalid={invalid}
      aria-disabled={disabled || undefined}
    >
      {options.map(option => (
        <MultiEnumOption key={option}>
          <input
            type="checkbox"
            checked={selectedSet.has(option)}
            disabled={disabled}
            onChange={() => toggle(option)}
          />
          <span>{option}</span>
        </MultiEnumOption>
      ))}
    </MultiEnumBox>
  );
}

function LegalitiesEditor({
  id,
  value,
  changed,
  invalid,
  disabled,
  legalityValues,
  onChange,
}: {
  id: string;
  value: string;
  changed: boolean;
  invalid: boolean;
  disabled?: boolean;
  legalityValues: readonly string[];
  onChange: (value: string) => void;
}) {
  const legalities = useMemo((): HCLegalitiesField => {
    const parsed = parseFieldValue(value, 'legalities');
    return isLegalitiesField(parsed) ? parsed : DEFAULT_LEGALITIES;
  }, [value]);

  const setFormat = (format: HCFormat, legality: HCLegality) => {
    if (disabled) return;
    const next = Object.fromEntries(
      formatList.map(f => [f, f === format ? legality : legalities[f]])
    ) as HCLegalitiesField;
    onChange(JSON.stringify(next));
  };

  return (
    <LegalitiesBox
      id={id}
      role="group"
      changed={changed}
      invalid={invalid}
      aria-disabled={disabled || undefined}
    >
      {formatList.map(format => (
        <LegalityRow key={format}>
          <LegalityLabel htmlFor={`${id}-${format}`}>
            {LEGALITY_FORMAT_LABELS[format]}
          </LegalityLabel>
          <StyledSelect
            id={`${id}-${format}`}
            value={legalities[format]}
            disabled={disabled}
            onChange={e => setFormat(format, e.target.value as HCLegality)}
          >
            {legalityValues.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </StyledSelect>
        </LegalityRow>
      ))}
    </LegalitiesBox>
  );
}

function FieldEditor({
  config,
  value,
  changed,
  invalid = false,
  cardId,
  faceIndex,
  rootImageUrl,
  onChange,
}: {
  config: FieldConfig;
  value: string;
  changed: boolean;
  invalid?: boolean;
  cardId?: string;
  faceIndex?: number;
  /** Card-level image URL; used to lock side-1 image when it matches. */
  rootImageUrl?: string;
  onChange: (value: string) => void;
}) {
  const [showExplanation, setShowExplanation] = useState(false);
  const fieldId = `field-${config.key}`;
  const isReadOnly = config.readOnly === true;
  // Side 1 image sharing the card URL is managed via the card-level Image URL upload.
  const side1SharesCardImage =
    faceIndex === 0 && config.key === 'image' && !!rootImageUrl && value === rootImageUrl;
  const canUpload =
    !!cardId &&
    isImageUrlKey(config.key) &&
    value.includes('storage.googleapis.com') &&
    !side1SharesCardImage;
  return (
    <FieldRow>
      <FormField orientation="vertical">
        <LabelRow>
          <Label htmlFor={fieldId}>
            {config.label}
            {config.required && <RequiredMark aria-hidden="true"> *</RequiredMark>}
          </Label>
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
            invalid={invalid}
            id={fieldId}
            value={value}
            readOnly={isReadOnly}
            required={config.required}
            onChange={e => onChange(e.target.value)}
            rows={3}
          />
        ) : config.type === 'boolean' ? (
          <input
            type="checkbox"
            id={fieldId}
            checked={value === 'true'}
            disabled={isReadOnly}
            required={config.required}
            onChange={e => onChange(e.target.checked ? 'true' : '')}
            style={
              changed
                ? { border: '1px solid #888', background: '#ffe' }
                : invalid
                ? { outline: '1px solid #c00' }
                : undefined
            }
          />
        ) : config.type === 'enum' && config.enumValues ? (
          <StyledSelect
            id={fieldId}
            value={value}
            disabled={isReadOnly}
            required={config.required}
            onChange={e => onChange(e.target.value)}
            style={
              changed
                ? { border: '1px solid #888', background: '#ffe' }
                : invalid
                ? { border: '1px solid #c00' }
                : undefined
            }
          >
            <option value="">(unset)</option>
            {config.enumValues.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </StyledSelect>
        ) : config.type === 'multi-enum' && config.enumValues ? (
          <MultiEnumEditor
            id={fieldId}
            options={config.enumValues}
            value={value}
            changed={changed}
            invalid={invalid}
            disabled={isReadOnly}
            onChange={onChange}
          />
        ) : config.type === 'legalities' && config.enumValues ? (
          <LegalitiesEditor
            id={fieldId}
            value={value}
            changed={changed}
            invalid={invalid}
            disabled={isReadOnly}
            legalityValues={config.enumValues}
            onChange={onChange}
          />
        ) : (
          <StyledInput
            changed={changed}
            invalid={invalid}
            id={fieldId}
            value={value}
            readOnly={isReadOnly}
            required={config.required}
            onChange={e => onChange(e.target.value)}
          />
        )}
        {canUpload && isImageUrlKey(config.key) && (
          <ImageUploadControl
            cardId={cardId}
            compact
            target={{
              label: config.label,
              faceIndex,
              imageProp: config.key,
            }}
            onReplaced={() => {
              /* GCS object replaced in place; URL field stays read-only. */
            }}
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

const subSectionTitleStyles = createStyles({
  fontSize: 12,
  fontWeight: 600,
  marginTop: 10,
  marginBottom: 4,
  color: '#666',
});
const SubSectionTitle = createStyledDiv(subSectionTitleStyles, 'SubSectionTitle');

const fieldsGridStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});
const FieldsGrid = createStyledDiv(fieldsGridStyles, 'FieldsGrid');

const collapsedBlockStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});
const CollapsedBlock = createStyledDiv(collapsedBlockStyles, 'CollapsedBlock');

const collapseToggleStyles = createStyles({
  alignSelf: 'flex-start',
  padding: 0,
  border: 'none',
  background: 'transparent',
  color: '#666',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  '&:hover': { color: '#333' },
});
const CollapseToggle = createStyledButton(collapseToggleStyles, 'CollapseToggle');

const fieldRowStyles = createStyles({ display: 'flex', flexDirection: 'column', gap: 2 });
const FieldRow = createStyledDiv(fieldRowStyles, 'FieldRow');

const labelRowStyles = createStyles({ display: 'flex', alignItems: 'center', gap: 4 });
const LabelRow = createStyledDiv(labelRowStyles, 'LabelRow');

const labelStyles = createStyles({ fontSize: 12, fontWeight: 600, color: '#555' });
const Label = createStyledLabel(labelStyles, 'Label');

const requiredMarkStyles = createStyles({ color: '#c00' });
const RequiredMark = createStyledSpan(requiredMarkStyles, 'RequiredMark');

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
  modifiers: {
    changed: { true: { border: '1px solid #888', background: '#ffe' } },
    invalid: { true: { border: '1px solid #c00' } },
  },
});
interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  changed?: boolean;
  invalid?: boolean;
}
const StyledInput = createStenciledInput<InputProps>(inputStencil, 'StyledInput');

const selectStyles = createStyles(inputStyles);
const StyledSelect = createStyledSelect(selectStyles, 'StyledSelect');

const textAreaStencil = createStencil({
  vars: {},
  base: { ...inputStyles, resize: 'vertical' as const },
  modifiers: {
    changed: { true: { border: '1px solid #888', background: '#ffe' } },
    invalid: { true: { border: '1px solid #c00' } },
  },
});
interface TextAreaProps extends React.ComponentPropsWithoutRef<'textarea'> {
  changed?: boolean;
  invalid?: boolean;
}
const StyledTextarea = createStenciledTextArea<TextAreaProps>(textAreaStencil, 'StyledTextarea');

const multiEnumBoxStencil = createStencil({
  vars: {},
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px 10px',
    padding: '6px 8px',
    border: '1px solid #ccc',
    borderRadius: 2,
    background: '#fff',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  modifiers: {
    changed: { true: { border: '1px solid #888', background: '#ffe' } },
    invalid: { true: { border: '1px solid #c00' } },
  },
});
interface MultiEnumBoxProps extends React.ComponentPropsWithoutRef<'div'> {
  changed?: boolean;
  invalid?: boolean;
}
const MultiEnumBox = createStenciledDiv<MultiEnumBoxProps>(multiEnumBoxStencil, 'MultiEnumBox');

const multiEnumOptionStyles = createStyles({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 13,
  whiteSpace: 'nowrap',
});
const MultiEnumOption = createStyledLabel(multiEnumOptionStyles, 'MultiEnumOption');

const legalitiesBoxStencil = createStencil({
  vars: {},
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '6px 8px',
    border: '1px solid #ccc',
    borderRadius: 2,
    background: '#fff',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  modifiers: {
    changed: { true: { border: '1px solid #888', background: '#ffe' } },
    invalid: { true: { border: '1px solid #c00' } },
  },
});
interface LegalitiesBoxProps extends React.ComponentPropsWithoutRef<'div'> {
  changed?: boolean;
  invalid?: boolean;
}
const LegalitiesBox = createStenciledDiv<LegalitiesBoxProps>(legalitiesBoxStencil, 'LegalitiesBox');

const legalityRowStyles = createStyles({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});
const LegalityRow = createStyledDiv(legalityRowStyles, 'LegalityRow');

const legalityLabelStyles = createStyles({
  fontSize: 12,
  fontWeight: 600,
  color: '#555',
  minWidth: 96,
  flexShrink: 0,
});
const LegalityLabel = createStyledLabel(legalityLabelStyles, 'LegalityLabel');

const changeSummaryStyles = createStyles({
  marginTop: 12,
  padding: '8px 10px',
  border: '1px solid #ccc',
});
const ChangeSummary = createStyledDiv(changeSummaryStyles, 'ChangeSummary');

const validationSummaryStyles = createStyles({
  marginTop: 12,
  padding: '8px 10px',
  border: '1px solid #c00',
  background: '#fff5f5',
});
const ValidationSummary = createStyledDiv(validationSummaryStyles, 'ValidationSummary');

const validationItemStyles = createStyles({ fontSize: 12, color: '#900' });
const ValidationItem = createStyledDiv(validationItemStyles, 'ValidationItem');

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

const facePanelStyles = createStyles({
  border: '1px solid #ccc',
  borderRadius: 2,
  padding: '10px 12px',
  marginTop: 4,
});
const FacePanel = createStyledDiv(facePanelStyles, 'FacePanel');

const sideNoteStyles = createStyles({
  fontSize: 11,
  color: '#666',
  marginBottom: 8,
  fontStyle: 'italic',
});
const SideNote = createStyledDiv(sideNoteStyles, 'SideNote');
