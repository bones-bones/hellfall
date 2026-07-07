import { anyChange, createFaceChange } from '@hellfall/shared/utils';
import { FieldConfig } from '../types';
import { isFaceChangeable } from './isFaceChangeable';
import { isFaceDeletable } from './isFaceDeleteable';
import { parseFieldValue } from '../parseFieldValue';

export const pushFaceScalarChange = (
  changes: anyChange[],
  cfg: FieldConfig,
  faceIndex: number,
  before: string,
  after: string
): void => {
  if (!isFaceChangeable(cfg.key)) return;
  if (cfg.type === 'boolean') {
    const wasSet = before === 'true';
    const isSet = after === 'true';
    if (wasSet === isSet) return;
    if (isSet) {
      changes.push(createFaceChange('add', cfg.key, true as never, faceIndex));
    } else if (isFaceDeletable(cfg.key)) {
      changes.push(createFaceChange('delete', cfg.key, undefined, faceIndex));
    }
    return;
  }
  const value = parseFieldValue(after, cfg.type);
  if (value === undefined) return;
  changes.push(createFaceChange('add', cfg.key, value as never, faceIndex));
};
