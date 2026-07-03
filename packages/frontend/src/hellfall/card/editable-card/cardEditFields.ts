import {
  HCBorderColor,
  HCCard,
  HCCardFace,
  HCColors,
  HCFinish,
  HCFrame,
  HCImageStatus,
  HCLayout,
  HCRarity,
  HCObject,
} from '@hellfall/shared/types';
import {
  anyChange,
  createCardFacesChange,
  createFaceChange,
  createRootChange,
  faceChangeablePropType,
  getBaseDiffs,
  getDefaultFaceLayout,
  isFaceArrayPropType,
  isRootArrayPropType,
  rootChangeablePropType,
  rootChangeableProps,
  toFaces,
} from '@hellfall/shared/utils';
import { pushFaceScalarChange } from './faces';
import type { EditFormState, FieldConfig, FieldType } from './types';
import { isFaceChangeable } from './faces/isFaceChangeable';
import { isFaceDeletable } from './faces/isFaceDeleteable';
import { parseFieldValue } from './parseFieldValue';
import { FACE_FIELD_CONFIGS } from './constants';



export const ROOT_FIELD_CONFIGS: FieldConfig[] = [
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'flavor_name', label: 'Flavor Name', type: 'string' },
  { key: 'export_name', label: 'Export Name', type: 'string' },
  { key: 'set', label: 'Set', type: 'string' },
  { key: 'collector_number', label: 'Collector #', type: 'string' },
  { key: 'rarity', label: 'Rarity', type: 'enum', enumValues: Object.values(HCRarity) },
  { key: 'layout', label: 'Layout', type: 'enum', enumValues: Object.values(HCLayout) },
  { key: 'mana_value', label: 'Mana Value', type: 'number' },
  { key: 'colors', label: 'Colors', type: 'semicolon-list' },
  { key: 'image', label: 'Image URL', type: 'string' },
  { key: 'still_image', label: 'Still Image URL', type: 'string' },
  { key: 'rotated_image', label: 'Rotated Image URL', type: 'string' },
  {
    key: 'image_status',
    label: 'Image Status',
    type: 'enum',
    enumValues: Object.values(HCImageStatus),
  },
  { key: 'print_image', label: 'Print Image URL', type: 'string' },
  { key: 'still_print_image', label: 'Still Print Image URL', type: 'string' },
  { key: 'rotated_print_image', label: 'Rotated Print Image URL', type: 'string' },
  {
    key: 'print_image_status',
    label: 'Print Image Status',
    type: 'enum',
    enumValues: Object.values(HCImageStatus),
  },
  { key: 'finish', label: 'Finish', type: 'enum', enumValues: Object.values(HCFinish) },
  { key: 'border_color', label: 'Border Color', type: 'enum', enumValues: Object.values(HCBorderColor) },
  { key: 'frame', label: 'Frame', type: 'enum', enumValues: Object.values(HCFrame) },
  { key: 'frame_effects', label: 'Frame Effects', type: 'semicolon-list' },
  { key: 'keywords', label: 'Keywords', type: 'semicolon-list' },
  { key: 'creators', label: 'Creators', type: 'semicolon-list' },
  { key: 'artists', label: 'Artists', type: 'semicolon-list' },
  { key: 'rulings', label: 'Rulings', type: 'textarea' },
  { key: 'not_directly_draftable', label: 'Not Directly Draftable', type: 'boolean' },
  { key: 'has_draft_partners', label: 'Has Draft Partners', type: 'boolean' },
];




function serializeValue(value: unknown, type: FieldType): string {
  if (value == null || value === undefined) return '';
  if (type === 'boolean') return value === true ? 'true' : '';
  if (type === 'number') return value === '' || value == null ? '' : String(value);
  if (type === 'semicolon-list') {
    return Array.isArray(value) ? value.join(';') : String(value);
  }
  return String(value);
}

function readRootValue(card: HCCard.Any, key: string, type: FieldType): string {
  return serializeValue((card as Record<string, unknown>)[key], type);
}

function readFaceValue(card: HCCard.Any, faceIndex: number, key: string, type: FieldType): string {
  const face = toFaces(card)[faceIndex];
  if (!face) return '';
  return serializeValue((face as Record<string, unknown>)[key], type);
}

export function buildEditFormState(card: HCCard.Any): EditFormState {
  const faces = toFaces(card);
  return {
    root: Object.fromEntries(
      ROOT_FIELD_CONFIGS.map(cfg => [cfg.key, readRootValue(card, cfg.key, cfg.type)])
    ),
    faces: faces.map((_face, i) =>
      Object.fromEntries(
        FACE_FIELD_CONFIGS.map(cfg => [cfg.key, readFaceValue(card, i, cfg.key, cfg.type)])
      )
    ),
  };
}

function isRootChangeable(key: string): key is rootChangeablePropType<'add'> {
  return ROOT_FIELD_CONFIGS.some(cfg => cfg.key === key);
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
  for (const cfg of FACE_FIELD_CONFIGS) {
    const raw = fields[cfg.key] ?? '';
    if (!raw.trim() && cfg.type !== 'boolean') continue;
    const value = parseFieldValue(raw, cfg.type);
    if (value === undefined && cfg.type !== 'boolean') continue;
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
    const before = original.root[cfg.key] ?? '';
    const after = current.root[cfg.key] ?? '';
    if (before === after) continue;
    if (cfg.type === 'semicolon-list' && isRootArrayPropType(cfg.key as rootChangeablePropType<'add'>)) {
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
    for (const cfg of FACE_FIELD_CONFIGS) {
      const before = origFace[cfg.key] ?? '';
      const after = currFace[cfg.key] ?? '';
      if (before === after) continue;
      if (cfg.type === 'semicolon-list' && isFaceArrayPropType(cfg.key as faceChangeablePropType<'add'>)) {
        pushFaceListElementChanges(changes, cfg.key, i, before, after);
        continue;
      }
      pushFaceScalarChange(changes, cfg, i, before, after);
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

