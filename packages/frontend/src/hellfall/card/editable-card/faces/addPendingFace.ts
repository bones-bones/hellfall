import { HCCard } from '@hellfall/shared/types';
import { EditFormState } from '../types';
import { FACE_FIELDS } from '../constants';

export function addPendingFace(state: EditFormState, _card: HCCard.Any): EditFormState {
  return {
    ...state,
    faces: [...state.faces, Object.fromEntries(FACE_FIELDS.map(cfg => [cfg.key, '']))],
  };
}
