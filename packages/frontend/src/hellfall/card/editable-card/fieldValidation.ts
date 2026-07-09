import { HCCard } from '@hellfall/shared/types';
import { FACE_FIELDS } from './constants';
import { ROOT_FIELD_CONFIGS } from './cardEditFields';
import type { EditFormState, FieldConfig } from './types';

export type MissingRequiredField = {
  scope: 'root' | 'face';
  faceIndex?: number;
  config: FieldConfig;
};

export function isFieldValueMissing(config: FieldConfig, value: string): boolean {
  if (!config.required) return false;
  if (config.type === 'boolean') return value !== 'true';
  return !value.trim();
}

export function getMissingRequiredFields(
  card: HCCard.Any,
  form: EditFormState,
  isMulti: boolean
): MissingRequiredField[] {
  const missing: MissingRequiredField[] = [];

  for (const cfg of ROOT_FIELD_CONFIGS) {
    if (isFieldValueMissing(cfg, form.root[cfg.key] ?? '')) {
      missing.push({ scope: 'root', config: cfg });
    }
  }

  form.faces.forEach((faceFields, faceIndex) => {
    for (const cfg of FACE_FIELDS) {
      if (!isMulti && cfg.key === 'name') continue;
      if (cfg.shouldHide?.(card, faceIndex, faceFields)) continue;
      if (isFieldValueMissing(cfg, faceFields[cfg.key] ?? '')) {
        missing.push({ scope: 'face', faceIndex, config: cfg });
      }
    }
  });

  return missing;
}
