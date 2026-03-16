import { sheetsKey } from '../../keys';
import { HCCard, HCImageStatus, HCLayout, HCRelatedCard } from '../../src/api-types/Card';
import { HCColor, HCColors } from '../../src/api-types/Card';
import { HCObject } from '../../src/api-types/Object';
import { HCLegality, HCLegalitiesField } from '../../src/api-types/Card';

export const fetchTokens = async () => {
  const requestedData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Tokens+Database?alt=json&key=${sheetsKey}`
  );
  const asJson = (await requestedData.json()) as any;

  const [oldkeys, ...rest] = asJson.values as string[][];
  const keys = [
    'name',
    'image',
    'type',
    'power',
    'toughness',
    'token_maker',
    'oracle_text',
    'creator',
  ];
  rest.forEach(row => {
    while (row.length < keys.length) {
      row.push('');
    }
  });
  const supers = ['Basic', 'Legendary', 'Snow', 'World', 'Minigame', 'Token'];
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
    creator: '',
    legalities: {
      standard: HCLegality.NotLegal,
      '4cb': HCLegality.NotLegal,
      commander: HCLegality.NotLegal,
    } as HCLegalitiesField,
    mana_cost: '',
    colors: [HCColor.Colorless] as HCColors,
    cmc: 0,
    color_identity: [] as HCColors,
    color_identity_hybrid: [] as HCColors[],
    keywords: [],
    set: 'HCT',
    variation: false,
    image_status: HCImageStatus.HighRes,
    isActualToken: true,
  };

  const theThing = rest.map(entry => {
    const tokenObject: Record<string, any> = {};
    for (let i = 0; i < keys.length; i++) {
      if (entry[i]) {
        if (keys[i] == 'name') {
          tokenObject.id = entry[i];
          const name: string = entry[i].replace(/\d+$/, '');
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
        } else if (keys[i] == 'token_maker') {
          tokenObject.all_parts = entry[i].split(';').map(name => {
            const maker: HCRelatedCard = {
              object: HCObject.ObjectType.RelatedCard,
              id: '',
              component: entry[6] == 'meld' ? 'meld_part' : 'token_maker',
              name: name.replace(/\*\d+$/, ''),
              type_line: '',
              set: '',
              image: '',
            };
            return maker;
          });
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
    } else {
      tokenObject.layout = HCLayout.Token;
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
    const mandatoryProps = ['rulings', 'creator', 'cmc', 'type_line', 'oracle_text', 'mana_cost'];
    mandatoryProps
      .filter(prop => !(prop in tokenObject))
      .forEach(prop => (tokenObject[prop] = prop == 'cmc' ? 0 : ''));
    const legalities: HCLegalitiesField = {
      standard: HCLegality.NotLegal,
      '4cb': HCLegality.NotLegal,
      commander: HCLegality.NotLegal,
    };
    return tokenObject as HCCard.Any;
  });
  return theThing;
};
