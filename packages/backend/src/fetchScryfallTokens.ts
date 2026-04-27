import { sheetsKey } from './env.ts';
import {
  HCCard,
  HCImageStatus,
  HCLayout,
  HCRelatedCard,
  HCColor,
  HCColors,
  HCObject,
  HCLegality,
  HCLegalitiesField,
} from '@hellfall/shared/types';
import { ScryfallCard } from '@scryfall/api-types';
import pLimit from 'p-limit';
import { ScryfallToHC } from './scryfallToHC.ts';

const REQUEST_DELAY_MS = 125;
const limiter = pLimit(1);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
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

async function fetchCardById(cardId: string): Promise<ScryfallCard.Any> {
  return limiter(async () => {
    const url = `https://api.scryfall.com/cards/${cardId}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Hellfall/0.1.0',
        Accept: 'application/json;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Rate limited! Consider increasing your delay.');
      }
      const errorData = await response.json();
      throw new Error(`Scryfall API error: ${response.status}`);
    }

    await delay(REQUEST_DELAY_MS);

    const cardData: ScryfallCard.Any = (await response.json()) as any;
    return cardData;
  });
}

export const fetchScryfallTokens = async () => {
  const requestedData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Scryfall+Tokens+Database+(Unapproved)?alt=json&key=${sheetsKey}`
  );
  const asJson = (await requestedData.json()) as any;

  const [_oldkeys, ...rest] = asJson.values as string[][];
  const keys = ['id', 'scryfall_id', 'layout', 'token_maker', 'notes', 'tags'];
  rest.forEach(row => {
    while (row.length < keys.length) {
      row.push('');
    }
  });
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

  const theThing = await Promise.all(
    rest.map(async entry => {
      const tokenObject = ScryfallToHC(await fetchCardById(entry[1]));
      for (let i = 0; i < keys.length; i++) {
        if (entry[i]) {
          if (keys[i] == 'id') {
            tokenObject.id = entry[i];
          } else if (keys[i] == 'token_maker') {
            tokenObject.all_parts = entry[i].split(';').map(oldName => {
              const [, name, count] = oldName.match(/(.*)(\*(?:\d+|x))$/) ?? [, oldName, undefined];
              const base = name.replace(/\d+$/, '');
              const shouldUseBase =
                /\d/.test(name.at(-1)!) &&
                !hardCardNames.includes(name) &&
                base &&
                ![' ', '-', '^', '.', '/', '+', ',', "'"].includes(base.at(-1)!);
              const maker: HCRelatedCard = {
                object: HCObject.ObjectType.RelatedCard,
                id: shouldUseBase ? name : '',
                component: 'token_maker',
                name: shouldUseBase ? base : name,
                type_line: '',
                set: '',
                image: '',
              };
              if (count) {
                maker.count = count.slice(1);
              }
              return maker;
            });
          } else if (keys[i] == 'tags') {
            const tags = entry[i].split(';');
            tokenObject.tags = tags.map(fullTag => {
              if (fullTag.includes('<') && fullTag.includes('>')) {
                const [tag, note] = [fullTag.split('<')[0], fullTag.split('<')[1].slice(0, -1)];
                if (!tokenObject.tag_notes) {
                  tokenObject.tag_notes = {} as Record<string, string>;
                }
                tokenObject.tag_notes[tag] = note;
                return tag;
              } else {
                return fullTag;
              }
            });
            tokenObject.tags = Array.from(new Set(tokenObject.tags));
          }
        }
      }
      return tokenObject;
    })
  );
  return theThing;
};
