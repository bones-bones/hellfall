import { sheetsKey } from './env.ts';
import {
  HCCard,
  HCColor,
  HCColors,
  HCImageStatus,
  HCLegalitiesField,
  HCLegality,
  HCRelatedCard,
  HCObject,
  HCBorderColor,
  HCFrame,
  HCFinish,
} from '@hellfall/shared/types';
import {
  setDerivedProps,
  stripMasterpiece,
  isInteger,
  cardFaceType,
  cardObjectType,
  facePropType,
  faceValueType,
  propType,
  valueType,
  addArtist,
  addProp,
  addPropToFace,
  faceIsBattle,
  fillFacesTo,
  toSingleCard,
} from '@hellfall/shared/utils';

export const fetchDatabase = async (usingApproved: boolean = false) => {
  const url = usingApproved
    ? `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Database?alt=json&key=${sheetsKey}`
    : `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Database+(Unapproved)?alt=json&key=${sheetsKey}`;
  const requestedData = await fetch(url);
  const asJson = (await requestedData.json()) as any;
  const [_garbage, _oldKeys, ...rest] = asJson.values as string[][];
  const keys = [
    'hcid',
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
    'artists',
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

  const defaultProps: { [P in propType]?: valueType<P> } = {
    object: HCObject.ObjectType.Card,
    name: '',
    set: '',
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
    frame: HCFrame.Stamp,
    variation: false,
  };

  const defaultFaceProps: { [P in facePropType]?: faceValueType<P> } = {
    object: HCObject.ObjectType.CardFace,
    mana_cost: '',
    mana_value: 0,
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

  const allCards = rest.map(entry => {
    const cardObject: cardObjectType = { card_faces: [] as cardFaceType[] } as cardObjectType;
    for (let i = 0; i < keys.length; i++) {
      if (entry[i]) {
        if ('0123'.includes(keys[i][0])) {
          const face = parseInt(keys[i][0]);
          const key = keys[i].slice(1);
          if (key == 'colors') {
            const colorArr = entry[i]
              .split(';')
              .map(color => HCColor[color as keyof typeof HCColor]) as HCColors;
            addPropToFace(cardObject, key, colorArr, face);
            addProp(cardObject, key, colorArr);
          } else {
            const entryList = face == 3 ? entry[i].split(' // ') : [entry[i]];
            entryList.forEach((value, index) => {
              if (['supertypes', 'types', 'subtypes'].includes(key)) {
                addPropToFace(
                  cardObject,
                  key as 'supertypes' | 'types' | 'subtypes',
                  value.split(';'),
                  face + index
                );
              } else if (key == 'defense' && faceIsBattle(cardObject, face + index)) {
                addPropToFace(cardObject, 'defense', value, face + index);
              } else {
                addPropToFace(cardObject, key as facePropType, value, face + index);
              }
              if (key == 'image') {
                addPropToFace(cardObject, 'image_status', HCImageStatus.HighRes, face + index);
              }
            });
          }
        } else {
          if (keys[i] == 'mana_value') {
            addProp(
              cardObject,
              'mana_value',
              entry[i] != '∞'
                ? isInteger(entry[i])
                  ? parseInt(entry[i])
                  : parseFloat(entry[i])
                : 999999999999999
            ); // The Infinitoken case
          } else if (keys[i] == 'legalities') {
            const formats = entry[i].split(', ');
            const legalities: HCLegalitiesField = {
              standard: formats.includes('Not Legal')
                ? HCLegality.NotLegal
                : formats.includes('Banned')
                ? cardObject.set?.includes('HCV')
                  ? HCLegality.NotLegal
                  : HCLegality.Banned
                : HCLegality.Legal,
              '4cb': formats.includes('Not Legal')
                ? HCLegality.NotLegal
                : formats.includes('Banned (4CB)')
                ? cardObject.set?.includes('HCV')
                  ? HCLegality.NotLegal
                  : HCLegality.Banned
                : HCLegality.Legal,
              commander: formats.includes('Not Legal')
                ? HCLegality.NotLegal
                : formats.includes('Banned (Commander)')
                ? cardObject.set?.includes('HCV')
                  ? HCLegality.NotLegal
                  : HCLegality.Banned
                : HCLegality.Legal,
            };
            addProp(cardObject, 'legalities', legalities);
          } else if (keys[i] == 'related') {
            const all_parts: HCRelatedCard[] = entry[i].split(';').map(oldName => {
              const match = oldName.match(/(?<name>.*)(?<count>\*(?:\d+|x))$/);
              const name = match?.groups?.name ?? oldName;
              const count = match?.groups?.count;
              const base = name.replace(/\d+$/, '');
              const shouldUseBase =
                /\d/.test(name.at(-1)!) &&
                !hardCardNames.includes(name) &&
                base &&
                ![' ', '-', '^', '.', '/', '+', ',', "'"].includes(base.at(-1)!);

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
            addProp(cardObject, 'all_parts', all_parts);
          } else if (keys[i] == 'tags' || keys[i] == 'artists') {
            // now handling this at the end
          } else if (keys[i] == 'creators') {
            addProp(cardObject, 'creators', entry[i].split(';'));
          } else {
            addProp(cardObject, keys[i] as propType, entry[i]);
          }
          if (keys[i] == 'image') {
            addProp(cardObject, 'image_status', HCImageStatus.HighRes);
          }
        }
      }
    }
    if (cardObject.card_faces.length == 0) {
      fillFacesTo(cardObject, 0);
    }

    const name = entry[keys.indexOf('tags')].includes('irregular-face-name')
      ? []
      : (cardObject.card_faces.length > 1 && cardObject.tags?.includes('masterpiece')
          ? stripMasterpiece(entry[1])
          : entry[1]
        ).split(' // ');

    const artistIndex = keys.indexOf('artists');
    if (entry[artistIndex]) {
      const artists = entry[artistIndex].split(';');

      cardObject.artists = artists.map(fullArtist => {
        const hasNote = fullArtist.includes('<') && fullArtist.endsWith('>');
        const [artist, note] = [
          hasNote ? fullArtist.split('<')[0] : fullArtist,
          hasNote ? fullArtist.split('<')[1].slice(0, -1) : undefined,
        ];
        addArtist(cardObject, artist, note);
        return artist;
      });
      cardObject.artists = Array.from(new Set(cardObject.artists));
    }

    cardObject.card_faces.forEach((face, index) => {
      addPropToFace(cardObject, 'name', name.length > 0 ? name.shift()! : '', index);

      (Object.keys(defaultFaceProps) as facePropType[])
        .filter(key => !face[key])
        .forEach(key => {
          addPropToFace(cardObject, key, defaultFaceProps[key], index);
        });
    });

    (Object.keys(defaultProps) as propType[])
      .filter(key => !(key in cardObject))
      .forEach(key => {
        addProp(cardObject, key, defaultProps[key]);
      });
    const card =
      cardObject.card_faces.length <= 1
        ? toSingleCard(cardObject)
        : (cardObject as HCCard.AnyMultiFaced);
    setDerivedProps(card, entry[keys.indexOf('tags')].split(';'));
    card.tags?.forEach(tag => {
      if (tag == 'draftpartner' && card.all_parts) {
        card.all_parts[0].is_draft_partner = true;
        if (card.all_parts[0].component == 'token_maker') {
          // don't overwrite melds
          card.all_parts[0].component = 'draft_partner';
        }
        if (!card.tags?.includes('draftpartner-with-self')) {
          card.not_directly_draftable = true;
        }
        card.has_draft_partners = true;
      } else if (tag == 'meld' && card.all_parts) {
        card.all_parts[0].component = 'meld_part';
      } else if (tag == 'NotDirectlyDraftable') {
        // for Prismatic Pardner
        card.not_directly_draftable = true;
      }
    });
    return card;
  });

  return allCards;
};
