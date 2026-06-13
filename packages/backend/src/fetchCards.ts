import { sheetsKey } from './env.ts';
import {
  HCColor,
  HCImageStatus,
  HCLegalitiesField,
  HCLegality,
  HCRelatedCard,
  HCObject,
  HCKind,
  SetCode,
} from '@hellfall/shared/types';
import {
  setDerivedProps,
  isInteger,
  addArtist,
  addPropToFace,
  getDefaultCard,
  HCIDMap,
  frontIsBattle,
  facePropType,
  addPropToRoot,
  rootPropType,
  pushPropToRoot,
  orderColors,
  getPipColorsFromText,
  listEquals,
  toFaces,
} from '@hellfall/shared/utils';
import { pipsData } from '@hellfall/shared/data';

export const fetchCards = async (usingApproved: boolean = false) => {
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
    'colors',
    'mana_cost',
    'supertypes',
    'types',
    'subtypes',
    'power',
    'toughness',
    'loyalty',
    'oracle_text',
    'flavor_text',
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
  ] as const;

  type keyType = (typeof keys)[number];

  rest.forEach(row => {
    while (row.length < keys.length) {
      row.push('');
    }
  });

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

  const skipKeys: keyType[] = [
    'hcid',
    'image',
    'creators',
    'set',
    'rulings',
    'mana_value',
    'colors',
    'mana_cost',
    'supertypes',
    'types',
    'subtypes',
    'power',
    'toughness',
    'loyalty',
    'oracle_text',
    'flavor_text',
    '0image',
    'artists',
    'tags',
  ];
  const pips = pipsData.data;

  const allCards = rest.map(entry => {
    const entryAt = (key: keyType) => entry[keys.indexOf(key)];
    const cardIsMulti = entry.slice(keys.indexOf('1mana_cost')).some(value => value);
    const card = getDefaultCard(
      HCKind.Card,
      cardIsMulti,
      {
        hcid: entryAt('hcid'),
        image: entryAt('image'),
        image_status: HCImageStatus.HighRes,
        creators: entryAt('creators').split(';'),
        set: entryAt('set') as SetCode,
        rulings: entryAt('rulings'),
        mana_value:
          entryAt('mana_value') != '∞'
            ? isInteger(entryAt('mana_value'))
              ? parseInt(entryAt('mana_value'))
              : parseFloat(entryAt('mana_value'))
            : 999999999999999,
        colors: entryAt('colors')?entryAt('colors').split(';').map(color => HCColor[color as keyof typeof HCColor]):[],
      },
      {
        colors: cardIsMulti
          ? orderColors(getPipColorsFromText(entryAt('mana_cost')).flatMap(c => c).filter(c=>c!='C'))
          : entryAt('colors')?entryAt('colors').split(';').map(color => HCColor[color as keyof typeof HCColor]):[],
        mana_cost: entryAt('mana_cost'),
        supertypes: entryAt('supertypes').split(';'),
        types: entryAt('types').split(';'),
        subtypes: entryAt('subtypes').split(';'),
        power: entryAt('power'),
        toughness: entryAt('toughness'),
        loyalty: !entryAt('types').toLowerCase().includes('battle') ? entryAt('loyalty') : '',
        defense: entryAt('types').toLowerCase().includes('battle') ? entryAt('loyalty') : '',
        oracle_text: entryAt('oracle_text'),
        flavor_text: entryAt('flavor_text'),
        image: entryAt('0image'),
        image_status: entryAt('0image') ? HCImageStatus.HighRes : undefined,
      }
    );
    const costColors = orderColors(getPipColorsFromText(entryAt('mana_cost')).flatMap(c => c).filter(c=>c!='C'));
    if (!costColors.length && card.colors.length && !cardIsMulti && card.set != 'NRM') {
      addPropToFace(card,'color_indicator',card.colors)
    }
    for (let i = 0; i < keys.length; i++) {
      if (entry[i] && !skipKeys.includes(keys[i])) {
        if ('123'.includes(keys[i][0])) {
          const face = parseInt(keys[i][0]);
          const key = keys[i].slice(1);
          const entryList = face == 3 ? entry[i].split(' // ') : [entry[i]];
          entryList.forEach((value, index) => {
            if (['supertypes', 'types', 'subtypes'].includes(key)) {
              addPropToFace(
                card,
                key as 'supertypes' | 'types' | 'subtypes',
                value.split(';'),
                face + index
              );
            } else if (key == 'loyalty' && frontIsBattle(card, face + index)) {
              addPropToFace(card, 'defense', value, face + index);
            } else {
              addPropToFace(card, key as facePropType, value, face + index);
            }
            if (key == 'mana_cost') {
              addPropToFace(
                card,
                'colors',
                orderColors(getPipColorsFromText(value).flatMap(c => c).filter(c=>c!='C')),
                face+index
              );
            }
            if (key == 'image') {
              addPropToFace(card, 'image_status', HCImageStatus.HighRes, face + index);
            }
          });
        } else {
          if (keys[i] == 'legalities') {
            const formats = entry[i].split(', ');
            const legalities: HCLegalitiesField = {
              standard: formats.includes('Not Legal')
                ? HCLegality.NotLegal
                : formats.includes('Banned')
                ? card.set?.includes('HCV')
                  ? HCLegality.NotLegal
                  : HCLegality.Banned
                : HCLegality.Legal,
              '4cb': formats.includes('Not Legal')
                ? HCLegality.NotLegal
                : formats.includes('Banned (4CB)')
                ? card.set?.includes('HCV')
                  ? HCLegality.NotLegal
                  : HCLegality.Banned
                : HCLegality.Legal,
              commander: formats.includes('Not Legal')
                ? HCLegality.NotLegal
                : formats.includes('Banned (Commander)')
                ? card.set?.includes('HCV')
                  ? HCLegality.NotLegal
                  : HCLegality.Banned
                : HCLegality.Legal,
            };
            addPropToRoot(card, 'legalities', legalities);
          } else if (keys[i] == 'related') {
            entry[i].split(';').forEach(oldName => {
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
                set: '' as SetCode,
                image: '',
                type_line: '',
                component: 'token_maker',
              };
              if (count) {
                maker.count = count.slice(1);
              }
              pushPropToRoot(card, 'all_parts', maker);
            });
          } else {
            addPropToRoot(card, keys[i] as rootPropType, entry[i]);
          }
        }
      }
    }

    const artistIndex = keys.indexOf('artists');
    if (entry[artistIndex]) {
      const artists = entry[artistIndex].split(';');

      card.artists = artists.map(fullArtist => {
        const hasNote = fullArtist.includes('<') && fullArtist.endsWith('>');
        const [artist, note] = [
          hasNote ? fullArtist.split('<')[0] : fullArtist,
          hasNote ? fullArtist.split('<')[1].slice(0, -1) : undefined,
        ];
        addArtist(card, artist, note);
        return artist;
      });
      card.artists = Array.from(new Set(card.artists));
    }
    // TODO: move to derived props? or just remove?
    if ('card_faces' in card && !entryAt('tags').includes('irregular-face-name')) {
      card.name.split(' // ').forEach((name, i) => {
        addPropToFace(card, 'name', name, i);
      });
    }

    setDerivedProps(card, entryAt('tags').split(';'));
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

  return new HCIDMap(allCards);
};
