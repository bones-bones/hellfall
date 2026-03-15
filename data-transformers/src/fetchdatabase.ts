import { sheetsKey } from '../../keys';
import { HCCard } from '../../src/api-types/Card/Card';
import { HCColor, HCColors, HCImageStatus, HCLayout } from '../../src/api-types/Card/values';
import { HCLegalitiesField, HCFormat, HCLegality } from '../../src/api-types/Card/values';
import { HCRelatedCard } from '../../src/api-types/Card/RelatedCard';
import { HCObject } from '../../src/api-types/Object';
import { getColorIdentityProps } from '../../src/hellfall/getColorIdentity';

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

  const defaultProps: Record<string, any> = {
    name: '',
    rulings: '',
    creator: '',
    legalities: {
      standard: HCLegality.Banned,
      '4cb': HCLegality.Banned,
      commander: HCLegality.Banned,
    } as HCLegalitiesField,
    cmc: 0,
    colors: [HCColor.Colorless] as HCColors,
    keywords: [],
    set: '',
    variation: false,
    draft_image_status: HCImageStatus.Inapplicable,
  };

  const defaultMultiFaceProps: Record<string, any> = {
    mana_cost: '',
    colors: [HCColor.Colorless] as HCColors,
    oracle_text: '',
  };

  const theThing = rest.map(entry => {
    const cardObject: Record<string, any> & { card_faces: Record<string, any>[] } = {
      card_faces: [],
    };
    for (let i = 0; i < keys.length; i++) {
      if (entry[i]) {
        if ('0123'.includes(keys[i][0])) {
          const face = parseInt(keys[i][0]);
          const key = keys[i].slice(1);

          if (face == 3 && entry[i].includes(' // ')) {
            const entryList = entry[i].split(' // ');
            entryList.forEach((value, index) => {
              while (cardObject.card_faces.length <= face + index) {
                cardObject.card_faces.push({} as Record<string, any>);
              }
              if (['supertypes', 'types', 'subtypes'].includes(key)) {
                cardObject.card_faces[face + index][key] = value.split(';');
              } else if (
                key == 'loyalty' &&
                cardObject.card_faces[face + index]['types']?.includes('Battle')
              ) {
                cardObject.card_faces[face + index].defense = value;
              } else {
                cardObject.card_faces[face + index][key] = value;
              }
              if (key == 'image') {
                // entry[20] is tags
                cardObject.card_faces[face + index].image_status =
                  entry[20] && entry[20].includes('low-quality')
                    ? HCImageStatus.LowRes
                    : HCImageStatus.HighRes;
              }
            });
          } else {
            while (cardObject.card_faces.length <= face) {
              cardObject.card_faces.push({} as Record<string, any>);
            }
            if (key == 'colors') {
              const colorArr = entry[i]
                .split(';')
                .map(color => HCColor[color as keyof typeof HCColor]) as HCColors;
              cardObject.card_faces[face][key] =
                entry[i] && colorArr.length ? colorArr : ([HCColor.Colorless] as HCColors);
              cardObject.colors =
                entry[i] && colorArr.length ? colorArr : ([HCColor.Colorless] as HCColors);
            } else if (['supertypes', 'types', 'subtypes'].includes(key)) {
              cardObject.card_faces[face][key] = entry[i].split(';');
            } else if (
              key == 'loyalty' &&
              cardObject.card_faces[face]['types']?.includes('Battle')
            ) {
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
          }
        } else {
          if (keys[i] == 'cmc') {
            cardObject[keys[i]] = entry[i] != '∞' ? parseInt(entry[i]) : 9999999999999999999999999; // The Infinitoken case
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
            // entry[20] is tags, entry[17] is 0oracle_text, entry[6] is Related Cards
            const all_parts: [HCRelatedCard] = [
              {
                object: HCObject.ObjectType.RelatedCard,
                id: '',
                component:
                  entry[17].toLowerCase().includes('meld') || entry[20].includes('meld')
                    ? 'meld_part'
                    : entry[20].includes('draftpartner')
                    ? 'draft_partner'
                    : 'token_maker',
                name: entry[i],
                type_line: '',
                set: '',
                image: '',
              },
            ];
            if (
              entry[6] != 'Head of the Forbidden One' &&
              (entry[17].toLowerCase().includes('meld') ||
                entry[20].includes('meld') ||
                entry[20].includes('draftpartner'))
            ) {
              all_parts[0].is_draft_partner = true;
              cardObject.not_directly_draftable = true;
              cardObject.has_draft_partners = true;
            }
            cardObject.all_parts = all_parts;
          } else if (keys[i] == 'tags') {
            const tags = entry[i].split(';');
            cardObject[keys[i]] = tags;
            if (entry[i].includes('watermark')) {
              cardObject.card_faces[0].watermark = tags
                .filter(tag => tag.includes('watermark'))[0]
                .split('-')[0];
              // tags.filter(tag=>tag.includes('watermark')).forEach((tag,index)=>{
              //   cardObject.card_faces[index].watermark=tag.split("-")[0]
              // })
            }
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
      if (!('image_status' in face) || ['split'].includes(face.image_status)) {
        if (index == 0) {
          face.image_status = HCImageStatus.Front;
        } else if (
          'tags' in cardObject &&
          cardObject.tags.includes('flip')
          /*  || ('oracle_text' in cardObject.card_faces[0] && cardObject.card_faces[0].oracle_text.toLowerCase().includes("flip")) */
        ) {
          face.image_status = HCImageStatus.Flip;
        } else if (
          'tags' in cardObject &&
          cardObject.tags.includes('aftermath')
          /*  || ('oracle_text' in face && face.oracle_text.toLowerCase().includes("aftermath")) */
        ) {
          face.image_status = HCImageStatus.Aftermath;
        } else if (
          'tags' in cardObject &&
          cardObject.tags.includes('inset')
          // || 'subtypes' in face &&
          // (face.subtypes.includes('Adventure') || face.subtypes.includes('Omen'))
        ) {
          face.image_status = HCImageStatus.Inset;
        } else if (cardObject.card_faces[0].oracle_text.toLowerCase().includes('draftpartner')) {
          face.image_status = HCImageStatus.DraftPartner;
        } else {
          face.image_status = HCImageStatus.Split;
        }
      }
      Object.keys(defaultMultiFaceProps)
        .filter(key => !(key in face))
        .forEach(key => {
          face[key] = defaultMultiFaceProps[key];
        });
      mana_cost_list.push(face.mana_cost);
    });

    cardObject.type_line = type_line_list.join(' // ');
    cardObject.mana_cost = mana_cost_list.filter(e => e).join(' // ');

    const { color_identity, color_identity_hybrid } = getColorIdentityProps(
      cardObject as HCCard.AnyMultiFaced
    );
    cardObject.color_identity = color_identity;
    cardObject.color_identity_hybrid = color_identity_hybrid;
    Object.keys(defaultProps)
      .filter(key => !(key in cardObject))
      .forEach(key => {
        cardObject[key] = defaultProps[key];
      });
    if (
      cardObject.card_faces.length <= 1 ||
      cardObject.card_faces[0]?.oracle_text?.toLowerCase().includes('draftpartner')
    ) {
      if ('image' in cardObject.card_faces[0] && cardObject.card_faces[0].image) {
        if ('image' in cardObject && cardObject.image) {
          cardObject.draft_image = cardObject.image;
          cardObject.draft_image_status = cardObject.image_status;
        }
        cardObject.image = cardObject.card_faces[0].image;
        cardObject.image_status = cardObject.card_faces[0].image_status;
        delete cardObject.card_faces[0].image;
        cardObject.card_faces[0].image_status = 'front';
      }
    }

    if (cardObject.card_faces.length <= 1) {
      for (const [key, value] of Object.entries(cardObject.card_faces[0]).filter(
        ([k, v]) =>
          !['name', 'type_line', 'mana_cost', 'image_status', 'colors', 'image'].includes(k)
      )) {
        cardObject[key] = value;
      }
      const { card_faces, ...singleCard } = cardObject;
      singleCard.layout = HCLayout.Normal;
      return singleCard as HCCard.AnySingleFaced;
    } else {
      if (
        cardObject.card_faces[0].image &&
        (cardObject.card_faces.filter(e => e.image).length == 1 ||
          cardObject.tags?.includes('meld') ||
          cardObject.tags?.includes('draftpartner'))
      ) {
        if ('image' in cardObject && cardObject.image) {
          cardObject.draft_image = cardObject.image;
          cardObject.draft_image_status = cardObject.image_status;
        }
        cardObject.image = cardObject.card_faces[0].image;
        cardObject.image_status = cardObject.card_faces[0].image_status;
        delete cardObject.card_faces[0].image;
        cardObject.card_faces[0].image_status = 'front';
      }
      if (cardObject.card_faces[0].oracle_text.toLowerCase().includes('meld')) {
        cardObject.layout = HCLayout.MeldPart;
        if ('all_parts' in cardObject) {
          cardObject.all_parts[0].component = 'meld_part';
        }
      }
      if (!('layout' in cardObject)) {
        if (cardObject.tags?.includes('reminder-on-back')) {
          cardObject.layout = HCLayout.ReminderOnBack;
          cardObject.card_faces[-1].image_status = HCImageStatus.Reminder;
        } else if (cardObject.tags?.includes('dungeon-on-back')) {
          cardObject.layout = HCLayout.DungeonOnBack;
          cardObject.card_faces[-1].image_status = HCImageStatus.Dungeon;
        } else if (cardObject.tags?.includes('stickers-on-back')) {
          cardObject.layout = HCLayout.StickersOnBack;
          cardObject.card_faces[-1].image_status = HCImageStatus.Stickers;
        } else if (cardObject.tags?.includes('token-on-back')) {
          cardObject.layout = HCLayout.TokenOnBack;
          cardObject.card_faces[-1].image_status = HCImageStatus.Token;
        } else {
          // const names = entry[1];
          // entry[6] is Related Cards
          cardObject.layout =
            // cardObject.card_faces[0].oracle_text.toLowerCase().includes('meld')
            // ? HCLayout.MeldPart:
            HCLayout.Multi;
        }
      }
      return cardObject as HCCard.AnyMultiFaced;
    }
  });

  return theThing; //.filter((e) => e.Set != "C");
};
