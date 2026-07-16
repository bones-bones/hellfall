import {
  HCCard,
  HCCardFace,
  HCColors,
  SetCode,
  allElementValueType,
  allPropType,
  colorPropType,
  faceElementValueType,
  facePropType,
  faceType,
  facePropOrder,
  partPropOrder,
  anyPropOrder,
  HCObject,
  HCKind,
  HCLayout,
  HCImageStatus,
  HCLegality,
  HCBorderColor,
  HCFinish,
  HCFrame,
} from '@hellfall/shared/types';
import {
  ensureArray,
  listIncludesValueLower,
  listsShareLower,
  textListIncludes,
  textListsShare,
} from '../listHandling';
import {
  getMasterpiece,
  getSetCode,
  stripMasterpiece,
  stripSetCode,
  textEquals,
} from '../textHandling';
import { CardMap } from './cardMap';
import { pipMap } from '../pipsAndColors';

/**
 * Converts the card to an array of its faces.
 * For single-faced cards, returns an array with the card itself.
 * For multi-faced cards, returns the card_faces array.
 *
 * Make sure you only try to work with props of type {@linkcode facePropType}.
 * @param card card to get the faces of
 * @param dropFaces whether to exclude faces with `drop_face: true`
 * @returns an array of objects of type {@link faceType}
 */
export const toFaces = (card: HCCard.Any, dropFaces?: boolean): faceType[] => {
  if ('card_faces' in card) {
    if (dropFaces) {
      return card.card_faces.filter(face => !face.drop_face);
    }
    return card.card_faces;
  }
  return [card];
};

/**
 * Gets the value of a prop from each face of a card (excluding the main part for multiface cards)
 * @template K type of the prop (must extend {@linkcode facePropType})
 * @param card card to get the value from
 * @param prop prop to get the value of
 * @param dropFaces whether to exclude faces with `drop_face: true`
 */
export const getFromFaces = <K extends facePropType>(
  card: HCCard.Any,
  prop: K,
  dropFaces?: boolean
): faceElementValueType<K>[] =>
  toFaces(card, dropFaces).flatMap(face => ensureArray(face[prop] as any));

/**
 * Gets the value of a prop from each face of a card without flattening it
 * (excluding the main part for multiface cards)
 * @param card card to get the value from
 * @param prop prop to get the value of (must be `color` or `color_indicator`)
 * @param dropFaces whether to exclude faces with `drop_face: true`
 */
export const getColorsFromFaces = (
  card: HCCard.Any,
  prop: colorPropType,
  dropFaces?: boolean
): HCColors[] => toFaces(card, dropFaces).flatMap(face => [face[prop] ?? []]);

const fixCosts = (value: string[]) => {
  const filtered = value.filter(Boolean);
  if (filtered.length) {
    return filtered;
  }
  return [''];
};

/**
 * Gets the mana cost of each face of a card (excluding the main part for multiface cards)
 * @param card card to get the costs from
 * @param dropFaces whether to exclude faces with `drop_face: true`
 */
export const getCostsFromFaces = (card: HCCard.Any, dropFaces?: boolean): string[] =>
  toFaces(card, dropFaces).map(face => face.mana_cost);

/**
 * Gets the mana cost of each face of a card, dropping duplicate blanks
 * @param card card to get the costs from
 * @param dropFaces whether to exclude faces with `drop_face: true`
 */
export const getFixedCostsFromFaces = (card: HCCard.Any, dropFaces?: boolean): string[] =>
  fixCosts(getCostsFromFaces(card, dropFaces));

/**
 * Checks whether a face is a permanent
 * @param face face to check
 */
export const faceIsPermanent = (face: faceType) =>
  textListsShare(face.types, [
    'artifact',
    'battle',
    'creature',
    'enchantment',
    'land',
    'planeswalker',
  ]);

/**
 * Checks whether a card is a permanent
 * @param card card to check
 * @param dropFaces whether to exclude faces with `drop_face: true`
 */
export const cardIsPermanent = (card: HCCard.Any, dropFaces?: boolean) =>
  toFaces(card, dropFaces).some(face => faceIsPermanent(face));

/**
 * Converts the card to an array of its faces that are permanents.
 * For single-faced cards, returns an array with the card itself.
 * For multi-faced cards, returns the card_faces array.
 *
 * Make sure you only try to work with props of type {@linkcode facePropType}.
 * @param card card to get the faces of
 * @param dropFaces whether to exclude faces with `drop_face: true`
 * @returns an array of objects of type {@link faceType}
 */
