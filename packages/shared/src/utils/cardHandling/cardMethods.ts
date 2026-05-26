import { HCCard, HCCardFace, HCColors } from '@hellfall/shared/types';
import { listShareLower } from '../listHandling';
import { facePropOrder, partPropOrder, propOrder } from './orderProps';
import { getIndicatorFromColors } from '../pipsHandling';
import {
  allPropType,
  allValueType,
  bothPropType,
  bothType,
  bothValueType,
  colorPropType,
} from './propTypes';
import { getMasterpiece, getSetCode, stripMasterpiece, stripSetCode, textEquals } from '../textHandling';
import { cardMap, toCardMap } from './cardMap';

/**
 * Converts the card to an array of its faces.
 * For single-faced cards, returns an array with the card itself.
 * For multi-faced cards, returns the card_faces array.
 *
 * Make sure you only try to work with props that exist on both `HCCard.AnySingleFaced` and `HCCardFace.MultiFaced`.
 * @param card card to get the faces of
 * @returns
 */
export const toFaces = (card: HCCard.Any): bothType[] => {
  if ('card_faces' in card) {
    return card.card_faces as bothType[];
  }
  return [card] as bothType[];
};

const asArray = <T>(value: T) => {};

/**
 * Gets the value of a prop from each face of a card (excluding the main part for multiface cards)
 * @param card card to get the value from
 * @param prop prop to get the value of (must be a prop that exists on both `HCCard.AnySingleFaced` and `HCCardFace.MultiFaced`)
 * @returns
 */
export const getFromFaces = <K extends bothPropType>(
  card: HCCard.Any,
  prop: K
): bothValueType<K>[] =>
  toFaces(card).flatMap(face =>
    Array.isArray(face[prop]) ? face[prop] : [face[prop] ?? []].flat()
  );

/**
 * Gets the value of a prop from each face of a card without flattening it (excluding the main part for multiface cards)
 * @param card card to get the value from
 * @param prop prop to get the value of (must be a prop that exists on both `HCCard.Any` and `HCCardFace.MultiFaced`)
 * @returns
 */
export const getColorsFromFaces = (card: HCCard.Any, prop: colorPropType): HCColors[] =>
  toFaces(card).flatMap(face => [face[prop] ?? []]);

/**
 * Gets the value of a prop from each face of a card (including the main part for multiface cards)
 * @param card card to get the value from
 * @param prop prop to get the value of
 * @returns
 */

export const getFromAll = <K extends allPropType>(card: HCCard.Any, prop: K): allValueType<K>[] => [
  ...('card_faces' in card ? (Array.isArray(card[prop]) ? card[prop] : [card[prop] ?? []]) : []),
  ...getFromFaces(card, prop),
];

export const addToJSONToCard = (card: HCCard.Any): HCCard.Any => {
  if (card.hasOwnProperty('toJSON')) {
    return card;
  }
  const ignoreLeftovers = ['toJSON'];
  Object.defineProperty(card, 'toJSON', {
    value: function (this: Record<string, any>) {
      const ordered: Record<string, any> = {};
      propOrder.forEach(prop => {
        if (prop in this) {
          ordered[prop] = this[prop];
        }
      });
      const leftovers = (Object.keys(this) as (typeof propOrder)[number][]).filter(
        left => !propOrder.includes(left) && !ignoreLeftovers.includes(left)
      );
      if (leftovers.length) {
        // You forgot a prop.
        throw console.error(`You forgot one or more card props: ${leftovers}`);
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
            throw console.error(`You forgot one or more face props: ${leftovers}`);
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
            throw console.error(`You forgot one or more part props: ${leftovers}`);
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
export const addToJSONToCards = (cards: HCCard.Any[]): HCCard.Any[] =>
  cards.map(card => addToJSONToCard(card));

const faceToPlainText = (face: bothType): string => {
  let text = face.name;
  if (face.mana_cost) {
    text += ` ${face.mana_cost}`;
  }
  if (face.color_indicator) {
    text += `\n${getIndicatorFromColors(face.color_indicator)?.english}`;
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

export const toPlainText = (card: HCCard.Any) =>
  toFaces(card)
    .map(face => faceToPlainText(face))
    .join('\n---\n');

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

export const filterMap =<K, V>(map: Map<K, V>, predicate: (value: V, key: K) => boolean|undefined): Map<K, V> => {
  const subset = new Map<K, V>();
  for (const [key, value] of map) {
    if (predicate(value, key)) {
      subset.set(key, value);
    }
  }
  return subset;
}

export const getAllRelated = (card: HCCard.Any, cardMap: cardMap): cardMap =>
  toCardMap((card.all_parts?.flatMap(part => cardMap.get(part.id) ?? cardMap.values().find(related=>textEquals(part.id,related.id)) ?? cardMap.values().find(related=>textEquals(part.name,related.name)) ?? []) ?? [])); // #uuid:hcid (only for second one)

export const getRelatedsFromCards = (
  cardList: HCCard.Any[],
  allCards: HCCard.Any[],
  keepIrrelevantParts?: boolean
): { cards: HCCard.Any[]; tokens: HCCard.Any[] } => {
  const tokens: HCCard.Any[] = [];
  const cards: HCCard.Any[] = cardList.map(card => {
    if (!card.all_parts) return card;
    for (let i = card.all_parts.length - 1; i >= 0; i--) {
      const part = card.all_parts[i];
      if (cardList.some(c => c.id == part.id)) {
        continue;
      }
      if (part.component == 'token_maker') {
        card.all_parts.splice(i, 1);
        continue;
      }
      const token = allCards.find(c => c.id == part.id);
      if (token && !tokens.find(t => t.id == token.id)) {
        tokens.push(token);
      }
    }
    return card;
  });
  if (!keepIrrelevantParts) {
    tokens.forEach(token => {
      if (!token.all_parts) return;
      for (let i = token.all_parts.length - 1; i >= 0; i--) {
        const part = token.all_parts[i];
        if (!cardList.some(c => c.id == part.id) && !tokens.some(t => t.id == part.id)) {
          token.all_parts.splice(i, 1);
        }
      }
    });
  }
  return { cards, tokens };
};
