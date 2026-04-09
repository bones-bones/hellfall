import { sheetsKey } from '../keys.ts';
import { HCCard, HCColor, HCColors, HCImageStatus, HCLayout, HCLegalitiesField, HCFormat, HCLegality, HCRelatedCard, HCObject } from '@hellfall/shared/types/';
import { getColorIdentityProps, setDerivedProps } from './derivedProps.ts';
import { stripMasterpiece } from '@hellfall/shared/utils/textHandling.ts';

export const fetchDatabase = async (usingApproved: boolean = false) => {
  const url = usingApproved
    ? `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Database?alt=json&key=${sheetsKey}`
    : `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Database+(Unapproved)?alt=json&key=${sheetsKey}`;
  const requestedData = await fetch(url);
  const asJson = (await requestedData.json()) as any;
  const [_garbage, _oldKeys, ...rest] = asJson.values as string[][];
  const keys = [
    'id',
    'name',
    'image',
    'creators',
    'set',
    'legalities',
    'related',
    'rulings',
    'mana_value',
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
    creators: [],
    legalities: {
      standard: HCLegality.Banned,
      '4cb': HCLegality.Banned,
      commander: HCLegality.Banned,
    } as HCLegalitiesField,
    mana_value: 0,
    colors: [] as HCColors,
    color_identity: [] as HCColors,
    color_identity_hybrid: [] as HCColors[],
    keywords: [],
    set: '',
    variation: false,
    draft_image_status: HCImageStatus.Inapplicable,
  };

  const defaultMultiFaceProps: Record<string, any> = {
    mana_cost: '',
    mana_value: 0,
    colors: [] as HCColors,
    oracle_text: '',
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
                    : HCImageStatus.MedRes;
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
              cardObject.card_faces[face][key] = colorArr;
              // entry[i] && colorArr.length ? colorArr : ([HCColor.Colorless] as HCColors);
              cardObject.colors = colorArr;
              // entry[i] && colorArr.length ? colorArr : ([HCColor.Colorless] as HCColors);
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
                  : HCImageStatus.MedRes;
            }
          }
        } else {
          if (keys[i] == 'mana_value') {
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
            const all_parts: HCRelatedCard[] = entry[i].split(';').map(name => {
              const base = name.replace(/\d+$/, '');
              const shouldUseBase =
                /\d/.test(name.at(-1)!) &&
                !hardCardNames.includes(name) &&
                base &&
                ![' ', '-', '^', '.', '/', '+', ',', "'"].includes(base.at(-1)!);

              const maker: HCRelatedCard = {
                object: HCObject.ObjectType.RelatedCard,
                id: shouldUseBase ? name : '',
                component:
                  entry[17].toLowerCase().includes('meld') || entry[20].includes('meld')
                    ? 'meld_part'
                    : entry[20].includes('draftpartner')
                    ? 'draft_partner'
                    : 'token_maker',
                name: shouldUseBase ? base : name,
                type_line: '',
                set: '',
                image: '',
              };
              return maker;
            });

            // const all_parts: [HCRelatedCard] = [
            //   {
            //     object: HCObject.ObjectType.RelatedCard,
            //     id: '',
            // component:
            //   entry[17].toLowerCase().includes('meld') || entry[20].includes('meld')
            //     ? 'meld_part'
            //     : entry[20].includes('draftpartner')
            //     ? 'draft_partner'
            //     : 'token_maker',
            //     name: entry[i],
            //     type_line: '',
            //     set: '',
            //     image: '',
            //   },
            // ];
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
            cardObject[keys[i]] = tags.map(fullTag => {
              if (fullTag.includes('<') && fullTag.includes('>')) {
                const [tag, note] = fullTag.split('<');
                if (!('tag_notes' in cardObject)) {
                  cardObject.tag_notes = {} as Record<string, string>;
                }
                cardObject.tag_notes[tag] = note.slice(0, -1);
                return tag;
              } else {
                return fullTag;
              }
            });
            if (entry[i].includes('watermark')) {
              cardObject.card_faces[0].watermark = tags
                .filter(tag => tag.includes('watermark'))[0]
                .split('-')[0];
            }
          } else if (keys[i] == 'creators') {
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

    const name = cardObject.tags?.includes('irregular-face-name')
      ? []
      : (cardObject.card_faces.length > 1 && cardObject.tags?.includes('masterpiece')
          ? stripMasterpiece(entry[1])
          : entry[1]
        ).split(' // ');
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
      if (!('image_status' in face) /**|| ['split'].includes(face.image_status)*/) {
        if (index == 0) {
          face.image_status = HCImageStatus.Front;
        } else if (
          cardObject.tags?.includes('draftpartner') ||
          cardObject.card_faces[0].oracle_text?.toLowerCase().includes('draftpartner')
        ) {
          face.image_status = HCImageStatus.DraftPartner;
        } else if (
          // the inset check correctly handles mr. crime 1981
          (cardObject.tags?.includes('reminder-on-back') && !cardObject.tags?.includes('inset')) ||
          face.types?.includes('Reminder Card') ||
          face.types?.includes('Spellbook')
        ) {
          face.image_status = HCImageStatus.Reminder;
        } else if (
          cardObject.tags?.includes('dungeon-on-back') ||
          cardObject.tags?.includes('dungeon-in-inset') ||
          face.types?.includes('Dungeon')
        ) {
          face.image_status = HCImageStatus.Dungeon;
        } else if (
          cardObject.tags?.includes('stickers-on-back') ||
          face.types?.includes('Stickers')
        ) {
          face.image_status = HCImageStatus.Stickers;
        } else if (
          cardObject.tags?.includes('token-on-back') ||
          cardObject.tags?.includes('token-in-inset') ||
          face.supertypes?.includes('Token')
        ) {
          face.image_status = HCImageStatus.Token;
        } else if (
          cardObject.tags?.includes('flip') ||
          cardObject.card_faces[0].oracle_text?.toLowerCase().includes('flip')
        ) {
          face.image_status = HCImageStatus.Flip;
        } else if (
          cardObject.tags?.includes('aftermath') ||
          face.oracle_text?.toLowerCase().includes('aftermath')
        ) {
          face.image_status = HCImageStatus.Aftermath;
        } else if (
          cardObject.tags?.includes('inset') ||
          face.subtypes?.some(
            (sub: string) =>
              ['Adventure', 'Omen', 'Departure', 'Odyssey', 'Return'].includes(sub) ||
              (index == 1 &&
                cardObject.card_faces[0].oracle_text.toLowerCase().includes('prepared'))
          )
        ) {
          face.image_status = HCImageStatus.Inset;
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

    // const { color_identity, color_identity_hybrid } = getColorIdentityProps(
    //   cardObject as HCCard.AnyMultiFaced
    // );
    // cardObject.color_identity = color_identity;
    // cardObject.color_identity_hybrid = color_identity_hybrid;
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
          ![
            'name',
            'type_line',
            'mana_cost',
            'mana_value',
            'image_status',
            'colors',
            'image',
          ].includes(k)
      )) {
        cardObject[key] = value;
      }
      const { card_faces, ...singleCard } = cardObject;
      singleCard.layout = singleCard.tags?.includes('noncard') ? HCLayout.Misc : HCLayout.Normal;
      const card = singleCard as HCCard.AnySingleFaced;
      setDerivedProps(card);
      return card;
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
      if (!('layout' in cardObject)) {
        if (
          cardObject.tags?.includes('meld') ||
          cardObject.card_faces[0].oracle_text.toLowerCase().includes('meld')
        ) {
          cardObject.layout = HCLayout.MeldPart;
          if ('all_parts' in cardObject) {
            cardObject.all_parts[0].component = 'meld_part';
          }
        } else if (
          cardObject.tags?.includes('draftpartner') ||
          cardObject.card_faces[0].oracle_text.toLowerCase().includes('draftpartner')
        ) {
          cardObject.layout = HCLayout.DraftPartner;
        } else if (
          cardObject.tags?.includes('reminder-on-back') ||
          cardObject.card_faces.at(-1)?.types?.includes('Reminder Card') ||
          cardObject.card_faces.at(-1)?.types?.includes('QR Code')
        ) {
          cardObject.layout = HCLayout.ReminderOnBack;
        } else if (
          cardObject.tags?.includes('dungeon-in-inset') ||
          (cardObject.card_faces.at(-1)?.supertypes?.includes('Dungeon') && !entry[19])
        ) {
          // entry[19] is 0image
          cardObject.layout = HCLayout.DungeonInInset;
        } else if (
          cardObject.tags?.includes('dungeon-on-back') ||
          cardObject.card_faces.at(-1)?.types?.includes('Dungeon')
        ) {
          cardObject.layout = HCLayout.DungeonOnBack;
        } else if (
          cardObject.tags?.includes('stickers-on-back') ||
          cardObject.card_faces.at(-1)?.types?.includes('Stickers')
        ) {
          cardObject.layout = HCLayout.StickersOnBack;
        } else if (
          cardObject.tags?.includes('token-in-inset') ||
          (cardObject.card_faces.at(-1)?.supertypes?.includes('Token') && !entry[19])
        ) {
          // entry[19] is 0image
          cardObject.layout = HCLayout.TokenInInset;
        } else if (
          cardObject.tags?.includes('token-on-back') ||
          cardObject.card_faces.at(-1)?.supertypes?.includes('Token')
        ) {
          cardObject.layout = HCLayout.TokenOnBack;
        } else if (cardObject.tags?.includes('specialize')) {
          cardObject.layout = HCLayout.Specialize;
        } else if (cardObject.tags?.includes('mdfc')) {
          cardObject.layout = HCLayout.Modal;
        } else if (
          cardObject.tags?.includes('transform') ||
          cardObject.card_faces[0].oracle_text.toLowerCase().includes('transform')
        ) {
          cardObject.layout = HCLayout.Transform;
        } else if (cardObject.card_faces.slice(1).find(e => e.image)) {
          if (cardObject.card_faces.slice(1).some(face => face.mana_cost && face.image)) {
            cardObject.layout = HCLayout.Modal;
          } else {
            cardObject.layout = HCLayout.Transform;
          }
        } else if (
          cardObject.tags?.includes('flip') ||
          cardObject.card_faces[0].oracle_text.toLowerCase().includes('flip')
        ) {
          cardObject.layout = HCLayout.Flip;
        } else if (
          cardObject.tags?.includes('inset') ||
          cardObject.card_faces.some(face =>
            face.subtypes?.some((sub: string) =>
              ['Adventure', 'Omen', 'Departure', 'Odyssey', 'Return'].includes(sub)
            )
          ) ||
          cardObject.card_faces[0].oracle_text.toLowerCase().includes('prepared')
        ) {
          cardObject.layout = HCLayout.Inset;
        } else if (
          cardObject.tags?.includes('aftermath') ||
          cardObject.card_faces.some(face => face.oracle_text.toLowerCase().includes('aftermath'))
        ) {
          cardObject.layout = HCLayout.Aftermath;
        } else {
          cardObject.layout = HCLayout.Split;
        }
      }
      const card = cardObject as HCCard.AnyMultiFaced;
      setDerivedProps(card);
      return card;
    }
  });

  return theThing; //.filter((e) => e.Set != "C");
};