export const toPermanentFaces = (card: HCCard.Any, dropFaces?: boolean) =>
  toFaces(card, dropFaces).filter(faceIsPermanent);
/**
 * Gets the mana cost of each permanent face of a card, dropping duplicate blanks
 * @param card card to get the costs from
 * @param dropFaces whether to exclude faces with `drop_face: true`
 */
export const getCostsFromPermanentFaces = (card: HCCard.Any, dropFaces?: boolean) =>
  fixCosts(
    toFaces(card, dropFaces)
      .filter(faceIsPermanent)
      .map(face => face.mana_cost)
  );

/**
 * Checks whether a face is historic
 * @param face face to check
 */
export const faceIsHistoric = (face: faceType) =>
  textListIncludes(face.supertypes, 'legendary') ||
  textListIncludes(face.types, 'artifact') ||
  textListIncludes(face.subtypes, 'saga');

/**
 * Checks whether a card is historic
 * @param card card to check
 * @param dropFaces whether to exclude faces with `drop_face: true`
 */
export const cardIsHistoric = (card: HCCard.Any, dropFaces?: boolean) =>
  toFaces(card, dropFaces).some(face => faceIsHistoric(face));

/**
 * Gets the mana cost of each historic permanent face of a card, dropping duplicate blanks
 * @param card card to get the costs from
 * @param dropFaces whether to exclude faces with `drop_face: true`
 */
export const getCostsFromHistoricPermanentFaces = (card: HCCard.Any, dropFaces?: boolean) =>
  fixCosts(
    toFaces(card, dropFaces)
      .filter(faceIsPermanent)
      .filter(faceIsHistoric)
      .map(face => face.mana_cost)
  );

/**
 * Gets the value of a prop from each face of a card (including the main part for multiface cards)
 * @template K type of the prop (must extend {@linkcode allPropType})
 * @param card card to get the value from
 * @param prop prop to get the value of
 * @param dropFaces whether to exclude faces with `drop_face: true`
 */
export const getFromAll = <K extends allPropType>(
  card: HCCard.Any,
  prop: K,
  dropFaces?: boolean
): allElementValueType<K>[] => [
  ...('card_faces' in card
    ? ensureArray(
        (['mana_cost', 'type_line'].includes(prop) && dropFaces
          ? getFromFaces(card, prop, dropFaces).join(' // ')
          : card[prop]) as any
      )
    : []),
  ...getFromFaces(card, prop, dropFaces),
];

/**
 * Adds `toJSON()` to a card. Uses a predefined prop order.
 * @param card card to add `toJSON()` to
 */
export const addToJSONToCard = (card: HCCard.Any): HCCard.Any => {
  if (Object.prototype.hasOwnProperty.call(card, 'toJSON')) {
    return card;
  }
  const ignoreLeftovers = ['toJSON'];
  Object.defineProperty(card, 'toJSON', {
    value: function (this: Record<string, any>) {
      const ordered: Record<string, any> = {};
      anyPropOrder.forEach(prop => {
        if (prop in this) {
          ordered[prop] = this[prop];
        }
      });
      const leftovers = (Object.keys(this) as (typeof anyPropOrder)[number][]).filter(
        left => !anyPropOrder.includes(left) && !ignoreLeftovers.includes(left)
      );
      if (leftovers.length) {
        // You forgot a prop.
        throw new Error(`You forgot one or more card props: ${leftovers}`);
      }
      if (ordered.card_faces) {
        ordered.card_faces = this.card_faces.map((face: Record<string, any>) => {
          const orderedFace: Record<string, any> = {};
          facePropOrder.forEach(prop => {
            if (prop in face) {
              orderedFace[prop] = face[prop];
            }
          });
          const leftoverProps = (Object.keys(face) as (typeof facePropOrder)[number][]).filter(
            left => !facePropOrder.includes(left) && !ignoreLeftovers.includes(left)
          );
          if (leftoverProps.length) {
            // You forgot a prop.
            throw new Error(`You forgot one or more face props: ${leftovers}`);
          }
          return orderedFace;
        });
      }
      if (ordered.all_parts) {
        const faceNames = (this.card_faces || []).map((face: Record<string, any>) => face.name);
        const shouldBeAtTop = (part: Record<string, any>): number => {
          return (
            faceNames.includes(part.name) ||
            ['meld_part', 'meld_result', 'draft_partner'].includes(part.component)
          );
        };
        const sortedParts =
          'card_faces' in this
            ? [...this.all_parts].sort(
                (a: Record<string, any>, b: Record<string, any>) =>
                  shouldBeAtTop(b) - shouldBeAtTop(a)
              )
            : this.all_parts;
        // TODO: add ordering for the parts themselves©
        ordered.all_parts = sortedParts.map((part: Record<string, any>) => {
          const orderedPart: Record<string, any> = {};
          partPropOrder.forEach(prop => {
            if (prop in part) {
              orderedPart[prop] = part[prop];
            }
          });
          const leftoverProps = (Object.keys(part) as (typeof partPropOrder)[number][]).filter(
            left => !partPropOrder.includes(left) && !ignoreLeftovers.includes(left)
          );
          if (leftoverProps.length) {
            // You forgot a prop.
            throw new Error(`You forgot one or more part props: ${leftovers}`);
          }
          return orderedPart;
        });
      }
      return ordered;
    },
    enumerable: false,
    configurable: true,
    writable: true,
  });
  return card as HCCard.Any;
};

