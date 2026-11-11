import { useState, useCallback, useMemo } from 'react';
import { Card } from '@workday/canvas-kit-react/card';
import { FormField } from '@workday/canvas-kit-react/form-field';
import {
  HCCard,
  HCFormat,
  HCLegality,
  HCLegalitiesField,
  HCRelatedCard,
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
  buildCardFromCreateForm,
  buildEditFormState,
  buildChangesFromForm,
  createFormMissingRequired,
  sumFaceColors,
} from './cardEditFields.ts';
import { useSyncPendingChangesets } from '../../hooks/usePendingChangesets.ts';
import { EditFormState, FieldConfig, groupFieldConfigs } from './types.ts';
import { addPendingFace } from './faces/addPendingFace.ts';
import { FACE_FIELD_CONFIGS } from './constants.ts';
import { getInvalidFields, isFieldValueInvalid } from './fieldValidation.ts';
import { ImageUploadControl, type ImageTarget } from './ImageUploadControl.tsx';
import { RelatedPartsEditor } from './RelatedPartsEditor.tsx';
import { parseFieldValue } from './parseFieldValue.ts';
import { createCardDocumentChange, semiSplit } from '@hellfall/shared/utils';

const IMAGE_URL_KEYS = new Set<ImageTarget['imageProp']>([
  'image',
  'still_image',
  'rotated_image',
  'print_image',
  'still_print_image',
  'rotated_print_image',
]);

const COLLAPSED_NAME_KEYS = new Set(['flavor_name', 'export_name']);

