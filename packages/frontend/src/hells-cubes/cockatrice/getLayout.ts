import { HCCard } from '@hellfall/shared/types';

export const getLayout = (card: HCCard.Any) => {
  if (
    (card.toFaces().filter(e => e.image).length <= 1 && card.toFaces().length > 1) ||
    card.toFaces()[0].types?.some(e => ['Battle', 'Plane', 'Phenomenon'].includes(e))
  ) {
    return 'split';
  }

  return 'normal';
};
