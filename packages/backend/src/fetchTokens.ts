import { sheetsKey } from '../keys.ts';
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

export const fetchTokens = async (NO_SCRYFALL: boolean) => {
  const requestedData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Tokens+Database+(Unapproved)?alt=json&key=${sheetsKey}`
  );
  const asJson = (await requestedData.json()) as any;

  const [_oldkeys, ...rest] = asJson.values as string[][];
  const keys = [
    'name',
    'image',
    'type',
    'power',
    'toughness',
    'token_maker',
    'oracle_text',
    'creators',
    'tags',
  ];
  rest.forEach(row => {
    while (row.length < keys.length) {
      row.push('');
    }
  });
  const supers = ['Basic', 'Legendary', 'Snow', 'World', 'Minigame', 'Token', 'EVIL', 'WET'];
  const typeLayouts: Record<string, HCLayout> = {
    Emblem: HCLayout.Emblem,
    'Reminder Card': HCLayout.Reminder,
    Stickers: HCLayout.Stickers,
    Dungeon: HCLayout.Dungeon,
    'Real Card': HCLayout.RealCardToken,
    'Ad Card': HCLayout.Misc,
    Misc: HCLayout.Misc,
    Checklist: HCLayout.Checklist,
  };
  const defaultProps: Record<string, any> = {
    rulings: '',
    creators: [],
    legalities: {
      standard: HCLegality.NotLegal,
      '4cb': HCLegality.NotLegal,
      commander: HCLegality.NotLegal,
    } as HCLegalitiesField,
    mana_cost: '',
    colors: [] as HCColors,
    mana_value: 0,
    oracle_text: '',
    color_identity: [] as HCColors,
    color_identity_hybrid: [] as HCColors[],
    keywords: [],
    set: 'HCT',
    variation: false,
    image_status: HCImageStatus.HighRes,
    isActualToken: true,
    type_line: '',
    layout: HCLayout.Token,
    border_color: HCBorderColor.Black,
    frame: HCFrame.NewToken,
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
  const hardTokenIds: string[] = ['Clue© 19861', '+21', '+41'];

  // const multiLayoutTags: Record<string, HCLayoutGroup.MultiFacedType> = {
  //   'draftpartner-faces': HCLayout.DraftPartner,
  //   'reminder-on-back': HCLayout.ReminderOnBack,
  //   'dungeon-in-inset': HCLayout.DungeonInInset,
  //   'dungeon-on-back': HCLayout.DungeonOnBack,
  //   'stickers-on-back': HCLayout.StickersOnBack,
  //   'token-in-inset': HCLayout.TokenInInset,
  //   'token-on-back': HCLayout.TokenOnBack,
  //   specialize: HCLayout.Specialize,
  //   mdfc: HCLayout.Modal,
  //   transform: HCLayout.Transform,
  //   flip: HCLayout.Flip,
  //   inset: HCLayout.Inset,
  //   prepare: HCLayout.Prepare,
  //   aftermath: HCLayout.Aftermath,
  //   split: HCLayout.Split,
  // };

  const singleLayoutTags: Record<string, HCLayout> = {
    meld: HCLayout.MeldResult,
    'weird-leveler': HCLayout.Leveler,
    leveler: HCLayout.Leveler,
    'weird-1-mana-levelers-cycle': HCLayout.Leveler,
    'mutate-layout': HCLayout.Mutate,
    noncard: HCLayout.Misc,
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

  const imageTagProps: Record<string, string> = {
    'rotated-image': 'rotated_image',
    'still-image': 'still_image',
  };

  // const multiLayoutToFaceLayout:Record<HCLayoutGroup.MultiFacedType & HCLayoutGroup.TokenLayoutType, HCLayoutGroup.FaceLayoutType>= {
  //   'multi_reminder':HCLayout.Reminder,
  //   'multi_not_magic':HCLayout.NotMagic,
  //   'multi_token':HCLayout.Token,
  //   'real_card_multi_token':HCLayout.RealCardToken
  // }

  const HCTokens = rest.map(entry => {
    const tokenObject: Record<string, any> = {};
    for (let i = 0; i < keys.length; i++) {
      if (entry[i]) {
        if (keys[i] == 'name') {
          tokenObject.id = entry[i];
          const name = hardTokenIds.includes(entry[i])
            ? entry[i].slice(0, -1)
            : entry[i].replace(/\d+$/, '');
          tokenObject.name = name;
          tokenObject.subtypes = name.split(' ');
        } else if (keys[i] == 'type') {
          const typesAndSupertypes = entry[i].split(';');
          const superList: string[] = [];
          const typeList: string[] = [];
          typesAndSupertypes.forEach(e => {
            supers.includes(e) ? superList.push(e) : typeList.push(e);
          });
          if (superList?.length) {
            tokenObject.supertypes = superList;
          }
          if (typeList?.length) {
            tokenObject.types = typeList;
          }
        } else if (keys[i] == 'creators') {
          tokenObject[keys[i]] = entry[i].split(';');
        } else if (keys[i] == 'token_maker') {
          tokenObject.all_parts = entry[i].split(';').map(oldName => {
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
              component:
                // entry[6] == 'meld' ? 'meld_part' :
                'token_maker',
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
          // } else if (keys[i] == 'oracle_text' && tagList.includes(entry[i])) {
          //   tokenObject.tags = [entry[i]];
        } else if (keys[i] == 'tags') {
          // now handling this at the end
        } else {
          tokenObject[keys[i]] = entry[i];
        }
      }
    }
    const tagIndex = keys.indexOf('tags');
    if (entry[tagIndex]) {
      const tags = entry[tagIndex].split(';');

      tokenObject.tags = tags.map(fullTag => {
        if (fullTag.includes('<') && fullTag.includes('>')) {
          const [tag, note] = [fullTag.split('<')[0], fullTag.split('<')[1].slice(0, -1)];
          if (tag in imageTagProps) {
            if (note.includes(';')) {
              const [face, image] = [parseInt(note.split(';')[0]), note.split(';')[1]];
              tokenObject[imageTagProps[tag]] =
                image.slice(0, 4) == 'http'
                  ? image
                  : 'https://lh3.googleusercontent.com/d/' + image;
              if (!('tag_notes' in tokenObject)) {
                tokenObject.tag_notes = {} as Record<string, string>;
              }
              tokenObject.tag_notes[tag] = face;
            } else {
              tokenObject[imageTagProps[tag]] =
                note.slice(0, 4) == 'http' ? note : 'https://lh3.googleusercontent.com/d/' + note;
            }
          } else {
            if (tag.slice(tag.lastIndexOf('-') + 1) == 'watermark') {
              tokenObject.watermark = tag.slice(0, tag.lastIndexOf('-'));
            } else if (tag in frameTags) {
              tokenObject.frame = frameTags[tag];
            } else if (tag in frameEffectTags) {
              if (tokenObject.frame_effects) {
                tokenObject.frame_effects.push(frameEffectTags[tag]);
              } else {
                tokenObject.frame_effects = [frameEffectTags[tag]];
              }
            }
            if (!('tag_notes' in tokenObject)) {
              tokenObject.tag_notes = {} as Record<string, string>;
            }
            tokenObject.tag_notes[tag] = note;
          }
          return tag;
        } else {
          if (fullTag.slice(fullTag.lastIndexOf('-') + 1) == 'watermark') {
            tokenObject.watermark = fullTag.slice(0, fullTag.lastIndexOf('-'));
          } else if (fullTag in frameTags) {
            tokenObject.frame = frameTags[fullTag];
          } else if (fullTag in frameEffectTags) {
            if ('frame_effects' in tokenObject) {
              tokenObject.frame_effects.push(frameEffectTags[fullTag]);
            } else {
              tokenObject.frame_effects = [frameEffectTags[fullTag]];
            }
          }
          return fullTag;
        }
      });
      tokenObject.tags = Array.from(new Set(tokenObject.tags));

      tokenObject.tags.forEach((tag: string) => {
        if (tag == 'meld') {
          tokenObject.all_parts[0].component = 'meld_result';
          tokenObject.layout = 'meld_result';
        }
        if (!('layout' in tokenObject)) {
          if (tag in singleLayoutTags) {
            tokenObject.layout = singleLayoutTags[tag];
          }
          // } else {
          //   if (tag in multiLayoutTags) {
          //     tokenObject.layout = multiLayoutTags[tag];
          //   }
        }
        if (!('border_color' in tokenObject) && tag in borderColorTags) {
          tokenObject.border_color = borderColorTags[tag];
          // } else if (!('frame' in tokenObject) && tag in frameTags) {
          //   tokenObject.frame = frameTags[tag];
        } else if (tag == 'foil') {
          tokenObject.finish = HCFinish.Foil;
        } else if (
          tag == 'flavor-name' &&
          'tag_notes' in tokenObject &&
          tag in tokenObject.tag_notes
        ) {
          tokenObject.flavor_name = tokenObject.tag_notes[tag];
        }
      });
    }
    if (tokenObject.tags?.includes('meld')) {
      tokenObject.layout = HCLayout.MeldResult;
    } else if ('types' in tokenObject && tokenObject.types[0] in typeLayouts) {
      tokenObject.layout = typeLayouts[tokenObject.types[0]];
      if (tokenObject.types.length > 1) {
        tokenObject.types.shift();
      }
    }
    // if ('types' in tokenObject || 'supertypes' in tokenObject) {
    //   tokenObject.type_line = [
    //     tokenObject.supertypes?.join(' '),
    //     [tokenObject.types?.join(' '), tokenObject.subtypes?.join(' ')].filter(Boolean).join(' — '),
    //   ]
    //     .filter(Boolean)
    //     .join(' ') as string;
    // } else {
    //   if ('subtypes' in tokenObject) {
    //     delete tokenObject.subtypes;
    //   }
    //   tokenObject.type_line = '';
    // }
    Object.keys(defaultProps)
      .filter(key => !(key in tokenObject))
      .forEach(key => {
        tokenObject[key] = defaultProps[key];
      });
    return tokenObject as HCCard.Any;
  });
  if (NO_SCRYFALL) {
    return HCTokens;
  } else {
    const ScryfallTokens = await fetchScryfallTokens();
    return HCTokens.concat(ScryfallTokens);
  }
};
