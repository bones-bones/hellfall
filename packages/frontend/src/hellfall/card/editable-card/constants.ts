import {
  HCBorderColor,
  HCColor,
  HCFinish,
  HCFrame,
  HCImageStatus,
  HCCard,
  HCLayout,
} from '@hellfall/shared/types';
import { semiSplit, toFaces } from '@hellfall/shared/utils';
import type { FieldConfig, FieldConfigEntry } from './types';
import { getFieldConfigs } from './types';

const getFaceTypes = (
  card: HCCard.Any,
  faceIndex: number,
  faceFields: Record<string, string>
): string[] => {
  if (faceFields.types) {
    return semiSplit(faceFields.types);
  }
  return toFaces(card)[faceIndex]?.types ?? [];
};

function shouldHideUnlessType(requiredType: string): NonNullable<FieldConfig['shouldHide']> {
  return (card, faceIndex, faceFields) =>
    !getFaceTypes(card, faceIndex, faceFields).includes(requiredType);
}

/**
 * Face edit fields.
 * "Database" mirrors Google Sheet Database columns (incl. N* multi-face cols);
 * "Optional" is tags/print/layout extras.
 */
export const FACE_FIELD_CONFIGS: FieldConfigEntry[] = [
  { section: 'Database' },
  { key: 'name', label: 'Face Name', type: 'string' },
  {
    key: 'mana_cost',
    label: 'Mana Cost',
    type: 'string',
    explanation:
      'Brace-enclosed symbols only, e.g. {2}{B}{B}, {G/U}, {X}. Leave empty for lands. Use // between faces if needed.',
  },
  { key: 'mana_value', label: 'Mana Value', type: 'number' },
  {
    key: 'colors',
    label: 'Colors',
    type: 'multi-enum',
    enumValues: Object.values(HCColor),
    explanation: 'Select color codes (W, U, B, R, G, P, C, or named misc colors).',
  },
  {
    key: 'supertypes',
    label: 'Supertypes',
    type: 'semicolon-list',
    explanation: '; seperated list',
  },
  { key: 'types', label: 'Types', type: 'semicolon-list', explanation: '; seperated list' },
  { key: 'subtypes', label: 'Subtypes', type: 'semicolon-list', explanation: '; seperated list' },
  { key: 'oracle_text', label: 'Oracle Text', type: 'textarea' },
  { key: 'flavor_text', label: 'Flavor Text', type: 'textarea' },
  { key: 'power', label: 'Power', type: 'string' },
  { key: 'toughness', label: 'Toughness', type: 'string' },
  {
    key: 'loyalty',
    label: 'Loyalty',
    type: 'string',
    shouldHide: shouldHideUnlessType('Planeswalker'),
  },
  { key: 'defense', label: 'Defense', type: 'string', shouldHide: shouldHideUnlessType('Battle') },
  { key: 'image', label: 'Image URL', type: 'string', readOnly: true },

  { section: 'Optional', collapsed: true },
  { key: 'flavor_name', label: 'Flavor Name', type: 'string' },
  { key: 'export_name', label: 'Export Name', type: 'string' },
  { key: 'layout', label: 'Layout', type: 'enum', enumValues: Object.values(HCLayout) },
  {
    key: 'hand_modifier',
    label: 'Hand Modifier',
    type: 'string',
    shouldHide: shouldHideUnlessType('Vanguard'),
  },
  {
    key: 'life_modifier',
    label: 'Life Modifier',
    type: 'string',
    shouldHide: shouldHideUnlessType('Vanguard'),
  },
  {
    key: 'attraction_lights',
    label: 'Attraction Lights',
    type: 'string',
    shouldHide: shouldHideUnlessType('Attraction'),
  },
  {
    key: 'image_status',
    label: 'Image Status',
    type: 'enum',
    enumValues: Object.values(HCImageStatus),
    explanation: 'Common values will be highres, medres, inset (for adventures), and jank.',
  },
  { key: 'still_image', label: 'Still Image URL', type: 'string', readOnly: true },
  { key: 'rotated_image', label: 'Rotated Image URL', type: 'string', readOnly: true },
  {
    key: 'color_indicator',
    label: 'Color Indicator',
    type: 'multi-enum',
    enumValues: Object.values(HCColor),
    explanation: 'Select color codes (W, U, B, R, G, P, C, or named misc colors).',
  },
  { key: 'finish', label: 'Finish', type: 'enum', enumValues: Object.values(HCFinish) },
  {
    key: 'border_color',
    label: 'Border Color',
    type: 'enum',
    enumValues: Object.values(HCBorderColor),
  },
  { key: 'frame', label: 'Frame', type: 'enum', enumValues: Object.values(HCFrame) },
  { key: 'frame_effects', label: 'Frame Effects', type: 'semicolon-list' },
  { key: 'watermark', label: 'Watermark', type: 'string' },
  { key: 'compress_face', label: 'Compress Face', type: 'boolean' },
  {
    key: 'drop_face',
    label: 'Drop Face',
    type: 'boolean',
    explanation: 'Use this to hide a card face from normal vilibility.',
  },
];

export const FACE_FIELDS = getFieldConfigs(FACE_FIELD_CONFIGS);
