import { ScryfallCard, ScryfallImageUris, ScryfallLayout } from '@scryfall/api-types';
import {
  HCCard,
  HCLayout,
  HCImageStatus,
  HCFrame,
  HCKind,
  HCLayoutGroup,
  HCFrameEffect,
} from '@hellfall/shared/types';
import {
  addProp,
  addPropToFace,
  deletePropFromFace,
  facePropType,
  faceValueType,
  fromImportMana,
  getDefaultCard,
  propType,
  pushPropToCard,
  pushPropToFace,
  valueType,
} from '@hellfall/shared/utils';
export type fixedScryfall = Exclude<ScryfallCard.Any, ScryfallCard.ReversibleCard>;

export const ScryfallToHC = (entry: fixedScryfall, asToken: boolean = true): HCCard.Any => {
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
    // @ts-ignore not in api yet
    case: HCLayout.Case,
    adventure: HCLayout.Inset,
    // @ts-ignore not in api yet
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
    // @ts-ignore not in api yet
    case: HCLayout.RealCardToken,
    adventure: HCLayout.RealCardMultiToken,
    // @ts-ignore not in api yet
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
  const italicsReplaceKeys: facePropType[] = ['flavor_text', 'oracle_text'];
  const sameKeys: propType[] = [
    'object',
    'id',
    'oracle_id',
    'name',
    'type_line',
    'power',
    'toughness',
    'loyalty',
    'defense',
    'hand_modifier',
    'life_modifier',
    'attraction_lights',
    'colors',
    'color_indicator',
    'color_identity',
    'watermark',
    'border_color',
    'frame_effects',
  ];

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
  const supers: string[] = ['Basic', 'Elite', 'Legendary', 'Ongoing', 'Snow', 'Token', 'World'];

  const card = getDefaultCard(
    HCKind.Scryfall,
    'card_faces' in entry,
    {
      ...(Object.entries(entry) as { [K in propType]: [K, valueType<K>] }[propType][]).filter(
        ([key, value]) => sameKeys.includes(key as propType)
      ),
      id_is_scryfall: true,
      oracle_id_is_scryfall: true,
      set: 'SFT',
      mana_value: entry.cmc,
      image_status: HCImageStatus.HighRes,
    },
    {}
  );
  if ('card_faces' in entry && 'card_faces' in card) {
    entry.card_faces.forEach((face, i) => {
      (
        Object.entries(face) as { [K in facePropType]: [K, faceValueType<K>] }[facePropType][]
      ).forEach(([prop, value]) => {
        if (sameKeys.includes(prop as propType)) {
          addPropToFace(card, prop, value, i);
        } else if (prop == 'mana_cost') {
          addPropToFace(card, prop, fromImportMana(value), i);
        } else if (italicsReplaceKeys.includes(prop)) {
          addPropToFace(card, prop, fromImportMana((value as string).replaceAll('\n', '\\n')), i);
        }
        if (prop == 'type_line') {
          const [before, after] = value.split(' — ');
          before.split(' ').forEach(word => {
            if (supers.includes(word)) {
              pushPropToFace(card, 'supertypes', word, i);
            } else if (word == 'Card') {
              addProp(card, 'layout', HCLayout.MultiReminder as HCLayoutGroup.SingleFacedType);
              addPropToFace(card, 'layout', HCLayout.Reminder, i);
              pushPropToFace(card, 'types', 'Reminder Card', i);
            } else {
              pushPropToFace(card, 'types', word, i);
            }
          });
          after?.split(' ').forEach(word => pushPropToFace(card, 'subtypes', word, i));
        }
      });
      if ('image_uris' in face) {
        addPropToFace(card, 'image', (face.image_uris as ScryfallImageUris).large, i);
        addPropToFace(card, 'image_status', HCImageStatus.HighRes, i);
      }
    });
  }
  (Object.entries(entry) as { [K in propType]: [K, valueType<K>] }[propType][]).forEach(
    ([prop, value]) => {
      if (prop == 'mana_cost') {
        addProp(card, prop, fromImportMana(value));
      } else if (italicsReplaceKeys.includes(prop as facePropType)) {
        addProp(card, prop, fromImportMana((value as string).replaceAll('\n', '\\n')));
      } else if (prop == 'type_line' && !('card_faces' in card)) {
        const [before, after] = value.split(' — ');
        before.split(' ').forEach(word => {
          if (supers.includes(word)) {
            pushPropToCard(card, 'supertypes', word);
          } else if (word == 'Card') {
            addProp(card, 'layout', HCLayout.Reminder);
            pushPropToCard(card, 'types', 'Reminder Card');
          } else {
            if (word == 'Dungeon') {
              addProp(card, 'layout', HCLayout.Dungeon);
            }
            pushPropToCard(card, 'types', word);
          }
        });
        after?.split(' ').forEach(word => pushPropToCard(card, 'subtypes', word));
      } else if (prop == 'layout') {
        addProp(
          card,
          prop,
          convertLayout(value as ScryfallLayout) as HCLayoutGroup.SingleFacedType
        );
      } else if (prop == 'keywords') {
        addProp(
          card,
          prop,
          value.map((keyword: string) => keyword.toLowerCase().replace('!', ''))
        );
        card.keywords.forEach(keyword => {
          if (keyword in subKeywords) {
            pushPropToCard(card, prop, subKeywords[keyword]);
          }
        });
      } else if (prop == 'frame') {
        const isNewToken =
          value == '2015' &&
          entry.set_type == 'token' &&
          (entry.released_at.slice(0, 3) != '201' ||
            (entry.released_at.slice(0, 4) == '2019' &&
              parseInt(entry.released_at.slice(5, 7)) > 6));
        addProp(
          card,
          prop,
          ((entry.set_type == 'token' ? 'token_' : '') + (isNewToken ? '2020' : value)) as HCFrame
        );
      }
    }
  );
  if ('image_uris' in entry) {
    addProp(card, 'image', (entry.image_uris as ScryfallImageUris).large);
    addProp(card, 'image_status', HCImageStatus.HighRes);
  }
  if (entry.full_art) {
    pushPropToCard(card, 'frame_effects', HCFrameEffect.FullArt);
  }
  if (!entry.finishes.includes('nonfoil')) {
    addProp(card, 'finish', 'foil');
  }
  if (entry.layout == 'token' && entry.type_line == 'Creature') {
    addProp(card, 'layout', HCLayout.Reminder);
  }

  if ('card_faces' in card) {
    if (card.card_faces[0].colors.length && !card.colors.length) {
      card.colors = card.card_faces[0].colors;
    } else if (!card.card_faces[0].colors.length && card.colors.length) {
      card.card_faces[0].colors = card.colors;
    }
    if (!card.image && card.card_faces[0].image) {
      card.image = card.card_faces[0].image;
      deletePropFromFace(card, 'image', 0);
      [card.image_status, card.card_faces[0].image_status] = [
        card.card_faces[0].image_status,
        card.image_status,
      ];
    }
  }
  // setDerivedProps(card);
  return card;
};
