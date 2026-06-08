import {
  HCCard,
  HCImageStatus,
  HCKind,
  HCLegality,
  HCObject,
  HCRarity,
  HCRelatedCard,
  SetCode,
} from '@hellfall/shared/types';
import { sheetsKey } from './env.ts';
import {
  addArtist,
  landToColorMapping,
  setDerivedProps,
  getDefaultCard,
  HCIDMap,
  pushPropToRoot,
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

export const landOracleIds: Record<string, string> = {
  plains: 'bc71ebf6-2056-41f7-be35-b2e5c34afa99',
  island: 'b2c6aa39-2d2a-459c-a555-fb48ba993373',
  swamp: '56719f6a-1a6c-4c0a-8d21-18f7d7350b68',
  mountain: 'a3fb7228-e76b-4e96-a40e-20b5fed75685',
  forest: 'b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6',
  nebula: 'fad3359c-6c3d-4a94-8d7c-4f833d82cb8d',
  wastes: '05d24b0c-904a-46b6-b42a-96a4d91a0dd4',
  'snow-covered plains': 'ac8cc74d-e43b-4118-bba0-dfa8b9c04d45',
  'snow-covered island': '5b2460a5-6ae5-4cad-ba94-1a9e98e6e4c0',
  'snow-covered swamp': 'd8239a86-7184-4005-ba1e-2dddcd756c47',
  'snow-covered mountain': 'ca9f660b-e07d-4f42-a46e-abd0ca72510c',
  'snow-covered forest': '5f0d3be8-e63e-4ade-ae58-6b0c14f2ce6d',
  'snow-covered nebula': '2c268e90-9bec-45c3-9c99-436761643f3c',
  'snow-covered wastes': '46a07b53-ff58-4bd6-80dd-ded2eb0e29a3',
  'thriving heath': 'd1946630-e224-40db-8f0d-388b09622288',
  'thriving isle': '69fc70b8-b143-4662-ac95-e2743037239d',
  'thriving moor': 'b7c7d0c0-ada6-4c89-b47b-977e35e67b39',
  'thriving bluff': '91fceb34-0f2d-4392-be27-00dcd765637f',
  'thriving grove': 'a8052556-8962-4130-86a8-6fb7b6a324f7',
};

export const fetchLands = async () => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Lands+(Unapproved)?alt=json&key=${sheetsKey}`;
  const requestedData = await fetch(url);
  const asJson = (await requestedData.json()) as any;

  const [_oldKeys, ...rest] = asJson.values as string[][];
  const keys = [
    'hcid',
    'name',
    'image',
    'creators',
    'set',
    'rarity',
    'token_maker',
    'tags',
    'collector_number',
    'artists',
  ] as const;

  type keyType = (typeof keys)[number];

  const allLands = rest.map(entry => {
    const entryAt = (key: keyType) => entry[keys.indexOf(key)];
    const land = getDefaultCard(
      HCKind.Land,
      false,
      {
        object: HCObject.ObjectType.Card,
        oracle_id:
          Object.entries(landOracleIds).find(([name, id]) =>
            entryAt('name').toLowerCase().startsWith(name)
          )?.[1] ?? '',
        hcid: entryAt('hcid'),
        name: entryAt('name'),
        set: (convertSet[entryAt('set')] ?? (entryAt('set') || 'HBB')) as SetCode,
        collector_number: entryAt('collector_number'),
        rarity: entryAt('rarity').toLowerCase().split(' ')[0] as HCRarity,
        image: entryAt('image'),
        image_status: HCImageStatus.HighRes,
        legalities: {
          standard: HCLegality.Legal,
          '4cb': HCLegality.Legal,
          commander: HCLegality.Legal,
        },
        creators: entryAt('creators').split(';'),
      },
      {
        supertypes: ['Basic'],
        types: ['Land'],
      }
    ) as HCCard.AnySingleFaced;

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
    if (entryAt('token_maker')) {
      entryAt('token_maker')
        .split(';')
        .forEach(oldName => {
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
            id: '',
            hcid: shouldUseBase ? name : '',
            name: shouldUseBase ? base : name,
            set: '' as SetCode,
            image: '',
            type_line: '',
            component: 'token_maker',
          };
          if (count) {
            maker.count = count.slice(1);
          }
          pushPropToRoot(land, 'all_parts', maker);
        });
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
        addArtist(land, artist, note);
        return artist;
      });
      land.artists = Array.from(new Set(land.artists));
    }
    setDerivedProps(land, entryAt('tags').split(';'));
    return land;
  });
  return new HCIDMap(allLands);
};
