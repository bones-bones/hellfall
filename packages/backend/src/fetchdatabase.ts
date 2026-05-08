import { sheetsKey } from './env.ts';
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
import { error } from 'console';
import {
  addProp,
  addPropToFace,
  addTag,
  cardFaceType,
  cardObjectType,
  faceIsBattle,
  facePropType,
  faceValueType,
  fillFacesTo,
  propType,
  toSingleCard,
  valueType,
} from './fetchUtils.ts';
import { isInteger } from '@hellfall/shared/utils/isInt.ts';

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
    'artists',
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

  const defaultProps: {
    [P in propType]?: valueType<P>;
  } = {
    object: HCObject.ObjectType.Card,
    name: '',
    set: '',
    mana_cost: '',
    mana_value: 0,
    type_line: '',
    colors: [] as HCColors,
    color_identity: [] as HCColors,
    color_identity_hybrid: [] as HCColors[],
    keywords: [],
    legalities: {
      standard: HCLegality.NotLegal,
      '4cb': HCLegality.NotLegal,
      commander: HCLegality.NotLegal,
    } as HCLegalitiesField,
    creators: [],
    rulings: '',
    finish: HCFinish.Nonfoil,
    border_color: HCBorderColor.Black,
    frame: HCFrame.Stamp,
    variation: false,
  };

  const defaultFaceProps: {
    [P in facePropType]?: faceValueType<P>;
  } = {
    object: HCObject.ObjectType.CardFace,
    mana_cost: '',
    mana_value: 0,
    oracle_text: '',
    colors: [] as HCColors,
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
    prototype: HCLayout.Prototype,
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
  const frontIgnoreMultiLayouts: HCLayout[] = [
    HCLayout.MeldPart,
    HCLayout.DraftPartner,
    HCLayout.ReminderOnBack,
    HCLayout.TokenOnBack,
    HCLayout.TokenInInset,
    HCLayout.DungeonOnBack,
    HCLayout.DungeonInInset,
    HCLayout.StickersOnBack,
    HCLayout.Inset,
    HCLayout.Prepare,
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
    'unique-border': HCBorderColor.Unique,
    'orange-border': HCBorderColor.Orange,
    'red-border': HCBorderColor.Red,
  };

  const frameTags: Record<string, HCFrame> = {
    '1993-frame': HCFrame.Original,
    '1997-frame': HCFrame.Classic,
    '2003-frame': HCFrame.Modern,
    '2015-frame': HCFrame.Stamp,
    'future-frame': HCFrame.Future,
    'playtest-frame': HCFrame.Playtest,
    'jank-frame': HCFrame.Jank,
    '1997-token-frame': HCFrame.ClassicToken,
    '2003-token-frame': HCFrame.ModernToken,
    '2015-token-frame': HCFrame.StampToken,
    '2020-token-frame': HCFrame.FullToken,
    'pokemon-frame': HCFrame.Pokemon,
    'yugioh-frame': HCFrame.Yugioh,
    'legends-of-runeterra-frame': HCFrame.LegendsOfRuneterra,
    'slay-the-spire-frame': HCFrame.SlayTheSpire,
    'inscryption-frame': HCFrame.Inscryption,
    'hearthstone-frame': HCFrame.Hearthstone,
    'lorcana-frame': HCFrame.Lorcana,
    'notmagic-frame': HCFrame.NotMagic,
    'website-app-frame': HCFrame.WebsiteApp,
    'shattered-frame': HCFrame.Shattered,
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
    'generic-transform-marks': HCFrameEffect.TransformDfc,
    'generic-mdfc-marks': HCFrameEffect.Mdfc,
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
    'slab-frame': HCFrameEffect.Slab,
    'arena-frame': HCFrameEffect.Arena,
  };

  const frontImageTagProps: Record<string, string> = {
    'draft-image': 'draft_image',
    'rotated-draft-image': 'rotated_draft_image',
    'still-draft-image': 'still_draft_image',
  };
  const faceImageTagProps: Record<string, facePropType> = {
    'rotated-image': 'rotated_image',
    'still-image': 'still_image',
  };

  const allCards = rest.map(entry => {
    // const cardObject: Record<string, any> & { card_faces: Record<string, any>[] } = {
    //   card_faces: [],
    // };
    const cardObject: cardObjectType = { card_faces: [] as cardFaceType[] } as cardObjectType;
    for (let i = 0; i < keys.length; i++) {
      if (entry[i]) {
        if ('0123'.includes(keys[i][0])) {
          const face = parseInt(keys[i][0]);
          const key = keys[i].slice(1);
          if (key == 'colors') {
            const colorArr = entry[i]
              .split(';')
              .map(color => HCColor[color as keyof typeof HCColor]) as HCColors;
            addPropToFace(cardObject, face, key, colorArr);
            addProp(cardObject, key, colorArr);
          } else {
            const entryList = face == 3 ? entry[i].split(' // ') : [entry[i]];
            entryList.forEach((value, index) => {
              if (['supertypes', 'types', 'subtypes'].includes(key)) {
                addPropToFace(
                  cardObject,
                  face + index,
                  key as 'supertypes' | 'types' | 'subtypes',
                  value.split(';')
                );
              } else if (key == 'defense' && faceIsBattle(cardObject, face + index)) {
                addPropToFace(cardObject, face + index, 'defense', value);
              } else {
                addPropToFace(cardObject, face + index, key as facePropType, value);
              }
              if (key == 'image') {
                addPropToFace(cardObject, face + index, 'image_status', HCImageStatus.HighRes);
              }
            });
          }
        } else {
          if (keys[i] == 'mana_value') {
            addProp(
              cardObject,
              'mana_value',
              entry[i] != '∞'
                ? isInteger(entry[i])
                  ? parseInt(entry[i])
                  : parseFloat(entry[i])
                : 999999999999999
            ); // The Infinitoken case
          } else if (keys[i] == 'legalities') {
            const formats = entry[i].split(', ');
            const legalities: HCLegalitiesField = {
              standard: formats.includes('Not Legal')
                ? HCLegality.NotLegal
                : formats.includes('Banned')
                ? cardObject.set?.includes('HCV')
                  ? HCLegality.NotLegal
                  : HCLegality.Banned
                : HCLegality.Legal,
              '4cb': formats.includes('Not Legal')
                ? HCLegality.NotLegal
                : formats.includes('Banned (4CB)')
                ? cardObject.set?.includes('HCV')
                  ? HCLegality.NotLegal
                  : HCLegality.Banned
                : HCLegality.Legal,
              commander: formats.includes('Not Legal')
                ? HCLegality.NotLegal
                : formats.includes('Banned (Commander)')
                ? cardObject.set?.includes('HCV')
                  ? HCLegality.NotLegal
                  : HCLegality.Banned
                : HCLegality.Legal,
            };
            addProp(cardObject, 'legalities', legalities);
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
            addProp(cardObject, 'all_parts', all_parts);
          } else if (keys[i] == 'tags') {
            // now handling this at the end
          } else if (keys[i] == 'creators' || keys[i] == 'artists') {
            addProp(cardObject, keys[i] as 'creators' | 'artists', entry[i].split(';'));
          } else {
            addProp(cardObject, keys[i] as propType, entry[i]);
          }
          if (keys[i] == 'image') {
            addProp(cardObject, 'image_status', HCImageStatus.HighRes);
          }
        }
      }
    }
    if (cardObject.card_faces.length == 0) {
      fillFacesTo(cardObject, 0);
    }
    const tagIndex = keys.indexOf('tags');
    if (entry[tagIndex]) {
      const tags = entry[tagIndex].split(';');

      cardObject.tags = tags.map(fullTag => {
        const hasNote = fullTag.includes('<') && fullTag.endsWith('>');
        const [tag, note] = [
          hasNote ? fullTag.split('<')[0] : fullTag,
          hasNote ? fullTag.split('<')[1].slice(0, -1) : undefined,
        ];
        if (tag.slice(tag.lastIndexOf('-') + 1) == 'watermark') {
          addTag(cardObject, tag, note, 'watermark', tag.slice(0, tag.lastIndexOf('-')));
        } else if (tag in frameTags) {
          addTag(cardObject, tag, note, 'frame', frameTags);
        } else if (tag in frameEffectTags) {
          addTag(cardObject, tag, note || '0', 'frame_effects', frameEffectTags, { push: true });
        } else if (tag in faceImageTagProps) {
          addTag(cardObject, tag, note, faceImageTagProps[tag], undefined, { useUrl: true });
        } else if (tag in borderColorTags) {
          addTag(cardObject, tag, note, 'border_color', borderColorTags);
        } else if (
          tag in singleLayoutTags &&
          !cardObject.layout &&
          cardObject.card_faces.length <= 1
        ) {
          addTag(cardObject, tag, note, 'layout', singleLayoutTags);
        } else if (tag in multiLayoutTags && !cardObject.layout) {
          addTag(cardObject, tag, note, 'layout', multiLayoutTags, { useRootOnly: true });
        } else if (tag == 'foil') {
          addTag(cardObject, tag, note, 'finish', HCFinish.Foil);
        } else if (note) {
          if (tag in frontImageTagProps) {
            addTag(cardObject, tag, note, frontImageTagProps[tag] as propType, undefined, {
              useUrl: true,
              useRootOnly: true,
            });
            if (tag == 'draft-image') {
              addProp(cardObject, 'draft_image_status', HCImageStatus.HighRes);
            }
          } else if (tag == 'flavor-name') {
            addTag(cardObject, tag, note, 'flavor_name', undefined, { dontAddNote: true });
          } else if (
            tag.toLowerCase() == cardObject.set?.toLowerCase() ||
            (['hc1.0', 'hc1.1', 'hc1.2'].includes(tag) &&
              (cardObject.set?.slice(0, 3) == 'HLC' || cardObject.set == 'HCV.1'))
          ) {
            addTag(cardObject, tag, undefined, 'collector_number', note);
          } else {
            addTag(cardObject, tag, note, undefined, undefined, { useRootOnly: true });
          }
        }
        return tag;
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
        } else if (tag == 'NotDirectlyDraftable') {
          // for Prismatic Pardner
          cardObject.not_directly_draftable = true;
        }
      });
    }
    const name = cardObject.tags?.includes('irregular-face-name')
      ? []
      : (cardObject.card_faces.length > 1 && cardObject.tags?.includes('masterpiece')
          ? stripMasterpiece(entry[1])
          : entry[1]
        ).split(' // ');
    const getFrontLayout = (front: cardFaceType) => {
      if (front.types?.some(type => type.toLowerCase() == 'stickers')) {
        return HCLayout.Stickers;
      } else if (front.types?.some(type => type.toLowerCase() == 'dungeon')) {
        return HCLayout.Dungeon;
      } else if (front.subtypes?.some(type => type.toLowerCase() == 'saga')) {
        return HCLayout.Saga;
      } else if (front.subtypes?.some(type => type.toLowerCase() == 'class')) {
        return HCLayout.Class;
      } else if (front.subtypes?.some(type => type.toLowerCase() == 'case')) {
        return HCLayout.Case;
      } else if (front.types?.some(type => ['plane', 'phenomenon'].includes(type.toLowerCase()))) {
        return HCLayout.Planar;
      } else if (front.types?.some(type => type.toLowerCase() == 'scheme')) {
        return HCLayout.Scheme;
      } else if (front.types?.some(type => type.toLowerCase() == 'vanguard')) {
        return HCLayout.Vanguard;
      } else if (front.types?.some(type => type.toLowerCase() == 'battle')) {
        return HCLayout.Battle;
      } else if (
        front.subtypes?.some(subtype =>
          ['spacecraft', 'watercraft', 'planet'].includes(subtype.toLowerCase())
        ) &&
        front.oracle_text.toLowerCase().includes('station')
      ) {
        return HCLayout.Station;
      }
    };
    cardObject.card_faces.forEach((face, index) => {
      addPropToFace(cardObject, index, 'name', name.length > 0 ? name.shift()! : '');

      // TODO: Expand
      // if (index == 0) {
      //   face.layout = HCLayout.Front;
      // } else

      const shouldPullLayout =
        cardObject.layout &&
        cardObject.layout in multiLayoutToFaceLayout &&
        !(frontIgnoreMultiLayouts.includes(cardObject.layout as HCLayout) && !index);
      if (cardObject.layout == 'meld_part') {
        addPropToFace(cardObject, index, 'layout', index ? 'meld_result' : 'meld_part');
      } else if (
        cardObject.layout &&
        cardObject.layout != 'flip' &&
        cardObject.tags?.includes('flip') &&
        !face.image &&
        cardObject.layout in multiLayoutToFaceLayout
      ) {
        addPropToFace(cardObject, index, 'layout', 'flip');
      } else if (
        cardObject.layout &&
        cardObject.layout != 'inset' &&
        cardObject.tags?.includes('inset') &&
        !face.image &&
        cardObject.layout in multiLayoutToFaceLayout
      ) {
        addPropToFace(cardObject, index, 'layout', 'inset');
      } else if (cardObject.layout && shouldPullLayout) {
        if (index == 1 && cardObject.layout == 'specialize') {
          addPropToFace(cardObject, index, 'layout', 'reminder');
        } else {
          addPropToFace(
            cardObject,
            index,
            'layout',
            multiLayoutToFaceLayout[cardObject.layout as keyof typeof multiLayoutToFaceLayout]
          );
        }
      } else if (!index && !face.layout) {
        addPropToFace(cardObject, index, 'layout', getFrontLayout(face) || HCLayout.Front);
      } else {
        addPropToFace(cardObject, index, 'layout', HCLayout.Split);
      }
      if (!face.image_status /**|| ['split'].includes(face.image_status)*/) {
        if (index == 0) {
          addPropToFace(cardObject, index, 'image_status', HCImageStatus.Front);
        } else if (cardObject.tags?.includes('draftpartner-faces')) {
          addPropToFace(cardObject, index, 'image_status', HCImageStatus.DraftPartner);
        } else if (
          // the inset check correctly handles mr. crime 1981
          cardObject.tags?.includes('reminder-on-back') &&
          !cardObject.tags?.includes('inset')
        ) {
          addPropToFace(cardObject, index, 'image_status', HCImageStatus.Reminder);
        } else if (
          cardObject.tags?.includes('dungeon-on-back') ||
          cardObject.tags?.includes('dungeon-in-inset')
        ) {
          addPropToFace(cardObject, index, 'image_status', HCImageStatus.Dungeon);
        } else if (cardObject.tags?.includes('stickers-on-back')) {
          addPropToFace(cardObject, index, 'image_status', HCImageStatus.Stickers);
        } else if (
          cardObject.tags?.includes('token-on-back') ||
          cardObject.tags?.includes('token-in-inset')
        ) {
          addPropToFace(cardObject, index, 'image_status', HCImageStatus.Token);
        } else if (cardObject.tags?.includes('flip')) {
          addPropToFace(cardObject, index, 'image_status', HCImageStatus.Flip);
        } else if (cardObject.tags?.includes('aftermath')) {
          addPropToFace(cardObject, index, 'image_status', HCImageStatus.Aftermath);
        } else if (cardObject.tags?.includes('inset')) {
          addPropToFace(cardObject, index, 'image_status', HCImageStatus.Inset);
        } else if (cardObject.tags?.includes('prepare')) {
          addPropToFace(cardObject, index, 'image_status', HCImageStatus.Prepare);
        } else {
          addPropToFace(cardObject, index, 'image_status', HCImageStatus.Split);
        }
      }
      (Object.keys(defaultFaceProps) as facePropType[])
        .filter(key => !face[key])
        .forEach(key => {
          addPropToFace(cardObject, index, key, defaultFaceProps[key]);
        });
    });

    (Object.keys(defaultProps) as propType[])
      .filter(key => !(key in cardObject))
      .forEach(key => {
        addProp(cardObject, key, defaultProps[key]);
      });
    if (cardObject.card_faces.length <= 1) {
      const layout = cardObject.layout
        ? undefined
        : getFrontLayout(cardObject.card_faces[0]) || HCLayout.Normal;
      const card = toSingleCard(cardObject, layout);
      setDerivedProps(card);
      return card;
    } else {
      if (!cardObject.layout) {
        cardObject.layout = HCLayout.Split;
      }
      const card = cardObject as HCCard.AnyMultiFaced;
      setDerivedProps(card);
      return card;
    }
  });

  return allCards;
};
