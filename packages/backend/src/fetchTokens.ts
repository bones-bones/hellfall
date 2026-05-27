import { sheetsKey } from './env.ts';
import {
  HCCard,
  HCImageStatus,
  HCRelatedCard,
  HCColors,
  HCObject,
  HCLegality,
  HCLegalitiesField,
  HCBorderColor,
  HCFrame,
  HCFinish,
} from '@hellfall/shared/types';
import { fetchScryfallTokens } from './fetchScryfallTokens.ts';
import {
  cardFaceType,
  cardObjectType,
  facePropType,
  faceValueType,
  propType,
  valueType,
  addProp,
  addPropToFace,
  toSingleCard,
  addArtist,
  setDerivedProps,
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

  const HCTokens = rest.map(entry => {
    const tokenObject: cardObjectType = { card_faces: [] as cardFaceType[] } as cardObjectType;
    for (let i = 0; i < keys.length; i++) {
      if (entry[i]) {
        if (keys[i] == 'name') {
          tokenObject.hcid = entry[i];
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
              id:'',
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
    const token =
      tokenObject.card_faces.length <= 1
        ? toSingleCard(tokenObject)
        : (tokenObject as HCCard.AnyMultiFaced);
    setDerivedProps(token, entry[keys.indexOf('tags')].split(';'));
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
