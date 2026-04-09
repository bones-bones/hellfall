import { sheetsKey } from '../keys.ts';
import { HCCard, HCImageStatus, HCLayout, HCRelatedCard, HCColor, HCColors, HCObject, HCLegality, HCLegalitiesField } from '@hellfall/shared/types';
import { ScryfallCard } from '@scryfall/api-types';
import pLimit from 'p-limit';
import { ScryfallToHC } from './scryfallToHC.ts';

const REQUEST_DELAY_MS = 75;
const limiter = pLimit(1);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  const keys = ['id', 'scryfall_id', 'layout', 'token_maker'];
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
            tokenObject.all_parts = entry[i].split(';').map(name => {
              const maker: HCRelatedCard = {
                object: HCObject.ObjectType.RelatedCard,
                id: '',
                component: 'token_maker',
                name: name.replace(/\*\d+$/, ''),
                type_line: '',
                set: '',
                image: '',
              };
              return maker;
            });
          }
        }
      }
      return tokenObject;
    })
  );
  return theThing;
};
