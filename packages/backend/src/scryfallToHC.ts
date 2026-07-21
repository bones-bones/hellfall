import { ScryfallCard, ScryfallImageUris, ScryfallLayout } from '@scryfall/api-types';
import {
  HCCard,
  HCLayout,
  HCImageStatus,
  HCFrame,
  HCKind,
  HCFrameEffect,
  HCFinish,
  anyPropType,
  facePropType,
  rootPropType,
  getAnyEntries,
  anyMappedType,
  getFaceEntries,
  faceMappedType,
} from '@hellfall/shared/types';
import {
  addPropToFace,
  addPropToRoot,
  deletePropFromFace,
  fromImportMana,
  getDefaultCard,
  pushPropToRoot,
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
  const sameKeys: anyPropType[] = [
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

  // TODO: switch to using root/faces code pattern
  const card = getDefaultCard(
    HCKind.Scryfall,
    'card_faces' in entry,
    {
      ...Object.fromEntries(
        getAnyEntries(entry as unknown as anyMappedType).filter(([key, value]) =>
          sameKeys.includes(key)
        )
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
      getFaceEntries(face as faceMappedType).forEach(([prop, value]) => {
        if (sameKeys.includes(prop)) {
          addPropToFace(card, prop, value, i);
        } else if (prop == 'mana_cost') {
          addPropToFace(card, prop, fromImportMana(value), i);
        } else if (italicsReplaceKeys.includes(prop)) {
          addPropToFace(card, prop, fromImportMana((value as string).replaceAll('\n', '\\n')), i);
        }
        if (prop == 'type_line') {
          const supertypes: string[] = [];
          const types: string[] = [];
          const subtypes: string[] = [];
          const [before, after] = value.split(' — ');
          before.split(' ').forEach(word => {
            if (supers.includes(word)) {
              supertypes.push(word);
            } else if (word == 'Card') {
              addPropToRoot(card, 'layout', HCLayout.MultiReminder);
              addPropToFace(card, 'layout', HCLayout.Reminder, i);
              types.push('Reminder Card');
            } else {
              types.push(word);
            }
          });
          after?.split(' ').forEach(word => subtypes.push(word));
          if (supertypes.length) {
            addPropToFace(card, 'supertypes', supertypes, i);
          }
          if (types.length) {
            addPropToFace(card, 'types', types, i);
          }
          if (subtypes.length) {
            addPropToFace(card, 'subtypes', subtypes, i);
          }
        }
      });
      if ('image_uris' in face) {
        addPropToFace(card, 'image', (face.image_uris as ScryfallImageUris).large, i);
        addPropToFace(card, 'image_status', HCImageStatus.HighRes, i);
      }
    });
  }
  getAnyEntries(entry as unknown as anyMappedType).forEach(([prop, value]) => {
    if (prop == 'mana_cost') {
      addPropToRoot(card, prop, fromImportMana(value));
    } else if (italicsReplaceKeys.includes(prop as facePropType)) {
      addPropToRoot(
        card,
        prop as rootPropType,
        fromImportMana((value as string).replaceAll('\n', '\\n'))
      );
    } else if (prop == 'type_line' && !('card_faces' in card)) {
      const supertypes: string[] = [];
      const types: string[] = [];
      const subtypes: string[] = [];
      const [before, after] = value.split(' — ');
      before.split(' ').forEach(word => {
        if (supers.includes(word)) {
          supertypes.push(word);
        } else if (word == 'Card') {
          addPropToRoot(card, 'layout', HCLayout.Reminder);
          types.push('Reminder Card');
        } else {
          if (word == 'Dungeon') {
            addPropToRoot(card, 'layout', HCLayout.Dungeon);
          }
          types.push(word);
        }
      });
      after?.split(' ').forEach(word => subtypes.push(word));
      if (supertypes.length) {
        addPropToFace(card, 'supertypes', supertypes);
      }
      if (types.length) {
        addPropToFace(card, 'types', types);
      }
      if (subtypes.length) {
        addPropToFace(card, 'subtypes', subtypes);
      }
    } else if (prop == 'layout') {
      addPropToRoot(card, prop, convertLayout(value as unknown as ScryfallLayout));
    } else if (prop == 'keywords') {
      value.forEach((keyword: string) =>
        pushPropToRoot(card, prop, keyword.toLowerCase().replace('!', ''))
      );
      card.keywords.forEach(keyword => {
        if (keyword in subKeywords) {
          pushPropToRoot(card, prop, subKeywords[keyword]);
        }
      });
    } else if (prop == 'frame') {
      const isNewToken =
        value == '2015' &&
        entry.set_type == 'token' &&
        (entry.released_at.slice(0, 3) != '201' ||
          (entry.released_at.slice(0, 4) == '2019' && parseInt(entry.released_at.slice(5, 7)) > 6));
      addPropToRoot(
        card,
        prop,
        ((entry.set_type == 'token' ? 'token_' : '') + (isNewToken ? '2020' : value)) as HCFrame
      );
    }
  });
  if ('image_uris' in entry) {
    addPropToRoot(card, 'image', (entry.image_uris as ScryfallImageUris).large);
    addPropToRoot(card, 'image_status', HCImageStatus.HighRes);
  }
  if (entry.full_art) {
    pushPropToRoot(card, 'frame_effects', HCFrameEffect.FullArt);
  }
  if (!entry.finishes.includes('nonfoil')) {
    addPropToRoot(card, 'finish', HCFinish.Foil);
  }
  if (entry.layout == 'token' && entry.type_line == 'Creature') {
    addPropToRoot(card, 'layout', HCLayout.Reminder);
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
