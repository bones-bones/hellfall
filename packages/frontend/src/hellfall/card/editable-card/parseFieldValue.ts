import { isLegalitiesField } from '@hellfall/shared/types';
import { FieldType } from './types';
import { semiSplit } from '@hellfall/shared/utils';

export function parseFieldValue(raw: string, type: FieldType): unknown {
  if (type === 'boolean') return raw === 'true' ? true : undefined;
  if (type === 'number') {
    if (!raw.trim()) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }
  if (type === 'semicolon-list' || type === 'multi-enum') {
    return semiSplit(raw);
  }
  if (type === 'legalities') {
    if (!raw.trim()) return undefined;
    try {
      const parsed = JSON.parse(raw) as unknown;
      return isLegalitiesField(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
  if (!raw.trim()) return '';
  return raw;
}
