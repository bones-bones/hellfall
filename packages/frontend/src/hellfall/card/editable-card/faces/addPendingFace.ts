import { HCCard } from '@hellfall/shared/types';
import { EditFormState } from '../types';
import { FACE_FIELD_CONFIGS } from '../constants';

export function addPendingFace(state: EditFormState, _card: HCCard.Any): EditFormState {
  return {
    ...state,
    faces: [
      ...state.faces,
      Object.fromEntries(FACE_FIELD_CONFIGS.map(cfg => [cfg.key, ''])),
    ],
  };
}