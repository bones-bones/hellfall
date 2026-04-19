import { sheetsKey } from '../keys.ts';
import {
  HCCard,
  HCColor,
  HCColors,
  HCImageStatus,
  HCLayout,
  HCLegalitiesField,
  HCFormat,
  HCLegality,
  HCRelatedCard,
  HCObject,
  HCLayoutGroup,
  HCBorderColor,
  HCFrame,
  HCFinish,
  HCFrameEffect,
} from '@hellfall/shared/types';
import { getColorIdentityProps, setDerivedProps } from './derivedProps.ts';
import { stripMasterpiece } from '@hellfall/shared/utils/textHandling.ts';

export const fetchDatabase = async (usingApproved: boolean = false) => {
  const url = usingApproved
    ? `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Database?alt=json&key=${sheetsKey}`
    : `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Database+(Unapproved)?alt=json&key=${sheetsKey}`;
  const requestedData = await fetch(url);
  const asJson = (await requestedData.json()) as any;
  const [_garbage, _oldKeys, ...rest] = asJson.values as string[][];
  const keys = [
    'id',
    'name',
    'image',
    'creators',
    'set',
    'legalities',
    'related',
    'rulings',
    'mana_value',
    '0colors',
    '0mana_cost',
    '0supertypes',
    '0types',
    '0subtypes',
    '0power',
    '0toughness',
    '0loyalty',
    '0oracle_text',
    '0flavor_text',
    '0image',
    'tags',
    '1mana_cost',
    '1supertypes',
    '1types',
    '1subtypes',
    '1power',
    '1toughness',
    '1loyalty',
    '1oracle_text',
    '1flavor_text',
    '1image',
    '2mana_cost',
    '2supertypes',
    '2types',
    '2subtypes',
    '2power',
    '2toughness',
    '2loyalty',
    '2oracle_text',
    '2flavor_text',
    '2image',
    '3mana_cost',
    '3supertypes',
    '3types',
    '3subtypes',
    '3power',
    '3toughness',
    '3loyalty',
    '3oracle_text',
    '3flavor_text',
    '3image',
  ];
  rest.forEach(row => {
    while (row.length < keys.length) {
      row.push('');
    }
  });

  const defaultProps: Record<string, any> = {
    name: '',
    rulings: '',
    creators: [],
    legalities: {
      standard: HCLegality.Banned,
      '4cb': HCLegality.Banned,
      commander: HCLegality.Banned,
    } as HCLegalitiesField,
    mana_value: 0,
    colors: [] as HCColors,
    color_identity: [] as HCColors,
    color_identity_hybrid: [] as HCColors[],
    keywords: [],
    set: '',
    variation: false,
    draft_image_status: HCImageStatus.Inapplicable,
    border_color: HCBorderColor.Black,
    frame: HCFrame.Stamp,
    finish: HCFinish.Nonfoil,
  };

  const defaultMultiFaceProps: Record<string, any> = {
    mana_cost: '',
    mana_value: 0,
    colors: [] as HCColors,
    oracle_text: '',
  };

  const hardCardNames: string[] = [
    'Crypt of u/Em9500',
    '1d6',
    'Avatar of BallsJr123',
    'Sekiro for the PS4',
    'Avatar of Discord v2',
    'That One Time in WW1',
    'Plagiarism by doomclaw9',
    'Carrion Feeder from MH8',
  ];

  const multiLayoutTags: Record<string, HCLayoutGroup.MultiFacedType> = {
    meld: HCLayout.MeldPart,
    'draftpartner-faces': HCLayout.DraftPartner,
    'reminder-on-back': HCLayout.ReminderOnBack,
    'dungeon-in-inset': HCLayout.DungeonInInset,
    'dungeon-on-back': HCLayout.DungeonOnBack,
    'stickers-on-back': HCLayout.StickersOnBack,
    'token-in-inset': HCLayout.TokenInInset,
    'token-on-back': HCLayout.TokenOnBack,
    specialize: HCLayout.Specialize,
    mdfc: HCLayout.Modal,
    transform: HCLayout.Transform,
    flip: HCLayout.Flip,
    inset: HCLayout.Inset,
    prepare: HCLayout.Prepare,
    aftermath: HCLayout.Aftermath,
    split: HCLayout.Split,
  };

  const singleLayoutTags: Record<string, HCLayoutGroup.SingleFacedType> = {
    'weird-leveler': HCLayout.Leveler,
    leveler: HCLayout.Leveler,
    'weird-1-mana-levelers-cycle': HCLayout.Leveler,
    'mutate-layout': HCLayout.Mutate,
    noncard: HCLayout.Misc,
  };

  const multiLayoutToFaceLayout: Record<
    HCLayoutGroup.MultiFacedType & HCLayoutGroup.CardLayoutType,
    HCLayoutGroup.FaceLayoutType
  > = {
    meld_part: HCLayout.MeldResult,
    draft_partner: HCLayout.DraftPartner,
    reminder_on_back: HCLayout.Reminder,
    token_on_back: HCLayout.Token,
    token_in_inset: HCLayout.Token,
    dungeon_on_back: HCLayout.Dungeon,
    dungeon_in_inset: HCLayout.Dungeon,
    stickers_on_back: HCLayout.Stickers,
    modal: HCLayout.Modal,
    transform: HCLayout.Transform,
    specialize: HCLayout.Specialize,
    flip: HCLayout.Flip,
    inset: HCLayout.Inset,
    aftermath: HCLayout.Aftermath,
    prepare: HCLayout.Prepare,
    split: HCLayout.Split,
    multi: HCLayout.Split,
  };

  const layoutToImageStatusList = [
    'front',
    'token',
    'flip',
    'inset',
    'prepare',
    'split',
    'aftermath',
    'draft_partner',
    'dungeon',
    'reminder',
    'stickers',
  ];

  const borderColorTags: Record<string, HCBorderColor> = {
    'white-border': HCBorderColor.White,
    borderless: HCBorderColor.Borderless,
    'no-border': HCBorderColor.NoBorder,
    'silver-border': HCBorderColor.Silver,
    'gold-border': HCBorderColor.Gold,
    'yellow-border': HCBorderColor.Yellow,
    'rainbow-border': HCBorderColor.Rainbow,
    'blue-border': HCBorderColor.Blue,
    'camo-border': HCBorderColor.Camo,
    'orange-border': HCBorderColor.Orange,
  };

  const frameTags: Record<string, HCFrame> = {
    '1993-frame': HCFrame.Original,
    '1997-frame': HCFrame.Classic,
    '2003-frame': HCFrame.Modern,
    'future-frame': HCFrame.Future,
    'playtest-frame': HCFrame.Playtest,
    'jank-frame': HCFrame.Jank,
    '1997-token-frame': HCFrame.ClassicToken,
    '2003-token-frame': HCFrame.ModernToken,
    '2015-token-frame': HCFrame.StampToken,
    '2020-token-frame': HCFrame.NewToken,
    'pokemon-frame': HCFrame.Pokemon,
    'yugioh-frame': HCFrame.Yugioh,
    'legends-of-runeterra-frame': HCFrame.LegendsOfRuneterra,
    'slay-the-spire-frame': HCFrame.SlayTheSpire,
    'inscryption-frame': HCFrame.Inscryption,
    'hearthstone-frame': HCFrame.Hearthstone,
    'lorcana-frame': HCFrame.Lorcana,
  };
  const frameEffectTags: Record<string, HCFrameEffect> = {
    'miracle-frame': HCFrameEffect.Miracle,
    'nyx-frame': HCFrameEffect.Enchantment,
    'draft-frame': HCFrameEffect.Draft,
    'devoid-frame': HCFrameEffect.Devoid,
    tombstone: HCFrameEffect.Tombstone,
    'colorshifted-frame': HCFrameEffect.Colorshifted,
    'masterpiece-frame': HCFrameEffect.Masterpiece,
    'inverted-text': HCFrameEffect.Inverted,
    'sun-moon-transform': HCFrameEffect.SunMoonDfc,
    'type-transform-marks': HCFrameEffect.TypeDfc,
    'compass-land-transform': HCFrameEffect.CompassLandDfc,
    'origin-pw-transform': HCFrameEffect.OriginPwDfc,
    'moon-eldrazi-transform': HCFrameEffect.MoonEldraziDfc,
    'fan-transform': HCFrameEffect.FanDfc,
    'showcase-frame': HCFrameEffect.Showcase,
    'extended-art': HCFrameEffect.ExtendedArt,
    'full-art': HCFrameEffect.FullArt,
    'vertical-art': HCFrameEffect.VerticalArt,
    'no-art': HCFrameEffect.NoArt,
    'companion-frame': HCFrameEffect.Companion,
    'etched-frame': HCFrameEffect.Etched,
    'spree-frame': HCFrameEffect.Spree,
    'meld-frame': HCFrameEffect.Meld,
  };

  const theThing = rest.map(entry => {
    const cardObject: Record<string, any> & { card_faces: Record<string, any>[] } = {
      card_faces: [],
    };
    for (let i = 0; i < keys.length; i++) {
      if (entry[i]) {
        if ('0123'.includes(keys[i][0])) {
          const face = parseInt(keys[i][0]);
          const key = keys[i].slice(1);

          if (face == 3 && entry[i].includes(' // ')) {
            const entryList = entry[i].split(' // ');
            entryList.forEach((value, index) => {
              while (cardObject.card_faces.length <= face + index) {
                cardObject.card_faces.push({} as Record<string, any>);
              }
              if (['supertypes', 'types', 'subtypes'].includes(key)) {
                cardObject.card_faces[face + index][key] = value.split(';');
              } else if (
                key == 'loyalty' &&
                cardObject.card_faces[face + index]['types']?.includes('Battle')
              ) {
                cardObject.card_faces[face + index].defense = value;
              } else {
                cardObject.card_faces[face + index][key] = value;
              }
              if (key == 'image') {
                cardObject.card_faces[face + index].image_status = HCImageStatus.HighRes;
              }
            });
          } else {
            while (cardObject.card_faces.length <= face) {
              cardObject.card_faces.push({} as Record<string, any>);
            }
            if (key == 'colors') {
              const colorArr = entry[i]
                .split(';')
                .map(color => HCColor[color as keyof typeof HCColor]) as HCColors;
              cardObject.card_faces[face][key] = colorArr;
              cardObject.colors = colorArr;
            } else if (['supertypes', 'types', 'subtypes'].includes(key)) {
              cardObject.card_faces[face][key] = entry[i].split(';');
            } else if (
              key == 'loyalty' &&
              cardObject.card_faces[face]['types']?.includes('Battle')
            ) {
              cardObject.card_faces[face].defense = entry[i];
            } else {
              cardObject.card_faces[face][key] = entry[i];
            }
            if (key == 'image') {
              cardObject.card_faces[face].image_status = HCImageStatus.HighRes;
            }
          }
        } else {
          if (keys[i] == 'mana_value') {
            cardObject[keys[i]] = entry[i] != '∞' ? parseInt(entry[i]) : 9999999999999999999999999; // The Infinitoken case
          } else if (keys[i] == 'legalities') {
            const formats = entry[i].split(', ');
            const legalities: HCLegalitiesField = {
              standard: formats.includes('Banned') ? HCLegality.Banned : HCLegality.Legal,
              '4cb': formats.includes('Banned (4CB)') ? HCLegality.Banned : HCLegality.Legal,
              commander: formats.includes('Banned (Commander)')
                ? HCLegality.Banned
                : HCLegality.Legal,
            };
            cardObject[keys[i]] = legalities;
          } else if (keys[i] == 'related') {
            const all_parts: HCRelatedCard[] = entry[i].split(';').map(oldName => {
              const [, name, count] = oldName.match(/(.*)(\*(?:\d+|x))$/) ?? [, oldName, undefined];
              const base = name.replace(/\d+$/, '');
              const shouldUseBase =
                /\d/.test(name.at(-1)!) &&
                !hardCardNames.includes(name) &&
                base &&
                ![' ', '-', '^', '.', '/', '+', ',', "'"].includes(base.at(-1)!);

              const maker: HCRelatedCard = {
                object: HCObject.ObjectType.RelatedCard,
                id: shouldUseBase ? name : '',
                component: 'token_maker',
                name: shouldUseBase ? base : name,
                type_line: '',
                set: '',
                image: '',
              };
              if (count) {
                maker.count = count.slice(1);
              }
              return maker;
            });

            cardObject.all_parts = all_parts;
          } else if (keys[i] == 'tags') {
            // now handling this at the end
          } else if (keys[i] == 'creators') {
            cardObject[keys[i]] = entry[i].split(';');
          } else {
            cardObject[keys[i]] = entry[i];
          }
          if (keys[i] == 'image') {
            cardObject.image_status = HCImageStatus.MedRes;
          }
        }
      }
    }
    if (cardObject.card_faces.length == 0) {
      cardObject.card_faces.push({} as Record<string, any>);
    }
    const tagIndex = keys.indexOf('tags');
    if (entry[tagIndex]) {
      const tags = entry[tagIndex].split(';');

      cardObject.tags = tags.map(fullTag => {
        if (fullTag.includes('<') && fullTag.includes('>')) {
          const [tag, note] = fullTag.split('<');
          if (tag.slice(tag.lastIndexOf('-') + 1) == 'watermark') {
            const index = parseInt(note);
            cardObject.card_faces[
              !isNaN(index) && index >= 0 && index < cardObject.card_faces.length ? index : 0
            ].watermark = tag.slice(0, tag.lastIndexOf('-'));
          } else if (tag in frameTags) {
            const index = parseInt(note);
            cardObject.card_faces[
              !isNaN(index) && index >= 0 && index < cardObject.card_faces.length ? index : 0
            ].frame = frameTags[tag];
          } else if (tag in frameEffectTags) {
            const index = parseInt(note);
            const faceIndex =
              !isNaN(index) && index >= 0 && index < cardObject.card_faces.length ? index : 0;
            if ('frame_effects' in cardObject.card_faces[faceIndex]) {
              cardObject.card_faces[faceIndex].frame_effects.push(frameEffectTags[tag]);
            } else {
              cardObject.card_faces[faceIndex].frame_effects = [frameEffectTags[tag]];
            }
          } else {
            if (!('tag_notes' in cardObject)) {
              cardObject.tag_notes = {} as Record<string, string>;
            }
            cardObject.tag_notes[tag] = note.slice(0, -1);
          }
          return tag;
        } else {
          if (fullTag.slice(fullTag.lastIndexOf('-') + 1) == 'watermark') {
            cardObject.card_faces[0].watermark = fullTag.slice(0, fullTag.lastIndexOf('-'));
          } else if (fullTag in frameTags) {
            cardObject.frame = frameTags[fullTag];
          } else if (fullTag in frameEffectTags) {
            if ('frame_effects' in cardObject.card_faces[0]) {
              cardObject.card_faces[0].frame_effects.push(frameEffectTags[fullTag]);
            } else {
              cardObject.card_faces[0].frame_effects = [frameEffectTags[fullTag]];
            }
          }
          return fullTag;
        }
      });
      cardObject.tags = Array.from(new Set(cardObject.tags));

      cardObject.tags.forEach((tag: string) => {
        if (tag == 'draftpartner' && cardObject.all_parts) {
          cardObject.all_parts[0].is_draft_partner = true;
          if (cardObject.all_parts[0].component == 'token_maker') {
            // don't overwrite melds
            cardObject.all_parts[0].component = 'draft_partner';
          }
          if (!tags.includes('draftpartner-with-self')) {
            cardObject.not_directly_draftable = true;
          }
          cardObject.has_draft_partners = true;
        } else if (tag == 'meld' && cardObject.all_parts) {
          cardObject.all_parts[0].component = 'meld_part';
        }
        if (!('layout' in cardObject)) {
          if (cardObject.card_faces.length <= 1) {
            if (tag in singleLayoutTags) {
              cardObject.layout = singleLayoutTags[tag];
            }
          } else {
            if (tag in multiLayoutTags) {
              cardObject.layout = multiLayoutTags[tag];
            }
          }
        }
        if (!('border_color' in cardObject) && tag in borderColorTags) {
          cardObject.border_color = borderColorTags[tag];
        } else if (!('frame' in cardObject) && tag in frameTags) {
          cardObject.frame = frameTags[tag];
        } else if (tag == 'foil') {
          cardObject.finish = HCFinish.Foil;
        } else if (
          tag == 'flavor-name' &&
          'tag_notes' in cardObject &&
          tag in cardObject.tag_notes
        ) {
          cardObject.card_faces[0].flavor_name = cardObject.tag_notes[tag];
        } else if (tag == 'gif' && !cardObject.tags.includes('mdfc')) {
          const stillIndex = cardObject.card_faces.findLastIndex(face => face.image);
          cardObject.draft_image = cardObject.card_faces[stillIndex].image;
          cardObject.draft_image_status = HCImageStatus.HighRes;
          delete cardObject.card_faces[stillIndex].image;
          delete cardObject.card_faces[stillIndex].image_status;
        }
      });
    }
    const name = cardObject.tags?.includes('irregular-face-name')
      ? []
      : (cardObject.card_faces.length > 1 && cardObject.tags?.includes('masterpiece')
          ? stripMasterpiece(entry[1])
          : entry[1]
        ).split(' // ');
    const type_line_list: string[] = [];
    const mana_cost_list: string[] = [];
    cardObject.card_faces.forEach((face, index) => {
      face.name = name.length > 0 ? name.shift() : '';
      const face_type = [
        face.supertypes?.join(' '),
        [face.types?.join(' '), face.subtypes?.join(' ')].filter(Boolean).join(' — '),
      ]
        .filter(Boolean)
        .join(' ') as string;
      face.type_line = face_type;
      type_line_list.push(face_type);

      // TODO: Expand
      if (index == 0) {
        face.layout = HCLayout.Front;
      } else if (
        'layout' in cardObject &&
        cardObject.layout != 'flip' &&
        cardObject.tags?.includes('flip') &&
        !face.image &&
        cardObject.layout in multiLayoutToFaceLayout
      ) {
        face.layout = 'flip';
      } else if ('layout' in cardObject && cardObject.layout in multiLayoutToFaceLayout) {
        face.layout =
          multiLayoutToFaceLayout[cardObject.layout as keyof typeof multiLayoutToFaceLayout];
      } else {
        face.layout = HCLayout.Split;
      }
      if (!('image_status' in face) /**|| ['split'].includes(face.image_status)*/) {
        if (index == 0) {
          face.image_status = HCImageStatus.Front;
        } else if (
          cardObject.tags?.includes('draftpartner') ||
          cardObject.card_faces[0].oracle_text?.toLowerCase().includes('draftpartner')
        ) {
          face.image_status = HCImageStatus.DraftPartner;
        } else if (
          // the inset check correctly handles mr. crime 1981
          (cardObject.tags?.includes('reminder-on-back') && !cardObject.tags?.includes('inset')) ||
          face.types?.includes('Reminder Card') ||
          face.types?.includes('Spellbook')
        ) {
          face.image_status = HCImageStatus.Reminder;
        } else if (
          cardObject.tags?.includes('dungeon-on-back') ||
          cardObject.tags?.includes('dungeon-in-inset') ||
          face.types?.includes('Dungeon')
        ) {
          face.image_status = HCImageStatus.Dungeon;
        } else if (
          cardObject.tags?.includes('stickers-on-back') ||
          face.types?.includes('Stickers')
        ) {
          face.image_status = HCImageStatus.Stickers;
        } else if (
          cardObject.tags?.includes('token-on-back') ||
          cardObject.tags?.includes('token-in-inset') ||
          face.supertypes?.includes('Token')
        ) {
          face.image_status = HCImageStatus.Token;
        } else if (
          cardObject.tags?.includes('flip') ||
          cardObject.card_faces[0].oracle_text?.toLowerCase().includes('flip')
        ) {
          face.image_status = HCImageStatus.Flip;
        } else if (
          cardObject.tags?.includes('aftermath') ||
          face.oracle_text?.toLowerCase().includes('aftermath')
        ) {
          face.image_status = HCImageStatus.Aftermath;
        } else if (
          cardObject.tags?.includes('inset') ||
          face.subtypes?.some(
            (sub: string) =>
              ['Adventure', 'Omen', 'Departure', 'Odyssey', 'Return'].includes(sub) ||
              (index == 1 &&
                cardObject.card_faces[0].oracle_text.toLowerCase().includes('prepared'))
          )
        ) {
          face.image_status = HCImageStatus.Inset;
        } else if (cardObject.tags?.includes('prepare')) {
          face.image_status = HCImageStatus.Prepare;
        } else {
          face.image_status = HCImageStatus.Split;
        }
      }
      Object.keys(defaultMultiFaceProps)
        .filter(key => !(key in face))
        .forEach(key => {
          face[key] = defaultMultiFaceProps[key];
        });
      mana_cost_list.push(face.mana_cost);
    });

    cardObject.type_line = type_line_list.join(' // ');
    cardObject.mana_cost = mana_cost_list.filter(e => e).join(' // ');

    // const { color_identity, color_identity_hybrid } = getColorIdentityProps(
    //   cardObject as HCCard.AnyMultiFaced
    // );
    // cardObject.color_identity = color_identity;
    // cardObject.color_identity_hybrid = color_identity_hybrid;
    Object.keys(defaultProps)
      .filter(key => !(key in cardObject))
      .forEach(key => {
        cardObject[key] = defaultProps[key];
      });
    if (
      cardObject.card_faces.length <= 1 ||
      cardObject.card_faces[0]?.oracle_text?.toLowerCase().includes('draftpartner')
    ) {
      if ('image' in cardObject.card_faces[0] && cardObject.card_faces[0].image) {
        if ('image' in cardObject && cardObject.image) {
          cardObject.draft_image = cardObject.image;
          cardObject.draft_image_status = cardObject.image_status;
        }
        cardObject.image = cardObject.card_faces[0].image;
        cardObject.image_status = cardObject.card_faces[0].image_status;
        delete cardObject.card_faces[0].image;
        cardObject.card_faces[0].image_status = 'front';
      }
    }
    if (cardObject.card_faces.length <= 1) {
      for (const [key, value] of Object.entries(cardObject.card_faces[0]).filter(
        ([key, value]) =>
          ![
            'name',
            'type_line',
            'mana_cost',
            'mana_value',
            'image_status',
            'colors',
            'image',
            'layout',
          ].includes(key)
      )) {
        cardObject[key] = value;
      }
      const { card_faces, ...singleCard } = cardObject;
      if (!('layout' in singleCard)) {
        if (singleCard.types?.includes('Stickers')) {
          singleCard.layout = HCLayout.Stickers;
        } else if (singleCard.types?.includes('Dungeon')) {
          singleCard.layout = HCLayout.Dungeon;
          // } else if (singleCard.tags?.some((tag:string) => ['weird-leveler','leveler','weird-1-mana-levelers-cycle'].includes(tag))) {
          //   singleCard.layout = HCLayout.Leveler;
        } else if (singleCard.subtypes?.includes('Saga')) {
          singleCard.layout = HCLayout.Saga;
        } else if (singleCard.subtypes?.includes('Class')) {
          singleCard.layout = HCLayout.Class;
        } else if (singleCard.subtypes?.includes('Case')) {
          singleCard.layout = HCLayout.Case;
          // } else if (singleCard.tags?.includes('mutate-layout')) {
          //   singleCard.layout = HCLayout.Mutate;
        } else if (
          singleCard.tags?.some((type: string) => ['Plane', 'Phenomenon'].includes(type))
        ) {
          singleCard.layout = HCLayout.Prototype;
        } else if (singleCard.types?.includes('Plane')) {
          singleCard.layout = HCLayout.Planar;
        } else if (singleCard.types?.includes('Scheme')) {
          singleCard.layout = HCLayout.Scheme;
        } else if (singleCard.types?.includes('Vanguard')) {
          singleCard.layout = HCLayout.Vanguard;
        } else if (singleCard.types?.includes('Battle')) {
          singleCard.layout = HCLayout.Battle;
        } else if (
          singleCard.subtypes?.some((subtype: string) =>
            ['Spacecraft', 'Watercraft', 'Planet'].includes(subtype)
          ) &&
          singleCard.oracle_text.toLowerCase().includes('station')
        ) {
          singleCard.layout = HCLayout.Station;
          // } else if (singleCard.tags?.includes('noncard')) {
          //   singleCard.layout = HCLayout.Misc;
        } else {
          singleCard.layout = HCLayout.Normal;
        }
      }
      // singleCard.layout = singleCard.tags?.includes('noncard') ? HCLayout.Misc : HCLayout.Normal;
      const card = singleCard as HCCard.AnySingleFaced;
      setDerivedProps(card);
      return card;
    } else {
      if (
        cardObject.card_faces[0].image &&
        (cardObject.card_faces.filter(e => e.image).length == 1 ||
          cardObject.tags?.includes('meld') ||
          cardObject.tags?.includes('draftpartner')) &&
        !cardObject.tags?.includes('gif')
      ) {
        if ('image' in cardObject && cardObject.image) {
          cardObject.draft_image = cardObject.image;
          cardObject.draft_image_status = cardObject.image_status;
        }
        cardObject.image = cardObject.card_faces[0].image;
        cardObject.image_status = cardObject.card_faces[0].image_status;
        delete cardObject.card_faces[0].image;
        cardObject.card_faces[0].image_status = 'front';
      }
      if (!('layout' in cardObject)) {
        cardObject.layout = HCLayout.Split;
      }
      const card = cardObject as HCCard.AnyMultiFaced;
      setDerivedProps(card);
      return card;
    }
  });

  return theThing; //.filter((e) => e.Set != "C");
};
