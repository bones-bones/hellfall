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
          tokenObject.types = entry[i].split(';');
        } else if (keys[i] == 'token_maker') {
          tokenObject.all_parts = entry[i].split(';').map(name => {
            const maker: HCRelatedCard = {
              object: HCObject.ObjectType.RelatedCard,
              id: '',
              component: 'token_maker',
              name: name,
              type_line: '',
            };
            return maker;
          });
        } else {
          tokenObject[keys[i]] == entry[i];
        }
      }
    }
    if ('types' in tokenObject) {
      tokenObject.type_line = [tokenObject.types?.join(' '), tokenObject.subtypes?.join(' ')]
        .filter(Boolean)
        .join(' — ');
    } else {
      if ('subtypes' in tokenObject) {
        delete tokenObject.subtypes;
      }
    }
    const mandatoryProps = ['rulings', 'creator', 'cmc', 'type_line', 'oracle_text'];
    mandatoryProps
      .filter(prop => !(prop in tokenObject))
      .forEach(key => (tokenObject[key] = key == 'cmc' ? 0 : ''));
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
    tokenObject.image_status = HCImageStatus.HighResScan;

    tokenObject.isActualToken = true;
    tokenObject.variation = false;
    tokenObject.layout = HCLayout.Normal;
    return tokenObject as HCCard.AnySingleFaced;
  });
  return theThing;
};
