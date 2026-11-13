import {
  HCBorderColor,
  HCCard,
  HCCardFace,
  HCColor,
  HCColors,
  HCFinish,
  HCFrame,
  HCImageStatus,
  HCKind,
  HCLayout,
  HCLegality,
  HCLegalitiesField,
  HCRarity,
  HCObject,
  HCRelatedCard,
  formatList,
  isLegalitiesField,
  relatedComponent,
  relatedComponentList,
} from '@hellfall/shared/types';
import {
  anyChange,
  applyChanges,
  cardToRelatedCard,
  createAllPartsChange,
  createCardFacesChange,
  createFaceChange,
  createRootChange,
  faceChangeablePropType,
  getBaseDiffs,
  getDefaultFaceLayout,
  isFaceArrayPropType,
  isRootArrayPropType,
  orderColors,
  rootChangeablePropType,
  rootChangeableProps,
  setDerivedProps,
  toFaces,
} from '@hellfall/shared/utils';
import { pushFaceScalarChange } from './faces';
import type { EditFormState, FieldConfig, FieldType } from './types';
import { isFaceChangeable } from './faces/isFaceChangeable';
import { isFaceDeletable } from './faces/isFaceDeleteable';
import { parseFieldValue } from './parseFieldValue';
import { FACE_FIELDS } from './constants';

export const ROOT_FIELD_CONFIGS: FieldConfig[] = [
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'flavor_name', label: 'Flavor Name', type: 'string' },
  { key: 'export_name', label: 'Export Name', type: 'string' },
  { key: 'set', label: 'Set', type: 'string' },
  { key: 'accepted_order', label: 'Accepted #', type: 'string' },
  { key: 'rarity', label: 'Rarity', type: 'enum', enumValues: Object.values(HCRarity) },
  { key: 'layout', label: 'Layout', type: 'enum', enumValues: Object.values(HCLayout) },
  { key: 'mana_value', label: 'Mana Value', type: 'number' },
  {
    key: 'colors',
    label: 'Colors',
    type: 'multi-enum',
    enumValues: Object.values(HCColor),
    readOnly: true,
    explanation: 'Sum of side colors (edit colors on each face).',
  },
  { key: 'image', label: 'Image URL', type: 'string', readOnly: true },
  {
    key: 'still_image',
    label: 'Still Image URL',
    type: 'string',
    readOnly: true,
    explanation: 'Use this for animated cards.',
  },
  {
    key: 'rotated_image',
    label: 'Rotated Image URL',
    type: 'string',
    readOnly: true,
    explanation: 'Use this for rotating cards into a draftable position (aka split cards).',
  },
  {
    key: 'image_status',
    label: 'Image Status',
    type: 'enum',
    enumValues: Object.values(HCImageStatus),
  },
  { key: 'print_image', label: 'Print Image URL', type: 'string', readOnly: true },
  { key: 'still_print_image', label: 'Still Print Image URL', type: 'string', readOnly: true },
  { key: 'rotated_print_image', label: 'Rotated Print Image URL', type: 'string', readOnly: true },
  {
    key: 'print_image_status',
    label: 'Print Image Status',
    type: 'enum',
    enumValues: Object.values(HCImageStatus),
  },
  {
    key: 'finish',
    label: 'Finish',
    type: 'enum',
    enumValues: Object.values(HCFinish),
    explanation:
      '99% of the time, you want nonfoil. If someone used foiling in their card, you want foil.',
  },
  {
    key: 'border_color',
    label: 'Border Color',
    type: 'enum',
    enumValues: Object.values(HCBorderColor),
  },
  { key: 'frame', label: 'Frame', type: 'enum', enumValues: Object.values(HCFrame) },
  { key: 'frame_effects', label: 'Frame Effects', type: 'semicolon-list' },
  { key: 'keywords', label: 'Keywords', type: 'semicolon-list' },
  { key: 'creators', label: 'Creators', type: 'semicolon-list' },
  { key: 'artists', label: 'Artists', type: 'semicolon-list' },
  {
    key: 'legalities',
    label: 'Legality',
    type: 'legalities',
    enumValues: Object.values(HCLegality),
  },
  { key: 'rulings', label: 'Rulings', type: 'textarea' },
  { key: 'not_directly_draftable', label: 'Not Directly Draftable', type: 'boolean' },
  { key: 'has_draft_partners', label: 'Has Draft Partners', type: 'boolean' },
];

