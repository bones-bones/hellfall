import { sheetsKey } from './env.ts';
import { HCImageStatus, HCRelatedCard, HCObject, HCKind, HCFrame } from '@hellfall/shared/types';
import { fetchScryfallTokens } from './fetchScryfallTokens.ts';
import {
  propType,
  addProp,
  addArtist,
  setDerivedProps,
  getDefaultCard,
  addPropToFaceOrRoot,
} from '@hellfall/shared/utils';

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
  ] as const;

  type keyType = (typeof keys)[number];

  rest.forEach(row => {
    while (row.length < keys.length) {
      row.push('');
    }
  });

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
  const splitKeys: keyType[] = ['name', 'types', 'power', 'toughness'];
  const skipKeys: keyType[] = ['image', 'collector_number', 'creators', 'tags', 'artists'];

  const HCTokens = rest.map(entry => {
    const entryAt = (key: keyType) => entry[keys.indexOf(key)];
    const token = getDefaultCard(
      HCKind.Token,
      splitKeys.some(key => entry[keys.indexOf(key)].includes(' // ')),
      {
        hcid: entryAt('name'),
        set: 'HCT',
        image: entryAt('image'),
        image_status: HCImageStatus.HighRes,
        creators: entryAt('creators').split(';'),
        collector_number: entryAt('collector_number'),
      },
      {}
    );
    for (let i = 0; i < keys.length; i++) {
      if (entry[i] && !skipKeys.includes(keys[i])) {
        if (keys[i] == 'name') {
          token.name = hardTokenIds.includes(entry[i])
            ? entry[i].slice(0, -1)
            : entry[i].replace(/\d+$/, '');
        }
        if (['name', 'types', 'power', 'toughness'].includes(keys[i])) {
          const entryList = (keys[i] == 'name' ? token.name! : entry[i]).split(' // ');
          entryList.forEach((value, index) => {
            if (keys[i] == 'name') {
              addPropToFaceOrRoot(token, 'name', value, index);
              addPropToFaceOrRoot(token, 'subtypes', value.split(' '), index);
            } else if (keys[i] == 'types') {
              const typesAndSupertypes = value.split(';');
              const superList: string[] = [];
              const typeList: string[] = [];
              typesAndSupertypes.forEach(e => {
                supers.includes(e) ? superList.push(e) : typeList.push(e);
              });
              if (superList?.length) {
                addPropToFaceOrRoot(token, 'supertypes', superList, index);
              }
              if (typeList?.length) {
                addPropToFaceOrRoot(token, 'types', typeList, index);
              }
            } else if (['power', 'toughness'].includes(keys[i])) {
              addPropToFaceOrRoot(token, keys[i] as 'power' | 'toughness', value, index);
            }
          });
        } else if (keys[i] == 'token_maker') {
          const all_parts = entry[i].split(';').map(oldName => {
            const match = oldName.match(/(?<name>.*)(?<count>\*(?:\d+|x))$/);
            const name = match?.groups?.name ?? oldName;
            const count = match?.groups?.count;
            const base = hardTokenIds.includes(name) ? name.slice(0, -1) : name.replace(/\d+$/, '');
            const shouldUseBase =
              hardTokenIds.includes(name) ||
              (/\d/.test(name.at(-1)!) &&
                !hardCardNames.includes(name) &&
                base &&
                ![' ', '-', '^', '.', '/', '+', ',', "'"].includes(base.at(-1)!));
            const maker: HCRelatedCard = {
              object: HCObject.ObjectType.RelatedCard,
              id: '',
              hcid: shouldUseBase ? name : '',
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
          addProp(token, 'all_parts', all_parts);
        } else if (keys[i] == 'tags' || keys[i] == 'artists') {
          // now handling this at the end
        } else {
          addProp(token, keys[i] as propType, entry[i]);
        }
      }
    }
    const artistIndex = keys.indexOf('artists');
    if (entry[artistIndex]) {
      const artists = entry[artistIndex].split(';');

      token.artists = artists.map(fullArtist => {
        const hasNote = fullArtist.includes('<') && fullArtist.endsWith('>');
        const [artist, note] = [
          hasNote ? fullArtist.split('<')[0] : fullArtist,
          hasNote ? fullArtist.split('<')[1].slice(0, -1) : undefined,
        ];
        addArtist(token, artist, note);
        return artist;
      });
      token.artists = Array.from(new Set(token.artists));
    }

    setDerivedProps(token, entryAt('tags').split(';'));
    if (token.tags?.includes('meld')) {
      token.all_parts?.forEach(part => (part.component = 'meld_part'));
    }
    return token;
  });
  if (NO_SCRYFALL) {
    return HCTokens;
  } else {
    const ScryfallTokens = await fetchScryfallTokens();
    return HCTokens.concat(ScryfallTokens);
  }
};
