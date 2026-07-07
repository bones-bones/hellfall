import { faceChangeablePropType } from '@hellfall/shared/utils';
import { FACE_FIELDS } from '../constants';

export function isFaceChangeable(key: string): key is faceChangeablePropType<'add'> {
  return FACE_FIELDS.some(cfg => cfg.key === key && !cfg.readOnly);
}