const ORACLE_TEXT_CHARS = [
  { char: '—', label: 'em dash' },
  { char: '•', label: 'bullet' },
] as const;

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
  mode = 'edit',
  hcid,
  onHcidChange,
  hideChrome = false,
}: {
  card: HCCard.Any;
  onClose: () => void;
  onSubmitted?: () => void;
  mode?: 'edit' | 'create';
  /** Create-only: optional HCID override (defaults to name). */
  hcid?: string;
  onHcidChange?: (value: string) => void;
  /** When true, omit the floating edit chrome (used inside Add Card page). */
  hideChrome?: boolean;
}) => {
  const isCreate = mode === 'create';
  const { user } = useAuth();
  const baseUrl = getAuthApiUrl();
  const reloadPendingChangesets = useSyncPendingChangesets(isCreate ? undefined : card.id);
  const original = useMemo(() => buildEditFormState(card), [card]);
  const [form, setForm] = useState<EditFormState>(() => structuredClone(original));
  const [activeFace, setActiveFace] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const changes = useMemo(() => buildChangesFromForm(card, original, form), [card, original, form]);
  const hasChanges = changes.length > 0 || (isCreate && Boolean(form.root.image?.trim()));
  const faceCount = form.faces.length;
  const isMulti = 'card_faces' in card || form.faces.length > original.faces.length;
  const invalidFields = useMemo(() => getInvalidFields(card, form, isMulti), [card, form, isMulti]);
  const createMissing = isCreate ? createFormMissingRequired(form, card.kind) : null;
  const canSubmit = isCreate
    ? !createMissing && invalidFields.length === 0
    : hasChanges && invalidFields.length === 0;

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

  const setAllParts = useCallback((all_parts: HCRelatedCard[]) => {
    setForm(prev => ({ ...prev, all_parts }));
  }, []);

  const handleSubmit = async () => {
    if (!baseUrl || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const body = isCreate
        ? {
            cardId: card.id,
            changes: [
              createCardDocumentChange(
                'add',
                buildCardFromCreateForm(card, original, form, { hcid })
              ),
            ],
            comment: comment.trim() || undefined,
          }
        : {
            cardId: card.id,
            changes,
            comment: comment.trim() || undefined,
          };
      const res = await fetch(`${baseUrl}/api/changesets`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.reason || `Error ${res.status}`);
      }
      setSuccess(true);
      if (!isCreate) {
        await reloadPendingChangesets();
      }
      onSubmitted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!baseUrl || isCreate) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`${baseUrl}/api/changesets`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card.id,
          changes: [createCardDocumentChange('delete')],
          comment: comment.trim() || `Delete ${card.name}`,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.reason || `Error ${res.status}`);
      }
      setConfirmingDelete(false);
      setSuccess(true);
      await reloadPendingChangesets();
      onSubmitted?.();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to submit delete');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  if (success) {
    return (
      <Panel>
        <Card>
          <Card.Body>
            <SuccessMessage size="small">
              {isCreate ? 'New card submitted for review.' : 'Change submitted for review.'}
            </SuccessMessage>
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
          {!hideChrome && (
            <PanelHeader>
              <PanelTitle>{isCreate ? 'New Card' : 'Edit Card'}</PanelTitle>
              <CloseButton onClick={onClose}>&times;</CloseButton>
            </PanelHeader>
          )}

          {isCreate && (
            <>
              <Hint>
                Fill in the card fields below. Submitting creates a pending changeset for approval.
              </Hint>
              <FormField orientation="vertical">
                <Label>HCID (optional)</Label>
                <StyledInput
                  value={hcid ?? ''}
                  onChange={e => onHcidChange?.(e.target.value)}
                  placeholder="defaults to name"
                />
              </FormField>
            </>
          )}

          <SectionTitle>Card-level fields</SectionTitle>
          <RootFields
            cardId={card.id}
            form={form}
            original={original}
            setRootField={setRootField}
            editableImages={isCreate}
            allowInitialUpload={isCreate}
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
                        cardName={form.root.name ?? ''}
                        editableImages={isCreate}
                        allowInitialUpload={isCreate}
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
                      cardName={form.root.name ?? ''}
                      editableImages={isCreate}
                      allowInitialUpload={isCreate}
                      onChange={(key, v) => setFaceField(activeFace, key, v)}
                    />
                  </FieldsGrid>
                </div>
              );
            })}
          </FacePanel>

          <SectionTitle>Related cards & tokens</SectionTitle>
          <RelatedPartsEditor
            card={card}
            parts={form.all_parts}
            originalParts={original.all_parts}
            onChange={setAllParts}
          />

          {(hasChanges || isCreate) && invalidFields.length > 0 && (
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
          {isCreate && createMissing && (
            <ValidationSummary>
              <SummaryTitle>Required for new cards</SummaryTitle>
              <ValidationItem>{createMissing}</ValidationItem>
            </ValidationSummary>
          )}
          {!isCreate && hasChanges && (
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
                placeholder={isCreate ? 'Describe the new card...' : 'Describe your change...'}
              />
            </FormField>
          </CommentRow>
          {error && <ErrorMsg size="small">{error}</ErrorMsg>}
          <ActionRow>
            <SubmitButton disabled={!canSubmit || submitting || deleting} onClick={handleSubmit}>
              {submitting
                ? 'Submitting...'
                : isCreate
                ? 'Submit for approval'
                : 'Submit for Review'}
            </SubmitButton>
            <CancelButton onClick={onClose} disabled={submitting || deleting}>
              Cancel
            </CancelButton>
          </ActionRow>

          {!isCreate && (
            <DangerZone>
              <DangerTitle>Delete card</DangerTitle>
              <DangerHint>
                Proposes deleting this card. An approver must accept before it is removed.
              </DangerHint>
              {!confirmingDelete ? (
                <ProposeDeleteButton
                  type="button"
                  disabled={submitting || deleting}
                  onClick={() => setConfirmingDelete(true)}
                >
                  Propose Delete
                </ProposeDeleteButton>
              ) : (
                <ConfirmDeleteRow>
                  <ConfirmDeleteText>Submit delete for approval?</ConfirmDeleteText>
                  <ConfirmDeleteButton
                    type="button"
                    disabled={deleting || submitting}
                    onClick={handleDelete}
                  >
                    {deleting ? 'Submitting…' : 'Confirm delete'}
                  </ConfirmDeleteButton>
                  <CancelDeleteButton
                    type="button"
                    disabled={deleting}
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Back
                  </CancelDeleteButton>
                </ConfirmDeleteRow>
              )}
              {deleteError && <ErrorMsg size="small">{deleteError}</ErrorMsg>}
            </DangerZone>
          )}
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
  editableImages = false,
  allowInitialUpload = false,
}: {
  cardId?: string;
  form: EditFormState;
  original: EditFormState;
  setRootField: (key: string, value: string) => void;
  editableImages?: boolean;
  allowInitialUpload?: boolean;
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
            cardName={form.root.name ?? ''}
            editableImages={editableImages}
            allowInitialUpload={allowInitialUpload}
            onChange={v => setRootField(cfg.key, v)}
          />
        );
      })}
      <CollapsibleNameFields
        fields={collapsed}
        values={form.root}
        originals={original.root}
        cardId={cardId}
        cardName={form.root.name ?? ''}
        editableImages={editableImages}
        allowInitialUpload={allowInitialUpload}
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
  cardName,
  editableImages = false,
  allowInitialUpload = false,
  onChange,
}: {
  fields: FieldConfig[];
  values: Record<string, string>;
  originals: Record<string, string>;
  cardId?: string;
  faceIndex?: number;
  rootImageUrl?: string;
  cardName?: string;
  editableImages?: boolean;
  allowInitialUpload?: boolean;
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
            cardName={cardName}
            editableImages={editableImages}
            allowInitialUpload={allowInitialUpload}
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
  cardName,
  editableImages = false,
  allowInitialUpload = false,
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
  cardName?: string;
  /** Create mode: allow typing image URL fields that are normally upload-only. */
  editableImages?: boolean;
  /** Create mode: show upload even when no GCS URL exists yet. */
  allowInitialUpload?: boolean;
  onChange: (value: string) => void;
}) {
  const [showExplanation, setShowExplanation] = useState(false);
  const fieldId = `field-${config.key}`;
  const isImageField = isImageUrlKey(config.key);
  const isReadOnly = config.readOnly === true && !(editableImages && isImageField);
  // Side 1 image sharing the card URL is managed via the card-level Image URL upload.
  const side1SharesCardImage =
    faceIndex === 0 && config.key === 'image' && !!rootImageUrl && value === rootImageUrl;
  const canUpload =
    !!cardId &&
    isImageField &&
    !side1SharesCardImage &&
    (allowInitialUpload || value.includes('storage.googleapis.com'));
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
          {config.key === 'oracle_text' && (
            <OracleCharHelpers>
              {ORACLE_TEXT_CHARS.map(({ char, label }) => (
                <OracleCharButton
                  key={char}
                  type="button"
                  title={`Copy ${label}`}
                  aria-label={`Copy ${label}`}
                  onClick={() => {
                    void navigator.clipboard.writeText(char);
                  }}
                >
                  {char}
                </OracleCharButton>
              ))}
            </OracleCharHelpers>
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
        {canUpload && isImageField && (
          <ImageUploadControl
            cardId={cardId}
            compact
            cardName={cardName || undefined}
            persistCanonicalUrl={allowInitialUpload}
            target={{
              label: config.label,
              faceIndex,
              imageProp: config.key as ImageTarget['imageProp'],
            }}
            onReplaced={url => {
              if (allowInitialUpload) {
                onChange(url);
                return;
              }
              /* Edit: GCS object replaced in place; URL field stays read-only. */
            }}
          />
        )}
      </FormField>
    </FieldRow>
  );
}

const panelStyles = createStyles({ marginTop: 12, width: '100%' });
const Panel = createStyledDiv(panelStyles, 'Panel');

const hintStyles = createStyles({
  color: '#555',
  fontSize: 13,
  marginBottom: 12,
});
const Hint = createStyledDiv(hintStyles, 'CreateCardHint');

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

const oracleCharHelpersStyles = createStyles({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  marginLeft: 'auto',
});
const OracleCharHelpers = createStyledDiv(oracleCharHelpersStyles, 'OracleCharHelpers');

const oracleCharButtonStyles = createStyles({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 22,
  height: 22,
  padding: '0 6px',
  border: '1px solid #ccc',
  borderRadius: 2,
  background: '#fafafa',
  color: '#333',
  fontSize: 14,
  lineHeight: 1,
  cursor: 'pointer',
  userSelect: 'all',
  '&:hover': { borderColor: '#888', background: '#f0f0f0' },
});
const OracleCharButton = createStyledButton(oracleCharButtonStyles, 'OracleCharButton');

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
  '&:disabled': { opacity: 0.4, cursor: 'default' },
});
const CancelButton = createStyledButton(cancelButtonStyles, 'CancelButton');

