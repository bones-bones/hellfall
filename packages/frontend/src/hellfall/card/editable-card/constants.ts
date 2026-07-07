import { HCBorderColor, HCFinish, HCFrame, HCImageStatus, HCLayout } from '@hellfall/shared/types';
import { toFaces } from '@hellfall/shared/utils';
import type { FieldConfigEntry } from './types';
import { getFieldConfigs } from './types';

export const FACE_FIELD_CONFIGS: FieldConfigEntry[] = [
  { section: 'Name' },
  { key: 'name', label: 'Face Name', type: 'string' },
  { key: 'flavor_name', label: 'Flavor Name', type: 'string' },
  { key: 'export_name', label: 'Export Name', type: 'string' },
  { key: 'layout', label: 'Layout', type: 'enum', enumValues: Object.values(HCLayout) },

  { section: 'Mana Cost' },
  { key: 'mana_value', label: 'Mana Value', type: 'number' },
  { key: 'colors', label: 'Colors', type: 'semicolon-list' },
  { key: 'mana_cost', label: 'Mana Cost', type: 'string' },

  { section: 'Types' },
  {
    key: 'supertypes',
    label: 'Supertypes',
    type: 'semicolon-list',
    explanation: '; seperated list',
  },
  { key: 'types', label: 'Types', type: 'semicolon-list', explanation: '; seperated list' },
  { key: 'subtypes', label: 'Subtypes', type: 'semicolon-list', explanation: '; seperated list' },

  { section: 'Text' },
  { key: 'oracle_text', label: 'Oracle Text', type: 'textarea' },
  { key: 'flavor_text', label: 'Flavor Text', type: 'textarea' },

  { section: 'Stats' },
  { key: 'power', label: 'Power', type: 'string' },
  { key: 'toughness', label: 'Toughness', type: 'string' },
  { key: 'loyalty', label: 'Loyalty', type: 'string' },
  { key: 'defense', label: 'Defense', type: 'string' },
  {
    key: 'hand_modifier',
    label: 'Hand Modifier',
    type: 'string',
    shouldHide: (card, faceIndex, faceFields) => {
      const types = faceFields.types
        ? faceFields.types
            .split(';')
            .map(t => t.trim())
            .filter(Boolean)
        : toFaces(card)[faceIndex]?.types ?? [];
      return !types.includes('Vanguard');
    },
  },
  {
    key: 'life_modifier',
    label: 'Life Modifier',
    type: 'string',
    shouldHide: (card, faceIndex, faceFields) => {
      const types = faceFields.types
        ? faceFields.types
            .split(';')
            .map(t => t.trim())
            .filter(Boolean)
        : toFaces(card)[faceIndex]?.types ?? [];
      return !types.includes('Vanguard');
    },
  },
  {
    key: 'attraction_lights',
    label: 'Attraction Lights',
    type: 'string',
    shouldHide: (card, faceIndex, faceFields) => {
      const types = faceFields.types
        ? faceFields.types
            .split(';')
            .map(t => t.trim())
            .filter(Boolean)
        : toFaces(card)[faceIndex]?.types ?? [];
      return !types.includes('Attraction');
    },
  },

  { section: 'Image' },
  {
    key: 'image_status',
    label: 'Image Status',
    type: 'enum',
    enumValues: Object.values(HCImageStatus),
    explanation: 'Common values will be highres, medres, inset (for adventures), and jank.',
  },
  { key: 'image', label: 'Image URL', type: 'string' },
  { key: 'still_image', label: 'Still Image URL', type: 'string' },
  { key: 'rotated_image', label: 'Rotated Image URL', type: 'string' },

  { section: 'Frame' },

  { key: 'color_indicator', label: 'Color Indicator', type: 'semicolon-list' },
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

  { section: 'Advanced' },
  { key: 'compress_face', label: 'Compress Face', type: 'boolean' },
  {
    key: 'drop_face',
    label: 'Drop Face',
    type: 'boolean',
    explanation: 'Use this to hide a card face from normal vilibility.',
  },
];

export const FACE_FIELDS = getFieldConfigs(FACE_FIELD_CONFIGS);
