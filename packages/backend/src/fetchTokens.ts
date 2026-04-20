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
    full_image_status: HCImageStatus.Inapplicable,
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

  const tagList = [
    'pokemon',
    'mario',
    'my-little-pony',
    'barbie',
    'super-smash-bros',
    'dune',
    'disney',
    'earthworm-jim',
    'sesame-street',
    'pixar',
    'wwe',
    'universal',
    'konami',
    'yugioh',
    'garfield',
    'scooby-doo',
    'marvel',
    'godzilla',
    'spongebob',
    'star-wars',
    'zelda',
    'pvz',
    'slay-the-spire',
    'south-park',
    'undertale',
    'lego',
    'final-fantasy',
    'where-in-the-world-is-carmen-sandiego',
    'inscryption',
    'gaslighting',
  ];

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
              component: entry[6] == 'meld' ? 'meld_part' : 'token_maker',
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
        } else if (keys[i] == 'oracle_text' && tagList.includes(entry[i])) {
          tokenObject.tags = [entry[i]];
        } else {
          tokenObject[keys[i]] = entry[i];
        }
      }
    }
    if (entry[6] == 'meld') {
      tokenObject.layout = HCLayout.MeldResult;
    } else if ('types' in tokenObject && tokenObject.types[0] in typeLayouts) {
      tokenObject.layout = typeLayouts[tokenObject.types[0]];
      if (tokenObject.types.length > 1) {
        tokenObject.types.shift();
      }
    }
    // } else if ('types' in tokenObject && tokenObject.types.includes('Emblem')) {
    //   tokenObject.layout = HCLayout.Emblem;
    // } else if ('types' in tokenObject && tokenObject.types.includes('Reminder Card')) {
    //   tokenObject.layout = HCLayout.Reminder;
    // } else if ('types' in tokenObject && tokenObject.types.includes('Stickers')) {
    //   tokenObject.layout = HCLayout.Stickers;
    // } else {
    //   tokenObject.layout = HCLayout.Token;
    // }
    if ('types' in tokenObject || 'supertypes' in tokenObject) {
      tokenObject.type_line = [
        tokenObject.supertypes?.join(' '),
        [tokenObject.types?.join(' '), tokenObject.subtypes?.join(' ')].filter(Boolean).join(' — '),
      ]
        .filter(Boolean)
        .join(' ') as string;
    } else {
      if ('subtypes' in tokenObject) {
        delete tokenObject.subtypes;
      }
      tokenObject.type_line = '';
    }
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
