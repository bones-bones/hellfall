import { sheetsKey } from '../../keys';
import { HCCard } from '../../src/api-types/Card/Card';
import { HCColor, HCColors, HCImageStatus, HCLayout } from '../../src/api-types/Card/values';
import { HCLegalitiesField, HCFormat, HCLegality } from '../../src/api-types/Card/values';
import { HCRelatedCard } from '../../src/api-types/Card/RelatedCard';
import { HCObject } from '../../src/api-types/Object';
import { getColorIdentityProp } from '../../src/hellfall/getColorIdentity';

export const fetchDatabase = async () => {
  const requestedData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Database+(Unapproved)?alt=json&key=${sheetsKey}`
  );
  const asJson = (await requestedData.json()) as any;
  const [_garbage, oldKeys, ...rest] = asJson.values as string[][];
  const keys = [
    'id',
    'name',
    'image',
    'creator',
    'set',
    'legalities',
    'related',
    'rulings',
    'cmc',
    '0colors',
    '0mana_cost',
    '0supertypes',
    '0types',
    '0subtypes',
    '0power',
    '0toughness',
    '0loyalty',
    '0oracle_text',
    '0flavor_text',
    '0image',
    'tags',
    '1mana_cost',
    '1supertypes',
    '1types',
    '1subtypes',
    '1power',
    '1toughness',
    '1loyalty',
    '1oracle_text',
    '1flavor_text',
    '1image',
    '2mana_cost',
    '2supertypes',
    '2types',
    '2subtypes',
    '2power',
    '2toughness',
    '2loyalty',
    '2oracle_text',
    '2flavor_text',
    '2image',
    '3mana_cost',
    '3supertypes',
    '3types',
    '3subtypes',
    '3power',
    '3toughness',
    '3loyalty',
    '3oracle_text',
    '3flavor_text',
    '3image',
  ];
  rest.forEach(row => {
    while (row.length < keys.length) {
      row.push('');
    }
  });

  const theThing = rest.map(entry => {
    const cardObject: Record<string, any> & { card_faces: Record<string, any>[] } = {
      card_faces: [],
    };
    for (let i = 0; i < keys.length; i++) {
      if (entry[i]) {
        if ('0123'.includes(keys[i][0])) {
          const face = parseInt(keys[i][0]);
          const key = keys[i].slice(1);
          while (cardObject.card_faces.length <= face) {
            cardObject.card_faces.push({} as Record<string, any>);
          }
          if (key == 'colors') {
            const colorArr = entry[i]
              .split(';')
              .map(color => HCColor[color as keyof typeof HCColor]) as HCColors;
            cardObject.card_faces[face][key] = colorArr?.length
              ? colorArr
              : ([HCColor.Colorless] as HCColors);
            cardObject.colors = colorArr?.length ? colorArr : ([HCColor.Colorless] as HCColors);
          } else if (['supertypes', 'types', 'subtypes'].includes(key)) {
            cardObject.card_faces[face][key] = entry[i].split(';');
          } else if (key == 'loyalty' && cardObject.card_faces[face]['types']?.includes('Battle')) {
            cardObject.card_faces[face].defense = entry[i];
          } else {
            cardObject.card_faces[face][key] = entry[i];
          }
          if (key == 'image') {
            // entry[20] is tags
            cardObject.card_faces[face].image_status =
              entry[20] && entry[20].includes('low-quality')
                ? HCImageStatus.LowRes
                : HCImageStatus.HighRes;
          }
        } else {
          if (keys[i] == 'cmc') {
            cardObject[keys[i]] = parseInt(entry[i]);
          } else if (keys[i] == 'legalities') {
            const formats = entry[i].split(', ');
            const legalities: HCLegalitiesField = {
              standard: formats.includes('Banned') ? HCLegality.Banned : HCLegality.Legal,
              '4cb': formats.includes('Banned (4CB)') ? HCLegality.Banned : HCLegality.Legal,
              commander: formats.includes('Banned (Commander)')
                ? HCLegality.Banned
                : HCLegality.Legal,
            };
            cardObject[keys[i]] = legalities;
          } else if (keys[i] == 'related') {
            const all_parts: [HCRelatedCard] = [
              {
                object: HCObject.ObjectType.RelatedCard,
                id: '',
                component: 'combo_piece',
                name: entry[i],
                type_line: '',
              },
            ];
          } else if (keys[i] == 'tags') {
            cardObject[keys[i]] = entry[i].split(';');
          } else {
            cardObject[keys[i]] = entry[i];
          }
          if (keys[i] == 'image') {
            cardObject.image_status =
              entry[20] && entry[20].includes('low-quality')
                ? HCImageStatus.LowRes
                : HCImageStatus.MedRes;
          }
        }
      }
    }
    if (cardObject.card_faces.length == 0) {
      cardObject.card_faces.push({} as Record<string, any>);
    }
    cardObject.keywords = [];
    cardObject.variation = false;

    const name = entry[1].split(' // ');
    const type_line_list: string[] = [];
    const mana_cost_list: string[] = [];
    cardObject.card_faces.forEach((face, index) => {
      face.name = name.length > 0 ? name.shift() : '';
      const face_type = [
        face.supertypes?.join(' '),
        [face.types?.join(' '), face.subtypes?.join(' ')].filter(Boolean).join(' — '),
      ]
        .filter(Boolean)
        .join(' ') as string;
      face.type_line = face_type;
      type_line_list.push(face_type);
      if (!('mana_cost' in face)) {
        face.mana_cost = '';
      }
      mana_cost_list.push(face.mana_cost);
      if (!('colors' in face)) {
        face.colors = [HCColor.Colorless] as HCColors;
      }
      if (!('image_status' in face) || ['split'].includes(face.image_status)) {
        if (index == 0) {
          face.image_status = HCImageStatus.Front;
        } else if (
          'tags' in cardObject &&
          cardObject.tags.includes(
            'flip'
          ) /*  || ('oracle_text' in cardObject.card_faces[0] && cardObject.card_faces[0].oracle_text.toLowerCase().includes("flip")) */
        ) {
          face.image_status = HCImageStatus.Flip;
        } else if (
          'tags' in cardObject &&
          cardObject.tags.includes(
            'aftermath'
          ) /*  || ('oracle_text' in face && face.oracle_text.toLowerCase().includes("aftermath")) */
        ) {
          face.image_status = HCImageStatus.Aftermath;
        } else if (
          'subtypes' in face &&
          (face.subtypes.includes('Adventure') || face.subtypes.includes('Omen'))
        ) {
          face.image_status = HCImageStatus.Inset;
        } else {
          face.image_status = HCImageStatus.Split;
        }
      }
      if (!('oracle_text' in face)) {
        face.oracle_text = '';
      }
    });

    cardObject.type_line = type_line_list.join(' // ');
    cardObject.mana_cost = mana_cost_list.filter(e => e).join(' // ');

    cardObject.color_identity = getColorIdentityProp(cardObject as HCCard.AnyMultiFaced);
    const mandatoryProps = ['rulings', 'creator', 'cmc'];
    mandatoryProps
      .filter(prop => !(prop in cardObject))
      .forEach(key => (cardObject[key] = key == 'cmc' ? 0 : ''));

    if (cardObject.card_faces.length <= 1) {
      for (const [key, value] of Object.entries(cardObject.card_faces[0]).filter(
        ([key, value]) =>
          !['name', 'type_line', 'mana_cost', 'image_status', 'colors'].includes(key)
      )) {
        cardObject[key] = value;
      }
      const { card_faces, ...singleCard } = cardObject;
      singleCard.layout = HCLayout.Normal;
      return singleCard as HCCard.AnySingleFaced;
    } else {
      // const names = entry[1];
      // entry[6] is Related Cards
      cardObject.layout =
        cardObject.card_faces[0].oracle_text.toLowerCase().includes('meld') || entry[6]
          ? HCLayout.MeldPart
          : HCLayout.Multi;
      return cardObject as HCCard.AnyMultiFaced;
    }
  });

  return theThing; //.filter((e) => e.Set != "C");
};