/**
 * Adds `toJSON()` to cards. Uses a predefined prop order.
 * @param cards cards to add `toJSON()` to
 */
export const addToJSONToCards = (cards: HCCard.Any[]): HCCard.Any[] =>
  cards.map(card => addToJSONToCard(card));

const faceToPlainText = (face: faceType): string => {
  let text = face.name;
  if (face.mana_cost) {
    text += ` ${face.mana_cost}`;
  }
  if (face.color_indicator) {
    text += `\n${pipMap.getIndicator(face.color_indicator)?.english}`;
  }
  if (face.type_line) {
    text += `\n${face.type_line}`;
  }
  if (face.oracle_text) {
    text += `\n${face.oracle_text.replaceAll('\\n', '\n')}`;
  }
  if (face.power || face.toughness) {
    text += `\n${face.power}/${face.toughness}`;
  }
  if (face.loyalty) {
    text += `\nLoyalty: ${face.loyalty}`;
  }
  if (face.defense) {
    text += `\nDefense: ${face.defense}`;
  }
  if (face.hand_modifier) {
    text += `\nHand Size: ${face.hand_modifier}`;
  }
  if (face.life_modifier) {
    text += `\nStarting Life: ${face.life_modifier}`;
  }
  return text;
};

/**
 * Converts a card to plain text.
 * @param card card to convert to plain text
 */
export const toPlainText = (card: HCCard.Any) =>
  toFaces(card)
    .map(face => faceToPlainText(face))
    .join('\n---\n');

/**
 * Gets all names for a card other than its normal name (for accessibility)
 * @param card card to get other names for
 */
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

/**
 * Gets all names for a card that would be an exact match (for filters)
 * @param card card to get all names for
 * @param dropFaces whether to exclude faces with `drop_face: true`
 */
