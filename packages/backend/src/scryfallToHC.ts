import {
  ScryfallCard,
  ScryfallCardFace,
  ScryfallImageUris,
  ScryfallLayout,
  ScryfallRelatedCard,
} from '@scryfall/api-types';
import {
  HCCard,
  HCCardFace,
  HCLayout,
  HCLegalitiesField,
  HCLegality,
  HCRelatedCard,
  HCColor,
  HCColors,
  HCImageStatus,
  HCFrame,
} from '@hellfall/shared/types';
import { setDerivedProps } from './derivedProps.ts';
export const ScryfallToHC = (card: ScryfallCard.Any, asToken: boolean = true): HCCard.Any => {
  const cardLayoutCorrespondences: Record<ScryfallLayout, HCLayout> = {
    normal: HCLayout.Normal,
    split: HCLayout.Split,
    flip: HCLayout.Flip,
    transform: HCLayout.Transform,
    modal_dfc: HCLayout.Modal,
    meld: HCLayout.MeldPart,
    leveler: HCLayout.Leveler,
    class: HCLayout.Class,
    saga: HCLayout.Saga,
    // @ts-ignore
    case: HCLayout.Case,
    adventure: HCLayout.Inset,
    // @ts-ignore
    prepare: HCLayout.Prepare,
    mutate: HCLayout.Mutate,
    prototype: HCLayout.Prototype,
    battle: HCLayout.Battle,
    planar: HCLayout.Planar,
    scheme: HCLayout.Scheme,
    vanguard: HCLayout.Vanguard,
    token: HCLayout.Token,
    double_faced_token: HCLayout.MultiToken,
    emblem: HCLayout.Emblem,
    augment: HCLayout.Normal,
    host: HCLayout.Normal,
    art_series: HCLayout.Misc,
    reversible_card: HCLayout.Misc,
  };
  const tokenLayoutCorrespondences: Record<ScryfallLayout, HCLayout> = {
    normal: HCLayout.RealCardToken,
    split: HCLayout.RealCardMultiToken,
    flip: HCLayout.RealCardMultiToken,
    transform: HCLayout.RealCardMultiToken,
    modal_dfc: HCLayout.RealCardMultiToken,
    meld: HCLayout.RealCardToken,
    leveler: HCLayout.RealCardToken,
    class: HCLayout.RealCardToken,
    saga: HCLayout.RealCardToken,
    // @ts-ignore
    case: HCLayout.RealCardToken,
    adventure: HCLayout.RealCardMultiToken,
    // @ts-ignore
    prepare: HCLayout.RealCardMultiToken,
    mutate: HCLayout.RealCardToken,
    prototype: HCLayout.RealCardToken,
    battle: HCLayout.RealCardToken,
    planar: HCLayout.RealCardToken,
    scheme: HCLayout.RealCardToken,
    vanguard: HCLayout.RealCardToken,
    token: HCLayout.Token,
    double_faced_token: HCLayout.MultiToken,
    emblem: HCLayout.Emblem,
    augment: HCLayout.RealCardToken,
    host: HCLayout.RealCardToken,
    art_series: HCLayout.NotMagic,
    reversible_card: HCLayout.MultiNotMagic,
  };
  const convertLayout = (layout: ScryfallLayout): HCLayout => {
    return asToken
      ? layout in tokenLayoutCorrespondences
        ? tokenLayoutCorrespondences[layout]
        : HCLayout.Token
      : layout in cardLayoutCorrespondences
      ? cardLayoutCorrespondences[layout]
      : HCLayout.Normal;
  };
  const italicsReplaceKeys: string[] = ['name', 'flavor_text', 'oracle_text'];
  const sameKeys: string[] = [
    'oracle_id',
    'hand_modifier',
    'life_modifier',
    'defense',
    'loyalty',
    'power',
    'toughness',
    'mana_cost',
    'watermark',
    'attraction_lights',
    'type_line',
    'border_color',
    'frame',
  ];
  const keyCorrespondences: Record<string, any> = {
    id: 'scryfall_id',
    cmc: 'mana_value',
  };
  const defaultProps: Record<string, any> = {
    rulings: '',
    creators: [],
    legalities: {
      standard: asToken ? HCLegality.NotLegal : HCLegality.Banned,
      '4cb': asToken ? HCLegality.NotLegal : HCLegality.Banned,
      commander: asToken ? HCLegality.NotLegal : HCLegality.Banned,
    } as HCLegalitiesField,
    mana_value: 0,
    colors: [HCColor.Colorless] as HCColors,
    set: asToken ? 'SFT' : 'SFC',
    variation: false,
    image_status: HCImageStatus.HighRes,
    draft_image_status: HCImageStatus.Inapplicable,
    mana_cost: '',
  };
  const defaultMultiFaceProps: Record<string, any> = {
    mana_cost: '',
    mana_value: 0,
    colors: [HCColor.Colorless] as HCColors,
    oracle_text: '',
    image_status: HCImageStatus.Split,
    layout: HCLayout.Token,
  };
  const colorProps: string[] = ['colors', 'color_indicator', 'color_identity'];
  const subKeywords: Record<string, string> = {
    'commander ninjutsu': 'ninjutsu',
    gravestorm: 'storm',
    multikicker: 'kicker',
    'legendary landwalk': 'landwalk',
    'nonbasic landwalk': 'landwalk',
    megamorph: 'morph',
    plainswalk: 'landwalk',
    islandwalk: 'landwalk',
    swampwalk: 'landwalk',
    mountainwalk: 'landwalk',
    forestwalk: 'landwalk',
    desertwalk: 'landwalk',
    'double agenda': 'hidden agenda',
    'partner with': 'partner',
    'hexproof from': 'hexproof',
    plainscycling: 'cycling',
    islandscycling: 'cycling',
    swampcycling: 'cycling',
    mountaincycling: 'cycling',
    forestcycling: 'cycling',
    'basic landcycling': 'cycling',
    typecycling: 'cycling',
    wizardcycling: 'cycling',
    slivercycling: 'cycling',
    landcycling: 'cycling',
    'manifest dread': 'manifest',
  };
  const supers: string[] = [
    'Basic',
    'Elite',
    'Legendary',
    'Ongoing',
    'Snow',
    /**'Token', */ 'World',
  ];
  const fixPhyrexianMana = (text: string) => {
    if (text.includes('/P}')) {
      return text
        .split(/({[^]*?\/P})/)
        .map(subtext => (subtext.slice(-3) == '/P}' ? '{H/' + subtext.slice(1, -3) + '}' : subtext))
        .join('');
    } else {
      return text;
    }
  };
  const cardObject: Record<string, any> & { card_faces?: Record<string, any>[] } = {};
  Object.entries(card).forEach(([key, value]) => {
    if (key == 'card_faces') {
      cardObject.card_faces = [] as HCCardFace.MultiFaced[];
      (value as ScryfallCardFace.Any[]).forEach((face, index) => {
        cardObject.card_faces?.push({} as HCCardFace.MultiFaced);

        Object.entries(face).forEach(([k, v]) => {
          if (colorProps.includes(key)) {
            cardObject.card_faces![index][k] = (
              value.length ? value : [HCColor.Colorless]
            ) as HCColors;
          } else if (k == 'image_uris') {
            cardObject.card_faces![index].image = (v as ScryfallImageUris).large;
            cardObject.card_faces![index].image_status = HCImageStatus.HighRes;
          } else if (k in keyCorrespondences) {
            cardObject.card_faces![index][keyCorrespondences[k]] = v;
          } else if (k == 'mana_cost') {
            cardObject.card_faces![index][k] = fixPhyrexianMana(v as string);
          } else if (italicsReplaceKeys.includes(k)) {
            cardObject.card_faces![index][k] = fixPhyrexianMana(
              (v as string).replaceAll('\n', '\\n')
            );
          } else if (sameKeys.includes(k)) {
            cardObject.card_faces![index][k] = v;
          }
          if (k == 'type_line') {
            const [before, after] = (v as string).split(' — ');
            before.split(' ').forEach(word => {
              if (supers.includes(word)) {
                if (!('supertypes' in face)) {
                  cardObject.card_faces![index].supertypes = [];
                }
                cardObject.card_faces![index].supertypes.push(word);
              } else if (word != 'Token') {
                if (!('types' in face)) {
                  cardObject.card_faces![index].types = [];
                }
                if (word == 'Card') {
                  cardObject.layout = HCLayout.MultiReminder;
                  cardObject.card_faces![index].types.push('Reminder Card');
                } else {
                  cardObject.card_faces![index].types.push(word);
                }
              }
            });
            if (after) {
              after.split(' ').forEach(word => {
                if (!('subtypes' in face)) {
                  cardObject.card_faces![index].subtypes = [];
                }
                cardObject.card_faces![index].subtypes.push(word);
              });
            }
          }
        });
      });
    } else if (colorProps.includes(key)) {
      cardObject[key] = value as HCColors;
    } else if (key == 'image_uris') {
      cardObject.image = (value as ScryfallImageUris).large;
      cardObject.image_status = HCImageStatus.HighRes;
    } else if (key == 'layout' && !('layout' in cardObject)) {
      cardObject.layout = convertLayout(value as ScryfallLayout);
    } else if (key == 'keywords') {
      cardObject.keywords = value.map((keyword: string) => {
        return keyword.toLowerCase().replace('!', '');
      });
      cardObject.keywords.forEach((keyword: string) => {
        if (keyword in subKeywords) {
          cardObject.keywords.push(subKeywords[keyword]);
        }
      });
    } else if (key in keyCorrespondences) {
      cardObject[keyCorrespondences[key]] = value;
    } else if (key == 'mana_cost') {
      cardObject[key] = fixPhyrexianMana(value);
    } else if (italicsReplaceKeys.includes(key)) {
      cardObject[key] = fixPhyrexianMana(value.replaceAll('\n', '\\n'));
    } else if (key == 'frame') {
      // if it was released after June 2019, use the new token frame
      const isNewToken = value == '2015' && card.set_type == 'token' && (card.released_at.slice(0, 3) != '201' || (card.released_at.slice(0, 4) == '2019' && parseInt(card.released_at.slice(5, 7)) > 6))
      cardObject.frame = (card.set_type == 'token' ? 'token_' : '') + (isNewToken? '2020':value);
    } else if (sameKeys.includes(key)) {
      cardObject[key] = value;
    }
    if (key == 'type_line' && !('card_faces' in card)) {
      const [before, after] = (value as string).split(' — ');
      before.split(' ').forEach(word => {
        if (supers.includes(word)) {
          if (!('supertypes' in cardObject)) {
            cardObject.supertypes = [];
          }
          cardObject.supertypes.push(word);
        } else if (word != 'Token') {
          if (!('types' in cardObject)) {
            cardObject.types = [];
          }
          if (word == 'Card') {
            cardObject.layout = HCLayout.Reminder;
            cardObject.types.push('Reminder Card');
          } else {
            if (word == 'Dungeon') {
              cardObject.layout = HCLayout.Dungeon;
            }
            cardObject.types.push(word);
          }
        }
      });
      if (after) {
        after.split(' ').forEach(word => {
          if (!('subtypes' in cardObject)) {
            cardObject.subtypes = [];
          }
          cardObject.subtypes.push(word);
        });
      }
    }
  });
  cardObject.finish = card.finishes.includes('nonfoil') ? 'nonfoil' : 'foil';
  cardObject.id = card.id; // make sure to give correct ID using name for tokens
  if (card.layout == 'token' && card.type_line == 'Creature') {
    cardObject.layout = HCLayout.Reminder;
  }
  Object.entries(defaultProps).forEach(([key, value]) => {
    if (!(key in cardObject)) {
      cardObject[key] = value;
    }
  });
  if ('card_faces' in cardObject) {
    cardObject.card_faces = cardObject.card_faces?.map(face => {
      if (!('image' in cardObject) && 'image' in face) {
        cardObject.image = face.image;
        cardObject.image_status = face.image_status;
        delete face.image;
        face.image_status = HCImageStatus.Front;
      }
      Object.entries(defaultMultiFaceProps).forEach(([key, value]) => {
        if (!(key in face)) {
          face[key] = value;
        }
      });
      return face;
    });
  } else {
    Object.entries(defaultMultiFaceProps).forEach(([key, value]) => {
      if (!(key in cardObject)) {
        cardObject[key] = value;
      }
    });
  }
  if (asToken) {
    cardObject.isActualToken = true;
  }
  const cardFinal = cardObject as HCCard.Any;
  setDerivedProps(cardFinal);
  return cardFinal;
};