export const LEGALITY_FORMAT_LABELS: Record<(typeof formatList)[number], string> = {
  standard: 'Constructed',
  '4cb': '4CB',
  commander: 'Hellsmander',
};

export const DEFAULT_LEGALITIES: HCLegalitiesField = {
  standard: HCLegality.NotLegal,
  '4cb': HCLegality.NotLegal,
  commander: HCLegality.NotLegal,
};

function serializeValue(value: unknown, type: FieldType): string {
  if (type === 'legalities') {
    const source = isLegalitiesField(value) ? value : DEFAULT_LEGALITIES;
    const legalities = Object.fromEntries(
      formatList.map(format => [format, source[format]])
    ) as HCLegalitiesField;
    return JSON.stringify(legalities);
  }
  if (value == null || value === undefined) return '';
  if (type === 'boolean') return value === true ? 'true' : '';
  if (type === 'number') return value === '' || value == null ? '' : String(value);
  if (type === 'semicolon-list' || type === 'multi-enum') {
    return Array.isArray(value) ? value.join(';') : String(value);
  }
  return String(value);
}

/** Ordered union of face `colors` fields (semicolon-serialized). */
export function sumFaceColors(faces: Record<string, string>[]): string {
  const combined: HCColors = [];
  for (const face of faces) {
    const colors = parseFieldValue(face.colors ?? '', 'multi-enum') as string[];
    combined.push(...(colors as HCColors));
  }
  return serializeValue(orderColors(combined), 'multi-enum');
}

function readRootValue(card: HCCard.Any, key: string, type: FieldType): string {
  return serializeValue((card as Record<string, unknown>)[key], type);
}

function readFaceValue(card: HCCard.Any, faceIndex: number, key: string, type: FieldType): string {
  const face = toFaces(card)[faceIndex];
  if (!face) return '';
  return serializeValue((face as Record<string, unknown>)[key], type);
}

/** Components offered when linking a related card (excludes `self`). */
export const ADDABLE_RELATED_COMPONENTS = relatedComponentList.filter(
  (c): c is Exclude<relatedComponent, 'self'> => c !== 'self'
);

/** Default `component` when adding a related part for the card being edited. */
export function defaultRelatedComponent(card: HCCard.Any): relatedComponent {
  const typeLine = card.type_line ?? '';
  if (card.kind === HCKind.Token || typeLine.toLowerCase().startsWith('token')) {
    return 'token_maker';
  }
  return 'token';
}

export function relatedPartFromCard(card: HCCard.Any, component: relatedComponent): HCRelatedCard {
  return cardToRelatedCard(card, component);
}

function relatedPartsEqual(a: HCRelatedCard, b: HCRelatedCard): boolean {
  return (
    a.id === b.id &&
    a.component === b.component &&
    a.count === b.count &&
    a.persistent === b.persistent &&
    a.is_draft_partner === b.is_draft_partner
  );
}

export function buildEditFormState(card: HCCard.Any): EditFormState {
  const faces = toFaces(card);
  return {
    root: Object.fromEntries(
      ROOT_FIELD_CONFIGS.map(cfg => [cfg.key, readRootValue(card, cfg.key, cfg.type)])
    ),
    faces: faces.map((_face, i) =>
      Object.fromEntries(
        FACE_FIELDS.map(cfg => [cfg.key, readFaceValue(card, i, cfg.key, cfg.type)])
      )
    ),
    all_parts: structuredClone(card.all_parts ?? []),
  };
}

function isRootChangeable(key: string): key is rootChangeablePropType<'add'> {
  return ROOT_FIELD_CONFIGS.some(cfg => cfg.key === key && !cfg.readOnly);
}

function isRootDeletable(key: string): key is rootChangeablePropType<'delete'> {
  return (rootChangeableProps.delete as readonly string[]).includes(key);
}

