import { HCCard } from '../../api-types';

// TODO: Should these use only the first face?
export const getTableRow = (card: HCCard.Any) => {
  if (
    card
      .toFaces()
      .map(e => e.types)
      .flat()
      .some(e => ['Instant', 'Sorcery'].includes(e!))
  ) {
    return 3;
  }

  if (
    card
      .toFaces()
      .map(e => e.types)
      .flat()
      .includes('Creature')
  ) {
    return 2;
  }

  if (
    card
      .toFaces()
      .map(e => e.types)
      .flat()
      .includes('Land')
  ) {
    return 0;
  }
  return 1;
};
