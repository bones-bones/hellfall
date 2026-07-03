import { faceChangeablePropType } from '@hellfall/shared/utils';
import { FACE_FIELD_CONFIGS } from '../constants';

export function isFaceChangeable(key: string): key is faceChangeablePropType<'add'> {
  return FACE_FIELD_CONFIGS.some(cfg => cfg.key === key);
}