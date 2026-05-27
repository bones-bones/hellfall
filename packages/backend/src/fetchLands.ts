import {
  HCCard,
  HCImageStatus,
  HCLayout,
  HCLegalitiesField,
  HCLegality,
  HCObject,
  HCRarity,
  HCRelatedCard,
} from '@hellfall/shared/types';
import { sheetsKey } from './env.ts';
import {
  cardObjectType,
  facePropType,
  addArtist,
  addProp,
  addTag,
  landToColorMapping,
  setDerivedProps,
} from '@hellfall/shared/utils';

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
      set: convertSet[entry[keys.indexOf('set')]] ?? (entry[keys.indexOf('set')] || 'HBB'),
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
      land.supertypes?.push('Snow');
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
        const match = oldName.match(/(?<name>.*)(?<count>\*(?:\d+|x))$/);
        const name = match?.groups?.name ?? oldName;
        const count = match?.groups?.count;
        const base = name.replace(/\d+$/, '');
        const shouldUseBase =
          /\d/.test(name.at(-1)!) &&
          !hardCardNames.includes(name) &&
          base &&
          ![' ', '-', '^', '.', '/', '+', ',', "'"].includes(base.at(-1)!);
        const maker: HCRelatedCard = {
          object: HCObject.ObjectType.RelatedCard,
          id: shouldUseBase ? name : '', // #uuid
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
    setDerivedProps(land, entry[keys.indexOf('tags')].split(';'));
    return land;
  });
  return allLands;
};
