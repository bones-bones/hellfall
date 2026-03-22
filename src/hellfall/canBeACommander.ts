import { HCCard } from '../api-types';

export const canBeACommander = (card: HCCard.Any) => {
  const faces = card.toFaces();
  return (
    ((faces[0]?.supertypes?.includes('Legendary') &&
      (faces[0]?.types?.includes('Creature') ||
        faces[0]?.subtypes?.includes('Vehicle') ||
        faces[0]?.subtypes?.includes('Spacecraft'))) ||
      faces[0]?.oracle_text.toLowerCase().includes('can be your commander')) &&
    !faces[0]?.oracle_text.includes('Irresponsible')
  );
};
