import { HCCard } from '@hellfall/shared/types';

export const canBeACommander = (card: HCCard.Any) => {
  const faces = card.toFaces();
  return (
    ((faces[0]?.supertypes?.some((type: string) => type.toLowerCase() == 'legendary') &&
      (faces[0]?.types?.some((type: string) => type.toLowerCase() == 'creature') ||
        faces[0]?.subtypes?.some(type =>
          ['vehicle', 'spacecraft', 'watercraft'].includes(type.toLowerCase())
        ))) ||
      faces[0]?.oracle_text.toLowerCase().includes('can be your commander')) &&
    !faces[0]?.oracle_text.toLowerCase().includes('irresponsible')
  );
};
