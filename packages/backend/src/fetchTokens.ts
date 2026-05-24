import { sheetsKey } from './env.ts';
import {
  HCCard,
  HCImageStatus,
  HCLayout,
  HCRelatedCard,
  HCColor,
  HCColors,
  HCObject,
  HCLegality,
  HCLegalitiesField,
  HCLayoutGroup,
  HCBorderColor,
  HCFrame,
  HCFrameEffect,
  HCFinish,
} from '@hellfall/shared/types';
import { fetchScryfallTokens } from './fetchScryfallTokens.ts';
import {
  addProp,
  addPropToFace,
  fillFacesTo,
  addTag,
  toSingleCard,
  addArtist,
} from './fetchUtils.ts';
import {
  cardFaceType,
  cardObjectType,
  facePropType,
  faceValueType,
  propType,
  valueType,
} from '@hellfall/shared/utils';
import { setDerivedProps } from './derivedProps.ts';

export const fetchTokens = async (NO_SCRYFALL: boolean) => {
  const requestedData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Tokens+Database+(Unapproved)?alt=json&key=${sheetsKey}`
  );
  const asJson = (await requestedData.json()) as any;

  const [_oldkeys, ...rest] = asJson.values as string[][];
  const keys = [
    'name',
    'image',
    'types',
    'power',
    'toughness',
    'token_maker',
    'rulings',
    'creators',
    'tags',
    'collector_number',
    'artists',
  ];
  rest.forEach(row => {
    while (row.length < keys.length) {
      row.push('');
    }
  });
  const defaultProps: { [P in propType]?: valueType<P> } = {
    object: HCObject.ObjectType.Card,
    set: 'HCT',
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
    frame: HCFrame.FullToken,
    variation: false,
    isActualToken: true,
  };
  const defaultFaceProps: { [P in facePropType]?: faceValueType<P> } = {
    object: HCObject.ObjectType.CardFace,
    name: '',
    image_status: HCImageStatus.Token,
    mana_cost: '',
    mana_value: 0,
    type_line: '',
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
  const hardTokenIds: string[] = [
    'Clue© 19861',
    '+21',
    '+41',
    'AKKI-471',
    'Bolt M41',
    'Rock 191',
    "Baldur's Gate 31",
  ];

  const supers = ['Basic', 'Legendary', 'Snow', 'World', 'Minigame', 'Token', 'EVIL', 'WET'];

  const typeLayouts: Record<string, HCLayoutGroup.SingleFacedType & HCLayoutGroup.FaceLayoutType> =
    {
      Emblem: HCLayout.Emblem,
      // 'Reminder Card': HCLayout.Reminder,
      Stickers: HCLayout.Stickers,
      Dungeon: HCLayout.Dungeon,
      // 'Real Card': HCLayout.RealCardToken,
      'Ad Card': HCLayout.Misc,
      Misc: HCLayout.Misc,
      Checklist: HCLayout.Checklist,
    };

  const multiLayoutTags: Record<string, HCLayoutGroup.MultiFacedType> = {
    'reminder-card': HCLayout.MultiReminder,
    // 'real-card': HCLayout.RealCardMultiToken,
  };

  const singleLayoutTags: Record<string, HCLayoutGroup.SingleFacedType> = {
    meld: HCLayout.MeldResult,
    'weird-leveler': HCLayout.Leveler,
    leveler: HCLayout.Leveler,
    'weird-1-mana-levelers-cycle': HCLayout.Leveler,
    'mutate-layout': HCLayout.Mutate,
    noncard: HCLayout.Misc,
    'reminder-card': HCLayout.Reminder,
    // 'real-card': HCLayout.RealCardToken,
  };

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
  };

  const frameTags: Record<string, HCFrame> = {
    '1993-card-frame': HCFrame.Original,
    '1997-card-frame': HCFrame.Classic,
    '2015-card-frame': HCFrame.Stamp,
    '2003-card-frame': HCFrame.Modern,
    'future-frame': HCFrame.Future,
    'playtest-frame': HCFrame.Playtest,
    'jank-frame': HCFrame.Jank,
    '1997-frame': HCFrame.ClassicToken,
    '2003-frame': HCFrame.ModernToken,
    '2015-frame': HCFrame.StampToken,
    '2020-frame': HCFrame.FullToken,
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
    'universes-beyond-frame': HCFrameEffect.UniversesBeyond,
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

  const multiLayoutToFaceLayout: Record<
    HCLayoutGroup.MultiFacedType & HCLayoutGroup.TokenLayoutType,
    HCLayoutGroup.FaceLayoutType & HCLayoutGroup.SingleFacedType
  > = {
    multi_reminder: HCLayout.Reminder,
    multi_not_magic: HCLayout.NotMagic,
    multi_token: HCLayout.Token,
    real_card_multi_token: HCLayout.RealCardToken,
  };

  const tagToFaceLayouts: Record<string, HCLayoutGroup.FaceLayoutType> = {
    meld: HCLayout.MeldPart,
    'draftpartner-faces': HCLayout.DraftPartner,
    'reminder-on-back': HCLayout.Reminder,
    'dungeon-in-inset': HCLayout.Dungeon,
    'dungeon-on-back': HCLayout.Dungeon,
    'stickers-on-back': HCLayout.Stickers,
    specialize: HCLayout.Specialize,
    mdfc: HCLayout.Modal,
    transform: HCLayout.Transform,
    flip: HCLayout.Flip,
    inset: HCLayout.Inset,
    prepare: HCLayout.Prepare,
    aftermath: HCLayout.Aftermath,
    split: HCLayout.Split,
  };
  const HCTokens = rest.map(entry => {
    const tokenObject: cardObjectType = { card_faces: [] as cardFaceType[] } as cardObjectType;
    for (let i = 0; i < keys.length; i++) {
      if (entry[i]) {
        if (keys[i] == 'name') {
          tokenObject.id = entry[i];
          tokenObject.name = hardTokenIds.includes(entry[i])
            ? entry[i].slice(0, -1)
            : entry[i].replace(/\d+$/, '');
        }
        if (['name', 'types', 'power', 'toughness'].includes(keys[i])) {
          const entryList = (keys[i] == 'name' ? tokenObject.name! : entry[i]).split(' // ');
          entryList.forEach((value, index) => {
            if (keys[i] == 'name') {
              addPropToFace(tokenObject, 'name', value, index);
              addPropToFace(tokenObject, 'subtypes', value.split(' '), index);
            } else if (keys[i] == 'types') {
              const typesAndSupertypes = value.split(';');
              const superList: string[] = [];
              const typeList: string[] = [];
              typesAndSupertypes.forEach(e => {
                supers.includes(e) ? superList.push(e) : typeList.push(e);
              });
              if (superList?.length) {
                addPropToFace(tokenObject, 'supertypes', superList, index);
              }
              if (typeList?.length) {
                addPropToFace(tokenObject, 'types', typeList, index);
              }
            } else if (['power', 'toughness'].includes(keys[i])) {
              addPropToFace(tokenObject, keys[i] as 'power' | 'toughness', value, index);
            }
          });
        } else if (keys[i] == 'creators' || keys[i] == 'artists') {
          addProp(tokenObject, keys[i] as 'creators' | 'artists', entry[i].split(';'));
        } else if (keys[i] == 'token_maker') {
          const all_parts = entry[i].split(';').map(oldName => {
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
              name: shouldUseBase ? base : name,
              set: '',
              image: '',
              type_line: '',
              component: 'token_maker',
            };
            if (count) {
              maker.count = count.slice(1);
            }
            return maker;
          });
          addProp(tokenObject, 'all_parts', all_parts);
        } else if (keys[i] == 'tags' || keys[i] == 'artists') {
          // now handling this at the end
        } else {
          addProp(tokenObject, keys[i] as propType, entry[i]);
        }
        if (keys[i] == 'image') {
          addProp(tokenObject, 'image_status', HCImageStatus.HighRes);
        }
      }
    }
    const tagIndex = keys.indexOf('tags');
    if (entry[tagIndex]) {
      const tags = entry[tagIndex].split(';');

      tokenObject.tags = tags.map(fullTag => {
        const hasNote = fullTag.includes('<') && fullTag.endsWith('>');
        const [tag, note] = [
          hasNote ? fullTag.split('<')[0] : fullTag,
          hasNote ? fullTag.split('<')[1].slice(0, -1) : undefined,
        ];
        if (tag.slice(tag.lastIndexOf('-') + 1) == 'watermark') {
          addTag(tokenObject, tag, note, 'watermark', tag.slice(0, tag.lastIndexOf('-')));
        } else if (tag in frameTags) {
          addTag(tokenObject, tag, note, 'frame', frameTags);
        } else if (tag in frameEffectTags) {
          addTag(tokenObject, tag, note || '0', 'frame_effects', frameEffectTags, { push: true });
        } else if (tag in faceImageTagProps) {
          addTag(tokenObject, tag, note, faceImageTagProps[tag], undefined, { useUrl: true });
        } else if (tag in borderColorTags) {
          addTag(tokenObject, tag, note, 'border_color', borderColorTags);
        } else if (
          tag in singleLayoutTags &&
          !tokenObject.layout &&
          tokenObject.card_faces.length <= 1
        ) {
          addTag(tokenObject, tag, note, 'layout', singleLayoutTags as Record<string, HCLayout>);
        } else if (tag in multiLayoutTags && !tokenObject.layout) {
          addTag(tokenObject, tag, note, 'layout', multiLayoutTags as Record<string, HCLayout>, {
            useRootOnly: true,
          });
        } else if (tag == 'foil') {
          addTag(tokenObject, tag, note, 'finish', HCFinish.Foil);
        } else if (note) {
          if (tag in frontImageTagProps) {
            addTag(tokenObject, tag, note, frontImageTagProps[tag] as propType, undefined, {
              useUrl: true,
              useRootOnly: true,
            });
            if (tag == 'draft-image') {
              addProp(tokenObject, 'draft_image_status', HCImageStatus.HighRes);
            }
          } else if (tag == 'back-image') {
            addTag(tokenObject, tag, note, 'image', undefined, {
              useUrl: true,
              defaultToBack: true,
            });
            addTag(tokenObject, tag, note, 'image_status', HCImageStatus.HighRes, {
              defaultToBack: true,
              dontAddNote: true,
            });
          } else if (tag == 'flavor-name') {
            addTag(tokenObject, tag, note, 'flavor_name', undefined, { dontAddNote: true });
          } else {
            addTag(tokenObject, tag, note, undefined, undefined, { useRootOnly: true });
          }
        }
        return tag;
      });
      tokenObject.tags = Array.from(new Set(tokenObject.tags));

      tokenObject.tags.forEach((tag: string) => {
        if (tag == 'meld') {
          tokenObject.all_parts?.forEach((part: HCRelatedCard) => {
            part.component = 'meld_part';
          });
          (tokenObject as any).layout = 'meld_result';
        }
        // if (!('layout' in tokenObject)) {
        //   if (tag in singleLayoutTags) {
        //     tokenObject.layout = singleLayoutTags[tag];
        //   }
        // } else {
        //   if (tag in multiLayoutTags) {
        //     tokenObject.layout = multiLayoutTags[tag];
        //   }
        // }
      });
    }
    if (tokenObject.tags?.includes('meld')) {
      tokenObject.layout = HCLayout.MeldResult;
    } else if (
      tokenObject.card_faces[0].types &&
      tokenObject.card_faces[0].types[0] in typeLayouts
    ) {
      addPropToFace(tokenObject, 'layout', typeLayouts[tokenObject.card_faces[0].types[0]]);
    }
    const artistIndex = keys.indexOf('artists');
    if (entry[artistIndex]) {
      const artists = entry[artistIndex].split(';');

      tokenObject.artists = artists.map(fullArtist => {
        const hasNote = fullArtist.includes('<') && fullArtist.endsWith('>');
        const [artist, note] = [
          hasNote ? fullArtist.split('<')[0] : fullArtist,
          hasNote ? fullArtist.split('<')[1].slice(0, -1) : undefined,
        ];
        addArtist(tokenObject, artist, note);
        return artist;
      });
      tokenObject.artists = Array.from(new Set(tokenObject.artists));
    }

    tokenObject.card_faces.forEach((face, index) => {
      if (tokenObject.layout && tokenObject.layout in multiLayoutToFaceLayout) {
        addPropToFace(
          tokenObject,
          'layout',
          multiLayoutToFaceLayout[tokenObject.layout as keyof typeof multiLayoutToFaceLayout],
          index
        );
      } else if (!face.layout) {
        const layout = Object.keys(tagToFaceLayouts).find(tag => tokenObject.tags?.includes(tag));
        addPropToFace(
          tokenObject,
          'layout',
          tagToFaceLayouts[layout as keyof typeof tagToFaceLayouts] || HCLayout.Token,
          index
        );
      }
      (Object.keys(defaultFaceProps) as facePropType[])
        .filter(key => !face[key])
        .forEach(key => {
          addPropToFace(tokenObject, key, defaultFaceProps[key], index);
        });
    });
    (Object.keys(defaultProps) as propType[])
      .filter(key => !tokenObject[key])
      .forEach(key => {
        addProp(tokenObject, key, defaultProps[key]);
      });
    if (tokenObject.card_faces.length <= 1) {
      const layout =
        tokenObject.layout && tokenObject.layout in multiLayoutToFaceLayout
          ? multiLayoutToFaceLayout[tokenObject.layout as keyof typeof multiLayoutToFaceLayout]
          : tokenObject.card_faces[0].layout;
      return toSingleCard(tokenObject);
    } else {
      if (!tokenObject.layout) {
        tokenObject.layout = HCLayout.MultiToken;
      }
      const card = tokenObject as HCCard.AnyMultiFaced;
      setDerivedProps(card);
      return card;
    }
  });
  if (NO_SCRYFALL) {
    return HCTokens;
  } else {
    const ScryfallTokens = await fetchScryfallTokens();
    return HCTokens.concat(ScryfallTokens);
  }
};