function pushRootListElementChanges(
  changes: anyChange[],
  prop: string,
  before: string,
  after: string
): void {
  const beforeList = parseFieldValue(before, 'semicolon-list') as string[];
  const afterList = parseFieldValue(after, 'semicolon-list') as string[];
  const { added, deleted } = getBaseDiffs(beforeList, afterList);
  for (const value of added) {
    if (isRootChangeable(prop)) {
      changes.push(createRootChange('add', prop, value as never));
    }
  }
  for (const value of deleted) {
    if (isRootDeletable(prop)) {
      changes.push(createRootChange('delete', prop, value as never));
    }
  }
}

function pushFaceListElementChanges(
  changes: anyChange[],
  prop: string,
  faceIndex: number,
  before: string,
  after: string
): void {
  const beforeList = parseFieldValue(before, 'semicolon-list') as string[];
  const afterList = parseFieldValue(after, 'semicolon-list') as string[];
  const { added, deleted } = getBaseDiffs(beforeList, afterList);
  for (const value of added) {
    if (isFaceChangeable(prop)) {
      changes.push(createFaceChange('add', prop, value as never, faceIndex));
    }
  }
  for (const value of deleted) {
    if (isFaceDeletable(prop)) {
      changes.push(createFaceChange('delete', prop, value as never, faceIndex));
    }
  }
}

function pushRootScalarChange(
  changes: anyChange[],
  cfg: FieldConfig,
  before: string,
  after: string
): void {
  if (!isRootChangeable(cfg.key)) return;
  if (cfg.type === 'boolean') {
    const wasSet = before === 'true';
    const isSet = after === 'true';
    if (wasSet === isSet) return;
    if (isSet) {
      changes.push(createRootChange('add', cfg.key, true as never));
    } else if (isRootDeletable(cfg.key)) {
      changes.push(createRootChange('delete', cfg.key));
    }
    return;
  }
  const value = parseFieldValue(after, cfg.type);
  if (value === undefined) return;
  changes.push(createRootChange('add', cfg.key, value as never));
}

function buildFaceFromFormFields(
  card: HCCard.Any,
  faceIndex: number,
  fields: Record<string, string>
): HCCardFace.MultiFaced {
  const face = createBlankFace(card, faceIndex);
  for (const cfg of FACE_FIELDS) {
    const raw = fields[cfg.key] ?? '';
    if (!raw.trim() && cfg.type !== 'boolean') continue;
    const value = parseFieldValue(raw, cfg.type);
    // Omit unset booleans — `undefined` keys make `isCardFace` fail and drop face adds.
    if (value === undefined) continue;
    (face as Record<string, unknown>)[cfg.key] = value;
  }
  return face;
}

export function buildChangesFromForm(
  card: HCCard.Any,
  original: EditFormState,
  current: EditFormState
): anyChange[] {
  const changes: anyChange[] = [];

  for (const cfg of ROOT_FIELD_CONFIGS) {
    if (cfg.readOnly) continue;
    const before = original.root[cfg.key] ?? '';
    const after = current.root[cfg.key] ?? '';
    if (before === after) continue;
    if (
      cfg.type === 'semicolon-list' &&
      isRootArrayPropType(cfg.key as rootChangeablePropType<'add'>)
    ) {
      pushRootListElementChanges(changes, cfg.key, before, after);
      continue;
    }
    pushRootScalarChange(changes, cfg, before, after);
  }

  const existingFaceCount = original.faces.length;
  const faceCount = Math.max(existingFaceCount, current.faces.length);
  for (let i = 0; i < faceCount; i++) {
    if (i >= existingFaceCount) {
      const face = buildFaceFromFormFields(card, i, current.faces[i] ?? {});
      const index = 'card_faces' in card ? card.card_faces.length + (i - existingFaceCount) : 1;
      changes.push(createCardFacesChange('add', index, face));
      continue;
    }
    const origFace = original.faces[i] ?? {};
    const currFace = current.faces[i] ?? {};
    for (const cfg of FACE_FIELDS) {
      if (cfg.readOnly) continue;
      const before = origFace[cfg.key] ?? '';
      const after = currFace[cfg.key] ?? '';
      if (before === after) continue;
      if (
        cfg.type === 'semicolon-list' &&
        isFaceArrayPropType(cfg.key as faceChangeablePropType<'add'>)
      ) {
        pushFaceListElementChanges(changes, cfg.key, i, before, after);
        continue;
      }
      pushFaceScalarChange(changes, cfg, i, before, after);
    }
  }

  // Card-level colors = ordered union of side colors
  const derivedRootColors = sumFaceColors(current.faces);
  const originalRootColors = original.root.colors ?? '';
  if (derivedRootColors !== originalRootColors) {
    const value = parseFieldValue(derivedRootColors, 'multi-enum');
    changes.push(createRootChange('add', 'colors', value as never));
  }

  const origParts = original.all_parts ?? [];
  const currParts = current.all_parts ?? [];
  const origById = new Map(origParts.map(part => [part.id, part]));
  const currById = new Map(currParts.map(part => [part.id, part]));

  for (const [id] of origById) {
    if (!currById.has(id)) {
      changes.push(createAllPartsChange('delete', id));
    }
  }
  for (const [id, part] of currById) {
    const before = origById.get(id);
    if (!before) {
      changes.push(createAllPartsChange('add', undefined, part));
    } else if (!relatedPartsEqual(before, part)) {
      changes.push(createAllPartsChange('add', undefined, part));
    }
  }

  return changes;
}

