import {
  addArtist,
  addProp,
  addPropToFaceOrRoot,
  bothPropType,
  faceOrRootIsBattle,
  getDefaultCard,
  isInteger,
  propType,
  setDerivedProps,
} from '@hellfall/shared/utils/index.ts';
import { sheetsKey } from './env.ts';
import {
  HCCard,
  HCImageStatus,
  HCLayout,
  HCColor,
  HCColors,
  HCObject,
  HCLegality,
  HCLegalitiesField,
  HCBorderColor,
  HCFrame,
  HCFinish,
  HCKind,
} from '@hellfall/shared/types';

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

const emojiToColorIndicators: Record<string, HCColors> = {
  '⚪': ['W'],
  '⚫': ['B'],
  '🔵': ['U'],
  '🔴': ['R'],
  '🟢': ['G'],
  '🏳️‍🌈': ['W', 'U', 'B', 'R', 'G'],
};

// TODO: fix to use types

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
    'creators',
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
    'tags',
    'artists',
    '1mana_value',
    '1colors',
    '1mana_cost',
    '1supertypes',
    '1types',
    '1subtypes',
    '1power',
    '1toughness',
    '1loyalty',
    '1oracle_text',
    '1flavor_text',
  ] as const;

  type keyType = (typeof keys)[number];
  const skipKeys: keyType[] = [
    'game',
    'name',
    'image',
    'creators',
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
    'tags',
    'artists',
  ];

  rest.forEach(row => {
    while (row.length < keys.length) {
      row.push('');
    }
  });

  const allNotMagic = rest.map(entry => {
    const entryAt = (key: keyType) => entry[keys.indexOf(key)];
    const cardIsMulti = entry.slice(keys.indexOf('1mana_value')).some(value => value);
    const card = getDefaultCard(
      HCKind.NotMagic,
      cardIsMulti,
      {
        hcid: entryAt('name') + (['Pot of Greed'].includes(entryAt('name')) ? '3' : '1'),
        name: entryAt('name'),
        image: entryAt('image'),
        image_status: entryAt('tags').includes('low-quality')
          ? HCImageStatus.MedRes
          : HCImageStatus.HighRes,
        creators: entryAt('creators').split(';'),
        set: 'NMTG',
        mana_value: parseInt(entryAt('mana_value')),
        colors: entryAt('colors')
          ? entryAt('colors')
              .split(';')
              .map(color => HCColor[color as keyof typeof HCColor])
          : [],
      },
      {
        colors: entryAt('colors')
          ? entryAt('colors')
              .split(';')
              .map(color => HCColor[color as keyof typeof HCColor])
          : [],
        color_indicator: Object.entries(emojiToColorIndicators).flatMap(([emoji, colorSet]) =>
          entryAt('rulings').includes(emoji) ? colorSet : []
        ) as HCColors,
        mana_cost: entryAt('mana_cost'),
        supertypes: entryAt('supertypes').split(';'),
        types: entryAt('types').split(';'),
        subtypes: entryAt('subtypes').split(';'),
        power: entryAt('power'),
        toughness: entryAt('toughness'),
        loyalty: !entryAt('types').toLowerCase().includes('battle') ? entryAt('loyalty') : '',
        defense: entryAt('types').toLowerCase().includes('battle') ? entryAt('loyalty') : '',
        oracle_text: entryAt('oracle_text')
          .match(/<[^>]*>|[^<>]+/g)
          ?.map(text => (text[0] == '<' ? discordToSymbolMatching[text] : text))
          .join(''),
        flavor_text: entryAt('flavor_text'),
      }
    );
    for (let i = 0; i < keys.length; i++) {
      if (entry[i] && !skipKeys.includes(keys[i])) {
        if ('1'.includes(keys[i][0])) {
          const face = parseInt(keys[i][0]);
          const key = keys[i].slice(1);
          const entryList = face == 3 ? entry[i].split(' // ') : [entry[i]];
          entryList.forEach((value, index) => {
            if (['supertypes', 'types', 'subtypes'].includes(key)) {
              addPropToFaceOrRoot(
                card,
                key as 'supertypes' | 'types' | 'subtypes',
                value.split(';'),
                face + index
              );
            } else if (key == 'loyalty' && faceOrRootIsBattle(card, face + index)) {
              addPropToFaceOrRoot(card, 'defense', value, face + index);
            } else {
              addPropToFaceOrRoot(card, key as bothPropType, value, face + index);
            }
          });
        } else {
          addProp(card, keys[i] as propType, entry[i]);
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

    setDerivedProps(card, entryAt('tags').split(';'));
    return card;
  });
  return allNotMagic;
};
