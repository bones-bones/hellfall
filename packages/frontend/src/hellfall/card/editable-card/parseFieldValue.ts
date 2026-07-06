import { FieldType } from './types';

export function parseFieldValue(raw: string, type: FieldType): unknown {
  if (type === 'boolean') return raw === 'true' ? true : undefined;
  if (type === 'number') {
    if (!raw.trim()) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }
  if (type === 'semicolon-list') {
    if (!raw.trim()) return [];
    return raw
      .split(';')
      .map(s => s.trim())
      .filter(Boolean);
  }
  if (!raw.trim()) return '';
  return raw;
}