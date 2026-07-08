import { faceType, HCCard, HCLayout, HCRelatedCard } from '@hellfall/shared/types';
import { CockCardProps, CockFaceProps, CockRelatedProps } from './cockTypes';
import { orderColors } from '../orderColors';
import { canBeInDecks, hasTokenHCID, mergeHCCardFaces } from '../cardHandling';
import { listIncludesValueLower } from '../listHandling';

const hcToCockLayout: Record<HCLayout, string> = {
  normal: 'normal',
  multi: 'split',
  inset: 'adventure',
  prepare: 'prepare',
  token: 'token',
  token_in_inset: 'normal',
  token_on_back: 'normal',
  split: 'split',
  aftermath: 'aftermath',
  meld_part: 'meld',
  meld_result: 'meld',
  multi_token: 'token',
  not_magic: 'token',
  multi_not_magic: 'token',
  emblem: 'token',
  reminder: 'token',
  reminder_on_back: 'normal',
  multi_reminder: 'token',
  stickers: 'token',
  stickers_on_back: 'normal',
  dungeon: 'token',
  dungeon_in_inset: 'normal',
  dungeon_on_back: 'normal',
  real_card_token: 'token',
  real_card_multi_token: 'token',
  checklist: 'token',
  misc: 'token',
  draft_partner: 'draft_partner',
  modal: 'modal_dfc',
  transform: 'transform',
  specialize: 'transform',
  flip: 'flip',
  front: 'normal',
  leveler: 'normal',
  class: 'normal',
  case: 'normal',
  saga: 'normal',
  mutate: 'normal',
  prototype: 'normal',
  battle: 'normal',
  planar: 'normal',
  scheme: 'normal',
  vanguard: 'normal',
  station: 'normal',
  cube: 'normal',
};
const otherPermanentTypes = ['planeswalker', 'enchantment', 'artifact'];
const nonPermanentTypes = ['instant', 'sorcery', 'gleeporzob', 'interrupt'];

const toTitleCase = (text: string) =>
  `${text[0]?.toUpperCase() ?? ''}${text.slice(1).toLowerCase()}`;

/**
 * Gets the main type for a face
 * @param face face to get the main type of
 */
const getMainType = (face: faceType): string => {
  if (face.types) {
    if (listIncludesValueLower(face.types, 'creature')) {
      return 'Creature';
    }
    if (listIncludesValueLower(face.types, 'land')) {
      return 'Land';
    }
    const otherPermanent = face.types.findLast(type =>
      listIncludesValueLower(otherPermanentTypes, type)
    );
    if (otherPermanent) {
      return toTitleCase(otherPermanent);
    }
    const nonPermanent = face.types.findLast(type =>
      listIncludesValueLower(nonPermanentTypes, type)
    );
    if (nonPermanent) {
      return toTitleCase(nonPermanent);
    }
  }
  return toTitleCase((face.types ?? face.supertypes ?? face.subtypes ?? '').at(-1) ?? '');
};

/**
 * Converts an HC face to cockatrice face props
 * @param face face to convert
 */
const hcFaceToCockProps = (face: faceType): CockFaceProps => {
  const cockFace: CockFaceProps = {
    name: face.export_name || face.name,
    text: face.oracle_text.replaceAll(/\\n/g, '\n').replaceAll(/\{(.)\}/g, '$1'),
    layout: hcToCockLayout[face.layout],
    type: face.type_line,
    maintype: getMainType(face),
    manacost: face.mana_cost,
    cmc: face.mana_value,
  };
  if (face.colors.length) {
    cockFace.colors = orderColors(face.colors);
  }
  if (face.image) {
    cockFace.picurl = face.image;
  }
  if (face.power || face.toughness) {
    const [powers, toughnesses] = [face.power?.split(' // '), face.toughness?.split(' // ')];

    cockFace.pt = (powers?.[0] || '') + '/' + (toughnesses?.[0] || '');
    if (powers && toughnesses) {
      if (powers.length > 1 || toughnesses.length > 1) {
        for (let i = 1; i < Math.max(powers.length, toughnesses.length); i++) {
          cockFace.pt += ` // ${powers[i] || ''}/${toughnesses[i] || ''}`;
        }
      }
    } else if (powers) {
      if (powers.length > 1) {
        for (let i = 1; i < powers.length; i++) {
          cockFace.pt += ` // ${powers[i] || ''}/`;
        }
      }
    } else {
      if (toughnesses!.length > 1) {
        for (let i = 1; i < toughnesses!.length; i++) {
          cockFace.pt += ` // /${toughnesses![i] || ''}`;
        }
      }
    }
  }
  if (face.loyalty || face.defense) {
    cockFace.loyalty = face.loyalty ? face.loyalty : face.defense;
  }
  return cockFace;
};