const dangerZoneStyles = createStyles({
  marginTop: 24,
  paddingTop: 16,
  borderTop: '1px solid #f0c0c0',
});
const DangerZone = createStyledDiv(dangerZoneStyles, 'DangerZone');

const dangerTitleStyles = createStyles({
  fontSize: 13,
  fontWeight: 600,
  color: '#a11',
  marginBottom: 4,
});
const DangerTitle = createStyledDiv(dangerTitleStyles, 'DangerTitle');

const dangerHintStyles = createStyles({
  fontSize: 12,
  color: '#666',
  marginBottom: 8,
});
const DangerHint = createStyledDiv(dangerHintStyles, 'DangerHint');

const proposeDeleteButtonStyles = createStyles({
  padding: '4px 12px',
  border: '1px solid #dc3545',
  color: '#dc3545',
  borderRadius: 2,
  fontSize: 12,
  cursor: 'pointer',
  background: '#fff',
  '&:hover:not(:disabled)': { background: '#fff5f5' },
  '&:disabled': { opacity: 0.4, cursor: 'default' },
});
const ProposeDeleteButton = createStyledButton(proposeDeleteButtonStyles, 'ProposeDeleteButton');

const confirmDeleteRowStyles = createStyles({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  alignItems: 'center',
});
const ConfirmDeleteRow = createStyledDiv(confirmDeleteRowStyles, 'ConfirmDeleteRow');

const confirmDeleteTextStyles = createStyles({
  fontSize: 12,
  color: '#555',
});
const ConfirmDeleteText = createStyledSpan(confirmDeleteTextStyles, 'ConfirmDeleteText');

const confirmDeleteButtonStyles = createStyles({
  padding: '4px 12px',
  border: 'none',
  borderRadius: 2,
  fontSize: 12,
  cursor: 'pointer',
  background: '#dc3545',
  color: '#fff',
  '&:disabled': { opacity: 0.5, cursor: 'default' },
});
const ConfirmDeleteButton = createStyledButton(confirmDeleteButtonStyles, 'ConfirmDeleteButton');

const cancelDeleteButtonStyles = createStyles({
  padding: '4px 12px',
  border: '1px solid #ccc',
  borderRadius: 2,
  fontSize: 12,
  cursor: 'pointer',
  background: '#fff',
  '&:disabled': { opacity: 0.4, cursor: 'default' },
});
const CancelDeleteButton = createStyledButton(cancelDeleteButtonStyles, 'CancelDeleteButton');

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
