import { sheetsKey } from '../../keys';
import { HCCard, HCImageStatus, HCLayout, HCRelatedCard } from '../../src/api-types/Card';
import { HCColor, HCColors } from '../../src/api-types/Card';
import { HCObject } from '../../src/api-types/Object';
import { HCLegality, HCLegalitiesField } from '../../src/api-types/Card';

export const fetchTokens = async () => {
  const requestedData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Tokens+Database+(Unapproved)?alt=json&key=${sheetsKey}`
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
    'Sticker Sheet': HCLayout.Sticker,
    Dungeon: HCLayout.Dungeon,
    'Real Card': HCLayout.RealCardToken,
    'Ad Card': HCLayout.Misc,
    Misc: HCLayout.Misc,
  };

  const theThing = rest.map(entry => {
    const tokenObject: Record<string, any> = {};
    for (let i = 0; i < keys.length; i++) {
      if (entry[i] != '') {
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
    } else if ('types' in tokenObject && tokenObject.types.includes('Emblem')) {
      tokenObject.layout = HCLayout.Emblem;
    } else if ('types' in tokenObject && tokenObject.types.includes('Reminder Card')) {
      tokenObject.layout = HCLayout.Reminder;
    } else if ('types' in tokenObject && tokenObject.types.includes('Sticker Sheet')) {
      tokenObject.layout = HCLayout.Sticker;
    } else {
      tokenObject.layout = HCLayout.Token;
    }

    if ('types' in tokenObject) {
      if (tokenObject.types[0] in typeLayouts) {
        tokenObject.layout = typeLayouts[tokenObject.types[0]];
        if (tokenObject.types.length > 1) {
          tokenObject.types.shift();
        }
      }
      tokenObject.type_line = [tokenObject.types?.join(' '), tokenObject.subtypes?.join(' ')]
        .filter(Boolean)
        .join(' — ');
    } else {
      if ('subtypes' in tokenObject) {
        delete tokenObject.subtypes;
      }
    }
    const mandatoryProps = ['rulings', 'creator', 'cmc', 'type_line', 'oracle_text', 'mana_cost'];
    mandatoryProps
      .filter(prop => !(prop in tokenObject))
      .forEach(prop => (tokenObject[prop] = prop == 'cmc' ? 0 : ''));
    const legalities: HCLegalitiesField = {
      standard: HCLegality.NotLegal,
      '4cb': HCLegality.NotLegal,
      commander: HCLegality.NotLegal,
    };
    tokenObject.legalities = legalities;
    tokenObject.colors = [HCColor.Colorless] as HCColors;
    tokenObject.color_identity = [] as HCColors[];
    tokenObject.keywords = [];
    tokenObject.set = 'HCT';
    tokenObject.image_status = HCImageStatus.HighRes;

    tokenObject.isActualToken = true;
    tokenObject.variation = false;
    if (entry[6] == 'meld') {
      tokenObject.layout = HCLayout.MeldResult;
    }
    if (!('layout' in tokenObject)) {
      tokenObject.layout = HCLayout.Token;
    }
    return tokenObject as HCCard.Any;
  });
  return theThing;
};
