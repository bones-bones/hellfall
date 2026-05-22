import {
  HCBorderColor,
  HCCard,
  HCFinish,
  HCFrame,
  HCFrameEffect,
  HCImageStatus,
  HCLayout,
  HCLegalitiesField,
  HCLegality,
  HCObject,
  HCRarity,
  HCRelatedCard,
} from '@hellfall/shared/types/index.ts';
import { sheetsKey } from './env.ts';
import fs from 'fs';
import { landToColorMapping } from './derivedProps.ts';
import { cardObjectType, facePropType } from '@hellfall/shared/utils/index.ts';
import { addArtist, addProp, addTag } from './fetchUtils.ts';

const convertSet: Record<string, string> = {
  HC4: 'HBB.4',
  Old: 'HBB.0',
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

const faceImageTagProps: Record<string, facePropType> = {
  'rotated-image': 'rotated_image',
  'still-image': 'still_image',
};

export const fetchLands = async () => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Lands+(Unapproved)?alt=json&key=${sheetsKey}`;
  const requestedData = await fetch(url);
  const asJson = (await requestedData.json()) as any;

  const [_oldKeys, ...rest] = asJson.values as string[][];
  const keys = [
    'id',
    'name',
    'image',
    'creators',
    'set',
    'rarity',
    'token_maker',
    'tags',
    'collector_number',
    'artists',
  ];

  const allLands = rest.map(entry => {
    const land = {
      object: HCObject.ObjectType.Card,
      id: entry[keys.indexOf('id')],
      name: entry[keys.indexOf('name')],
      set: convertSet[entry[keys.indexOf('set')]] ?? 'HBB',
      collector_number: entry[keys.indexOf('collector_number')],
      layout: HCLayout.Normal,
      image: entry[keys.indexOf('image')],
      image_status: HCImageStatus.HighRes,
      mana_cost: '',
      mana_value: 0,
      supertypes: ['Basic'],
      types: ['Land'],
      type_line: '',
      oracle_text: '',
      colors: [],
      color_identity: [],
      color_identity_hybrid: [],
      keywords: [],
      legalities: {
        standard: HCLegality.Legal,
        '4cb': HCLegality.Legal,
        commander: HCLegality.Legal,
      } as HCLegalitiesField,
      creators: entry[keys.indexOf('creators')].split(';'),
      rulings: '',
      finish: 'nonfoil',
      border_color: 'black',
      frame: '2015',
      variation: false,
    } as Omit<HCCard.Normal, 'toJSON'> as HCCard.Normal;

    if (entry[keys.indexOf('rarity')]) {
      land.rarity = entry[keys.indexOf('rarity')].toLowerCase().split(' ')[0] as HCRarity;
    }
    const splitName = land.name.split(' ');
    if (splitName[0] == 'Snow-Covered') {
      land.supertypes?.unshift('Snow');
      splitName.shift();
    }
    if (splitName[0] in landToColorMapping) {
      land.subtypes = [splitName[0]];
      land.oracle_text = `({T}: Add {${landToColorMapping[splitName[0]]}}.)`;
    } else {
      land.oracle_text = '{T}: Add {C}.';
    }
    if (entry[keys.indexOf('token_maker')]) {
      const all_parts = entry[keys.indexOf('token_maker')].split(';').map(oldName => {
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
      addProp(land, 'all_parts', all_parts);
    }
    const tagIndex = keys.indexOf('tags');
    if (entry[tagIndex]) {
      const tags = entry[tagIndex].split(';');

      land.tags = tags.map(fullTag => {
        const hasNote = fullTag.includes('<') && fullTag.endsWith('>');
        const [tag, note] = [
          hasNote ? fullTag.split('<')[0] : fullTag,
          hasNote ? fullTag.split('<')[1].slice(0, -1) : undefined,
        ];
        if (tag.slice(tag.lastIndexOf('-') + 1) == 'watermark') {
          addTag(
            land as cardObjectType,
            tag,
            note,
            'watermark',
            tag.slice(0, tag.lastIndexOf('-')),
            { useRootOnly: true }
          );
        } else if (tag in frameTags) {
          addTag(land as cardObjectType, tag, note, 'frame', frameTags), { useRootOnly: true };
        } else if (tag in frameEffectTags) {
          addTag(land as cardObjectType, tag, note, 'frame_effects', frameEffectTags, {
            push: true,
            useRootOnly: true,
          });
        } else if (tag in faceImageTagProps) {
          addTag(land as cardObjectType, tag, note, faceImageTagProps[tag], undefined, {
            useUrl: true,
            useRootOnly: true,
          });
        } else if (tag in borderColorTags) {
          addTag(land as cardObjectType, tag, note, 'border_color', borderColorTags, {
            useRootOnly: true,
          });
        } else if (tag == 'foil') {
          addTag(land as cardObjectType, tag, note, 'finish', HCFinish.Foil, { useRootOnly: true });
        } else if (note) {
          addTag(land as cardObjectType, tag, note, undefined, undefined, { useRootOnly: true });
        }
        return tag;
      });
      land.tags = Array.from(new Set(land.tags));
    }
    const artistIndex = keys.indexOf('artists');
    if (entry[artistIndex]) {
      const artists = entry[artistIndex].split(';');

      land.artists = artists.map(fullArtist => {
        const hasNote = fullArtist.includes('<') && fullArtist.endsWith('>');
        const [artist, note] = [
          hasNote ? fullArtist.split('<')[0] : fullArtist,
          hasNote ? fullArtist.split('<')[1].slice(0, -1) : undefined,
        ];
        addArtist(land as cardObjectType, artist, note);
        return artist;
      });
      land.artists = Array.from(new Set(land.artists));
    }
    return land;
  });
  return allLands;
};