export const getAllNames = (card: HCCard.Any, dropFaces?: boolean): string[] => {
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
    toFaces(card, dropFaces).forEach((face, i) => {
      if (face.flavor_name) {
        names.push(face.flavor_name);
      }
      names.push(face.name);
      let name = face.name;
      toFaces(card, dropFaces)
        .slice(i + 1)
        .forEach(f => {
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

/**
 * Checks whether a card can be a commander.
 * @param card card to check
 */
export const canBeACommander = (card: HCCard.Any) => {
  const faces = toFaces(card);
  return (
    ((listIncludesValueLower(faces[0].supertypes, 'legendary') &&
      (listIncludesValueLower(faces[0].types, 'creature') ||
        listsShareLower(faces[0].subtypes, ['vehicle', 'spacecraft', 'watercraft']))) ||
      faces[0].oracle_text.toLowerCase().includes('can be your commander')) &&
    !faces[0].oracle_text.toLowerCase().includes('irresponsible')
  );
};

const PLACEHOLDER_CARD: HCCard.Normal = {
  object: HCObject.ObjectType.Card,
  id: '55555555-5555-4555-a555-555555555555',
  oracle_id: '55555555-5555-4555-a555-555555555555',
  collector_number: '555',
  hcid: 'hc5-placeholder',
  kind: HCKind.Card,
  layout: HCLayout.Normal,
  name: '◻︎◻︎◻︎◻︎◻︎◻︎◻︎◻︎◻︎',
  image: 'https://ist8-2.filesor.com/pimpandhost.com/2/6/5/8/265896/i/G/l/i/iGlik/images.png',
  image_status: HCImageStatus.Placeholder,
  mana_value: 0,
  creators: ['◻︎◻︎◻︎◻︎'],
  set: 'HC5',
  rulings: '',
  type_line: 'Card',
  oracle_text: '',
  mana_cost: '',
  color_identity: [],
  colors: [],
  keywords: [],
  legalities: {
    standard: HCLegality.Legal,
    '4cb': HCLegality.Legal,
    commander: HCLegality.Legal,
  },
  color_identity_hybrid: [],
  border_color: HCBorderColor.Black,
  finish: HCFinish.Nonfoil,
  frame: HCFrame.Stamp,
};

/**
 * Generates the `CardMap` for {@linkcode SetCode | SetCode: HC5}
 */
export const getHc5 = (): CardMap =>
  new CardMap(
    Array.from({ length: 720 }, (_, i) =>
      addToJSONToCard({
        ...PLACEHOLDER_CARD,
        id: `55555555-5555-4${i.toString().padStart(3, '0')}-a555-555555555555`,
        oracle_id: '55555555-5555-4555-a555-555555555555',
        hcid: `hc5-placeholder-${i}`,
        name: `◻︎◻︎◻︎◻︎◻︎◻︎◻︎◻︎◻︎ ${i}`,
      })
    )
  );

/**
 * Gets all related cards to a given card
 * @param card card to get the related cards to
 * @param cardMap CardMap containing all cards
 *
 * This version will also try to match hcid and name, so it's exhaustive,
 * but it's not suitable for use on the frontend due to its slowness
 *
 * For a fast version, use {@linkcode getAllRelated}
 */
export const getAllRelatedPermissive = (card: HCCard.Any, cardMap: CardMap): CardMap =>
  new CardMap(
    card.all_parts?.flatMap(
      part =>
        cardMap.get(part.id) ??
        cardMap.find(related => textEquals(part.hcid, related.hcid)) ??
        cardMap.find(related => textEquals(part.name, related.name)) ??
        []
    ) ?? []
  );

/**
 * Gets all related cards to a given card
 * @param card card to get the related cards to
 * @param cardMap CardMap containing all cards
 *
 * This version won't also try to match hcid and name, so it's fast,
 * but it's not suitable for use on the backend
 *
 * For an exhaustive version, use {@linkcode getAllRelatedPermissive}
 */
export const getAllRelated = (card: HCCard.Any, cardMap: CardMap): CardMap =>
  cardMap.getSubset(card.all_parts?.map(part => part.id) ?? []);

/**
 * Gets the cards and tokens for a list of card ids
 * @param idList List of card ids to get
 * @param cardMap CardMap containing all cards
 * @returns
 */
export const getRelatedsFromCards = (
  idList: string[],
  cardMap: CardMap
): { cards: CardMap; tokens: CardMap } => {
  const cards: CardMap = cardMap.getSubset(idList);
  const tokens: CardMap = cardMap.getSubset(
    cards.flatMap(
      card =>
        card.all_parts?.flatMap(part =>
          !cards.has(part.id) && part.component != 'token_maker' ? part.id : []
        ) ?? []
    )
  );
  return { cards, tokens };
};

/**
 * Gets the cards and tokens for a set
 * @param set the set to get
 * @param cardMap CardMap containing all cards
 * @param moveNonDraftablesToTokens whether to move cards in the set that aren't directly draftable
 * into tokens (set to true when exporting to draftmancer)
 */
export const getRelatedsFromSet = (
  set: SetCode,
  cardMap: CardMap,
  moveNonDraftablesToTokens: boolean = false
): { cards: CardMap; tokens: CardMap } => {
  if (set == 'HC5') {
    return { cards: getHc5(), tokens: new CardMap() };
  }
  if (set == 'HCJ' && moveNonDraftablesToTokens) {
    const { cards, tokens } = getRelatedsFromSet(set, cardMap, false);
    cards.setMultiple(tokens);
    const fronts = cards.getAllInSet('FHCJ');
    cards.deleteMultiple(fronts.ids());
    return { cards: fronts, tokens: cards };
  }
  const cards: CardMap = cardMap.getAllInSetDirect(set);
  const tokens: CardMap = cardMap.getSubset(
    cards.flatMap(
      card =>
        card.all_parts?.flatMap(part =>
          !part.set.includes(set) && part.component != 'token_maker' ? part.id : []
        ) ?? []
    )
  );
  if (moveNonDraftablesToTokens) {
    cards.forEach((card: HCCard.Any, id: string) => {
      if (card.not_directly_draftable) {
        tokens.set(card);
        cards.delete(id);
      }
    });
  }
  return { cards, tokens };
};
