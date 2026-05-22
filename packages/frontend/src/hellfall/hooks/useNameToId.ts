import { useAtom, useAtomValue } from 'jotai';
import { cardsAtom } from '../atoms/cardsAtom.ts';
import { textEquals, textListEquals } from '@hellfall/shared/utils';
import { HCCard } from '@hellfall/shared/types';
import landsData from '@hellfall/shared/data/lands.json';
import cardsData from '@hellfall/shared/data/Hellscube-Database.json';
import tokensData from '@hellfall/shared/data/tokens.json';

export const useNameToId = (name: string): string | undefined => {
  const cards = useAtomValue(cardsAtom);
  const movedIds: Record<string, string> = {
    '219': '6727',
    '219b': '6728',
    '1121': '6729',
    '1121b': '6730',
    '1121c': '6731',
    '1121d': '6732',
    '1121e': '6733',
    '2035': '6734',
    '2035b': '6735',
  };
  if (name in movedIds) {
    return movedIds[name];
  }
  const filteredCards = cards.filter(e => e.set != 'NRM');
  if (name == 'random' && filteredCards.length) {
    const theId = filteredCards[Math.floor(Math.random() * filteredCards.length)].id;
    return theId;
  }
  return (
    cards.find(card => textEquals(card.id, name))?.id ??
    cards.find(card => textEquals(card.name, name))?.id ??
    cards.find(card => card.flavor_name && textEquals(card.flavor_name, name))?.id ??
    cards.find(card => 'card_faces' in card && textEquals(card.card_faces[0].name, name))?.id ??
    cards.find(
      card =>
        'card_faces' in card &&
        textListEquals(
          card.card_faces.map(e => e.name),
          name
        )
    )?.id ??
    cards.find(
      card =>
        'card_faces' in card &&
        textListEquals(
          card.card_faces.flatMap(e => e.flavor_name ?? []),
          name
        )
    )?.id
  );
};

const getFrontExportName = (card: HCCard.Any) => {
  if (card.export_name) {
    return card.export_name;
  }
  if ('card_faces' in card) {
    if (card.card_faces[0].export_name) {
      return card.card_faces[0].export_name;
    }
    if (!card.card_faces[1].compress_face && !card.card_faces[1].drop_face) {
      return card.card_faces[0].name;
    }
    let faceName = card.card_faces[0].name;
    for (
      let i = 1;
      i < card.card_faces.length &&
      (card.card_faces[i].compress_face || card.card_faces[i].drop_face);
      i++
    ) {
      if (card.card_faces[i].compress_face) {
        faceName += ' // ' + card.card_faces[i].name;
      }
    }
    return faceName;
  }
  return card.name;
};

const landNames = [
  'Plains',
  'Island',
  'Swamp',
  'Mountain',
  'Forest',
  'Nebula',
  'Wastes',
  'Snow-Covered Plains',
  'Snow-Covered Island',
  'Snow-Covered Swamp',
  'Snow-Covered Mountain',
  'Snow-Covered Forest',
  'Snow-Covered Nebula',
  'Snow-Covered Wastes',
];

const getRandom = <T = any>(arr: T[]) =>
  arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
export const nameToId = (name: string, cards: HCCard.Any[]): string | undefined => {
  const movedIds: Record<string, string> = {
    '219': '6727',
    '219b': '6728',
    '1121': '6729',
    '1121b': '6730',
    '1121c': '6731',
    '1121d': '6732',
    '1121e': '6733',
    '2035': '6734',
    '2035b': '6735',
  };
  if (name in movedIds) {
    return movedIds[name];
  }
  const filteredCards = cards.filter(e => e.set != 'NRM');
  if (name == 'random' && filteredCards.length > 0) {
    const theId = filteredCards[Math.floor(Math.random() * filteredCards.length)].id;
    return theId;
  }
  if (textListEquals(landNames, name)) {
    return getRandom(
      cards.filter(card => card.set.startsWith('HBB') && textEquals(name, card.name))
    )?.id;
  }
  return (
    cards.find(card => card.export_name && textEquals(card.export_name, name))?.id ??
    cards.find(
      card =>
        'card_faces' in card &&
        card.card_faces[0].export_name &&
        textEquals(card.card_faces[0].export_name, name)
    )?.id ??
    cards.find(card => 'card_faces' in card && textEquals(getFrontExportName(card), name))?.id ??
    cards.find(card => textEquals(card.id, name))?.id ??
    cards.find(card => textEquals(card.name, name))?.id ??
    cards.find(card => card.flavor_name && textEquals(card.flavor_name, name))?.id ??
    cards.find(card => 'card_faces' in card && textEquals(card.card_faces[0].name, name))?.id ??
    cards.find(
      card =>
        'card_faces' in card &&
        textListEquals(
          card.card_faces.map(e => e.name),
          name
        )
    )?.id ??
    cards.find(
      card =>
        'card_faces' in card &&
        textListEquals(
          card.card_faces.flatMap(e => e.flavor_name ?? []),
          name
        )
    )?.id
  );
};
export const useIsId = (id: string): boolean => {
  const cards = useAtomValue(cardsAtom);
  return !!cards.find(card => card.id == id);
};
