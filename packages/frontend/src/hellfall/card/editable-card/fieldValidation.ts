import { HCCard, isManaCost } from '@hellfall/shared/types';
import { FACE_FIELDS } from './constants';
import { ROOT_FIELD_CONFIGS } from './cardEditFields';
import { parseFieldValue } from './parseFieldValue';
import type { EditFormState, FieldConfig } from './types';

export type InvalidField = {
  scope: 'root' | 'face';
  faceIndex?: number;
  config: FieldConfig;
  reason: 'required' | 'format';
  message: string;
};

export function isFieldValueMissing(config: FieldConfig, value: string): boolean {
  if (!config.required) return false;
  if (config.type === 'boolean') return value !== 'true';
  return !value.trim();
}

export function getFieldFormatError(config: FieldConfig, value: string): string | undefined {
  if (config.key === 'mana_cost' && value.trim() && !isManaCost(value.trim())) {
    return 'Must be brace tokens like {2}{B}{B} (optional // between faces)';
  }
  if (config.type === 'multi-enum' && config.enumValues) {
    const selected = parseFieldValue(value, 'multi-enum') as string[];
    const allowed = new Set(config.enumValues);
    const invalid = selected.filter(v => !allowed.has(v));
    if (invalid.length > 0) {
      return `Invalid color(s): ${invalid.join(', ')}`;
    }
  }
  return undefined;
}

export function isFieldValueInvalid(config: FieldConfig, value: string): boolean {
  return isFieldValueMissing(config, value) || Boolean(getFieldFormatError(config, value));
}

export function getInvalidFields(
  card: HCCard.Any,
  form: EditFormState,
  isMulti: boolean
): InvalidField[] {
  const invalid: InvalidField[] = [];

  for (const cfg of ROOT_FIELD_CONFIGS) {
    const value = form.root[cfg.key] ?? '';
    if (isFieldValueMissing(cfg, value)) {
      invalid.push({
        scope: 'root',
        config: cfg,
        reason: 'required',
        message: 'Required',
      });
      continue;
    }
    const formatError = getFieldFormatError(cfg, value);
    if (formatError) {
      invalid.push({
        scope: 'root',
        config: cfg,
        reason: 'format',
        message: formatError,
      });
    }
  }

  form.faces.forEach((faceFields, faceIndex) => {
    for (const cfg of FACE_FIELDS) {
      if (!isMulti && cfg.key === 'name') continue;
      if (cfg.shouldHide?.(card, faceIndex, faceFields)) continue;
      const value = faceFields[cfg.key] ?? '';
      if (isFieldValueMissing(cfg, value)) {
        invalid.push({
          scope: 'face',
          faceIndex,
          config: cfg,
          reason: 'required',
          message: 'Required',
        });
        continue;
      }
      const formatError = getFieldFormatError(cfg, value);
      if (formatError) {
        invalid.push({
          scope: 'face',
          faceIndex,
          config: cfg,
          reason: 'format',
          message: formatError,
        });
      }
    }
  });

  return invalid;
}
