import { useAtomValue } from 'jotai';
import { cardsAtom } from '../atoms/cardsAtom.ts';
import { CardMap, landNames, textEquals, textListEquals } from '@hellfall/shared/utils';
import { allExceptNormal, HCCard } from '@hellfall/shared/types';
import { unescapeText } from '@hellfall/shared/filters';

export const useNameToHCID = (name: string): string | undefined => {
  const cards = useAtomValue(cardsAtom);
  if (name == 'random') {
    return cards.getAllInSetListExact(allExceptNormal).getRandomId();
  }
  return (
    cards.get(name)?.hcid ??
    cards.find(card => textEquals(card.hcid, name))?.hcid ??
    cards.find(card => textEquals(card.name, name))?.hcid ??
    cards.find(card => card.flavor_name && textEquals(card.flavor_name, name))?.hcid ??
    cards.find(card => 'card_faces' in card && textEquals(card.card_faces[0].name, name))?.hcid ??
    cards.find(
      card =>
        'card_faces' in card &&
        textListEquals(
          card.card_faces.map(e => e.name),
          name
        )
    )?.hcid ??
    cards.find(
      card =>
        'card_faces' in card &&
        textListEquals(
          card.card_faces.flatMap(e => e.flavor_name ?? []),
          name
        )
    )?.hcid
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

// const getRandom = <T = any>(arr: T[]) =>
//   arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;

export const nameToId = (name: string, cards: CardMap): string | undefined => {
  if (name == 'random') {
    return cards.getAllInSetListExact(allExceptNormal).getRandomId();
  }
  if (textListEquals(landNames, name)) {
    return cards
      .getAllInSet('HBB')
      .filter(card => textEquals(name, card.name))
      .getRandomId();
  }
  return (
    cards.get(name)?.id ??
    cards.find(card => card.export_name && textEquals(card.export_name, name))?.id ??
    cards.find(
      card =>
        'card_faces' in card &&
        card.card_faces[0].export_name &&
        textEquals(card.card_faces[0].export_name, name)
    )?.id ??
    cards.find(card => 'card_faces' in card && textEquals(getFrontExportName(card), name))?.id ??
    cards.find(card => textEquals(card.hcid, name))?.id ??
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
    )?.id ??
    cards.find(card => card.export_name && textEquals(`${card.name} ${card.id}`, name))?.id ??
    cards.find(
      card => card.export_name && textEquals(unescapeText(card.export_name), unescapeText(name))
    )?.id
  );
};
export const useIsHCID = (id: string): boolean => {
  const cards = useAtomValue(cardsAtom);
  return cards.some(card => card.hcid == id);
};