export function createBlankFace(card: HCCard.Any, index: number): HCCardFace.MultiFaced {
  return {
    object: HCObject.ObjectType.CardFace,
    layout: getDefaultFaceLayout(card, index),
    image_status: index ? HCImageStatus.Inapplicable : HCImageStatus.Front,
    name: '',
    mana_cost: '',
    mana_value: 0,
    type_line: '',
    oracle_text: '',
    colors: [] as HCColors,
  } as HCCardFace.MultiFaced;
}

const CREATE_IMAGE_KEYS = [
  'image',
  'still_image',
  'rotated_image',
  'print_image',
  'still_print_image',
  'rotated_print_image',
] as const;

/** Merge create-form edits onto a stub card for a whole-card add changeset. */
export function buildCardFromCreateForm(
  stub: HCCard.Any,
  original: EditFormState,
  form: EditFormState,
  options?: { hcid?: string }
): HCCard.Any {
  const card = structuredClone(stub);
  applyChanges(card, buildChangesFromForm(card, original, form));

  for (const key of CREATE_IMAGE_KEYS) {
    const raw = form.root[key]?.trim() ?? '';
    if (raw) {
      (card as Record<string, unknown>)[key] = raw;
    } else {
      delete (card as Record<string, unknown>)[key];
    }
  }

  // Single-faced cards use the root object as face 0 (`toFaces` → `[card]`).
  // Only sync face image fields when faces are distinct objects.
  if ('card_faces' in card && Array.isArray(card.card_faces)) {
    form.faces.forEach((faceForm, i) => {
      const face = card.card_faces[i];
      if (!face) return;
      for (const key of CREATE_IMAGE_KEYS) {
        if (!(key in faceForm)) continue;
        const raw = faceForm[key]?.trim() ?? '';
        if (raw) {
          (face as Record<string, unknown>)[key] = raw;
        } else {
          delete (face as Record<string, unknown>)[key];
        }
      }
    });
  }

  const hcid = options?.hcid?.trim();
  if (hcid) {
    card.hcid = hcid;
  } else {
    delete (card as { hcid?: string }).hcid;
  }

  if (card.image && (!card.image_status || card.image_status === HCImageStatus.Missing)) {
    card.image_status = HCImageStatus.HighRes;
  }

  setDerivedProps(card, ['not-transcribed']);
  return card;
}

/** Create-mode required checks for the card document change validator. */
export function createFormMissingRequired(
  form: EditFormState,
  kind: HCCard.Any['kind']
): string | null {
  if (!form.root.name?.trim()) return 'Name is required';
  if (!form.root.creators?.trim()) return 'Creators are required';
  if (!form.root.image?.trim()) return 'Image URL is required';
  if (kind !== 'token' && !form.root.set?.trim()) return 'Set is required';
  return null;
}
