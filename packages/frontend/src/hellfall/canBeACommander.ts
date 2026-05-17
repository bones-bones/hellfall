import { HCCard } from '@hellfall/shared/types';
import { listShareLower, toFaces } from '@hellfall/shared/utils';

export const canBeACommander = (card: HCCard.Any) => {
  const faces = toFaces(card);
  return (
    ((listShareLower(faces[0].supertypes, 'legendary') &&
      (listShareLower(faces[0].types, 'creature') ||
        listShareLower(faces[0].subtypes, ['vehicle', 'spacecraft', 'watercraft']))) ||
      faces[0]?.oracle_text.toLowerCase().includes('can be your commander')) &&
    !faces[0]?.oracle_text.toLowerCase().includes('irresponsible')
  );
};
