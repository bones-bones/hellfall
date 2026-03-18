import { sheetsKey } from '../../keys';
import { HCCard, HCImageStatus, HCLayout, HCRelatedCard } from '../../src/api-types/Card';
import { HCColor, HCColors } from '../../src/api-types/Card';
import { HCObject } from '../../src/api-types/Object';
import { HCLegality, HCLegalitiesField } from '../../src/api-types/Card';

const discordToSymbolMatching: Record<string, string> = {
  '<:mana0:636012942243921931>': '{0}',
  '<:mana1:636012942655225876>': '{1}',
  '<:mana2:636012942986444830>': '{2}',
  '<:mana3:636012942940438557>': '{3}',
  '<:mana4:636012943670247427>': '{4}',
  '<:mana5:636012944101998592>': '{5}',
  '<:mana7:636012944643063828>': '{7}',
  '<:mana8:636017404819931143>': '{8}',
  '<:manaX:636014007962042398>': '{X}',
  '<:manaW:636012953535119373>': '{W}',
  '<:manaU:636012951928832001>': '{U}',
  '<:manaR:636012953157632030>': '{R}',
  '<:manaC:636012967938490383>.': '{C}',
  '<:manaRG:636012967405813781>': '{R/G}',
  '<:symbolT:663209472637796382>': '{T}',
};

export const fetchNotMagic = async () => {
  const requestedData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/NotMagic+(Unapproved)?alt=json&key=${sheetsKey}`
  );
  const asJson = (await requestedData.json()) as any;
  const [_garbage, _oldKeys, ...rest] = asJson.values as string[][];
  const keys = [
    'game',
    'name',
    'image',
    'creator',
    'rulings',
    'cmc',
    'colors',
    'mana_cost',
    'supertypes',
    'types',
    'subtypes',
    'power',
    'toughness',
    'loyalty',
    'oracle_text',
  ];
  rest.forEach(row => {
    while (row.length < keys.length) {
      row.push('');
    }
  });

  const defaultProps: Record<string, any> = {
    rulings: '',
    creator: '',
    legalities: {
      standard: HCLegality.NotLegal,
      '4cb': HCLegality.NotLegal,
      commander: HCLegality.NotLegal,
    } as HCLegalitiesField,
    cmc: 0,
    colors: [HCColor.Colorless] as HCColors,
    color_identity: [] as HCColors,
    color_identity_hybrid: [] as HCColors[],
    keywords: [],
    set: 'NotMagic',
    variation: false,
    isActualToken: true,
    image_status: HCImageStatus.MedRes,
    draft_image_status: HCImageStatus.Inapplicable,
    layout: HCLayout.NotMagic,
  };

  const theThing = rest.map(entry => {
    const tokenObject: Record<string, any> = {};
    for (let i = 0; i < keys.length; i++) {
      if (entry[i]) {
        if (keys[i] == 'name') {
          tokenObject.id = entry[i] + ['Pot of Greed'].includes(entry[i]) ? '3' : '1';
          const name: string = entry[i].replace(/\d+$/, '');
          tokenObject.name = name;
          tokenObject.subtypes = name.split(' ');
        } else if (keys[i] == 'colors') {
          const colorArr = entry[i]
            .split(';')
            .map(color => HCColor[color as keyof typeof HCColor]) as HCColors;
          tokenObject[keys[i]] =
            entry[i] && colorArr.length ? colorArr : ([HCColor.Colorless] as HCColors);
        } else if (['supertypes', 'types', 'subtypes'].includes(keys[i])) {
          tokenObject[keys[i]] = entry[i].split(';');
        } else if (keys[i] == 'loyalty' && tokenObject['types']?.includes('Battle')) {
          tokenObject.defense = entry[i];
        } else if (['rulings', 'oracle_text'].includes(keys[i])) {
          const textList = entry[i].match(/<[^>]*>|[^<>]+/g) || [];
          tokenObject[keys[i]] = textList
            .map(text => {
              return text[0] == '<' ? discordToSymbolMatching[text] : text;
            })
            .join('');
        } else if (keys[i] == 'game') {
          tokenObject.tags = [entry[i].toLowerCase().replace(' ', '-')];
        } else {
          tokenObject[keys[i]] = entry[i];
        }
      }
    }
    Object.keys(defaultProps)
      .filter(key => !(key in tokenObject))
      .forEach(key => {
        tokenObject[key] = defaultProps[key];
      });
    return tokenObject as HCCard.Any;
  });
  return theThing;
};