/**
 * Convert an hc all_parts array to a cockatrice related props array
 * @param all_parts hc all_parts array
 * @returns cockatrice related props array
 */
const hcAllPartsToCockRelated = (all_parts: HCRelatedCard[]): CockRelatedProps[] => {
  const cockRelateds: CockRelatedProps[] = [];
  all_parts.forEach(part => {
    switch (part.component) {
      case 'meld_result': {
        const related: CockRelatedProps = {
          id: part.id,
          reverse: '',
          attach: 'transform',
        };
        cockRelateds.push(related);
        break;
      }
      // case 'meld_part': {
      //   const related: CockRelatedProps = {
      //     id: part.id,
      //     reverse: 'reverse-',
      //     attach: 'transform',
      //   };
      //   cockRelateds.push(related);
      //   break;
      // }
      // case 'token': {
      //   const related: CockRelatedProps = {
      //     id: part.id,
      //     reverse: '',
      //   };
      //   if (part.persistent) {
      //     related.persistent = 'persistent';
      //   }
      //   if (part.count) {
      //     related.count = part.count;
      //   }
      //   cockRelateds.push(related);
      //   break;
      // }
      case 'token_maker': {
        const related: CockRelatedProps = {
          id: part.id,
          reverse: 'reverse-',
        };
        if (part.persistent) {
          related.persistent = 'persistent';
        }
        if (part.count) {
          related.count = part.count;
        }
        cockRelateds.push(related);
        break;
      }
    }
  });
  return cockRelateds;
};

/**
 * Compresses the card faces of a card to make it suitable for export (only for use with cockatrice)
 * @param card card to compress
 */
const compressHCCardFaces = (card: HCCard.Any): HCCard.Any => {
  const newCard = structuredClone(card);
  if ('card_faces' in newCard) {
    const goingToCompressAll = Boolean(
      newCard.card_faces.length > 2 &&
        newCard.card_faces.filter(face => !face.compress_face && !face.drop_face).length == 1
    );
    for (let i = newCard.card_faces.length - 1; i > 0; i--) {
      if (i == 3 && newCard.card_faces[2].layout == 'transform') {
        newCard.card_faces[i - 1] = mergeHCCardFaces([
          newCard.card_faces[i],
          newCard.card_faces[i - 1],
        ]);
        newCard.card_faces.splice(i, 1);
      } else if (newCard.card_faces[i].compress_face) {
        newCard.card_faces[i - 1] = mergeHCCardFaces([
          newCard.card_faces[i - 1],
          newCard.card_faces[i],
        ]);
        newCard.card_faces.splice(i, 1);
      } else if (newCard.card_faces[i].drop_face) {
        newCard.card_faces.splice(i, 1);
      }
    }

    // compress down to 1 side and use front image if there are still too many sides
    if (goingToCompressAll || !newCard.card_faces[0].image) {
      newCard.card_faces[0].image = newCard.image;
    }
  }
  if (card.layout == HCLayout.Cube) {
    newCard.name = card.export_name ?? card.name;
  }
  return newCard;
};
/**
 * Convert an hc card to cockatrice props
 * @param card card to convert
 * @returns cockatrice props
 */
export const hcCardToCockProps = (uncompressedCard: HCCard.Any): CockCardProps => {
  const card = compressHCCardFaces(uncompressedCard);
  const cockCard: CockCardProps = {
    coloridentity: card.color_identity.join(''),
    uuid: card.id,
    hcid: card.hcid,
    props: [],
    set: card.set,
  };
  if (card.collector_number) {
    cockCard.collector_number = card.collector_number;
  }
  if (!canBeInDecks(card)) {
    cockCard.token = '1';
  }
  Object.entries(card.legalities).forEach(([key, value]) => {
    if (value == 'legal') {
      cockCard['format-' + key] = 'legal';
    }
  });
  if ('card_faces' in card) {
    card.card_faces.forEach(face => cockCard.props.push(hcFaceToCockProps(face)));
    if (hasTokenHCID(card) && card.card_faces.length == 1 && !card.card_faces[0].export_name) {
      cockCard.props[0].name = card.hcid;
    }
  } else {
    cockCard.props.push(hcFaceToCockProps(card));
    if (hasTokenHCID(card) && !card.export_name) {
      cockCard.props[0].name = card.hcid;
    }
  }
  if (card.all_parts) {
    cockCard.related = hcAllPartsToCockRelated(card.all_parts);
  }
  return cockCard;
};
