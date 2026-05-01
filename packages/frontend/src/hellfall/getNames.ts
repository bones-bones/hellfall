import { HCCard } from '@hellfall/shared/types';
import {
  getMasterpiece,
  getSetCode,
  stripMasterpiece,
  stripSetCode,
} from '@hellfall/shared/utils/textHandling';

export const getOtherNames = (card: HCCard.Any): string[] | undefined => {
  const names = [];
  if (card.tags?.includes('irregular-face-name') && 'card_faces' in card) {
    names.push(card.card_faces.map(face => face.name).join(' \\ '));
  }
  if (card.flavor_name) {
    names.push(card.flavor_name);
  }
  if ('card_faces' in card && card.card_faces.find(face => face.flavor_name)) {
    names.push(
      ...(card.card_faces
        .filter(face => face.flavor_name)
        .map(face => face.flavor_name) as string[])
    );
  }
  return names.length ? names : undefined;
};

export const getAllNames = (card: HCCard.Any): string[] => {
  const names = [stripMasterpiece(stripSetCode(card.name))];
  if (names[0].slice(-5) == ' (HC)') {
    names.push(card.name);
    while (names[0].slice(-5) == ' (HC)') {
      names.unshift(stripSetCode(names[0]));
    }
  }
  if (card.flavor_name) {
    names.push(card.flavor_name);
  }
  const start = getMasterpiece(card.name);
  const ending = getSetCode(card.name);
  if ('card_faces' in card) {
    card.card_faces.forEach((face, i) => {
      if (face.flavor_name) {
        names.push(face.flavor_name);
      }
      names.push(face.name);
      let name = face.name;
      card.card_faces.slice(i + 1).forEach(f => {
        name += ` // ${f.name}`;
        names.push(name);
      });
    });
  }
  if (start || ending) {
    return names.flatMap(name => {
      return [
        name,
        ...(start ? [start + name] : []),
        ...(ending ? [name + ending] : []),
        ...(start && ending ? [start + name + ending] : []),
      ];
    });
  }
  return names;
};
