import { sheetsKey } from './env.ts';
import { HCRelatedCard, HCObject, SetCode } from '@hellfall/shared/types';
import pLimit from 'p-limit';
import { fixedScryfall, ScryfallToHC } from './scryfallToHC.ts';
import { parseRelatedReferenceName, setDerivedProps } from '@hellfall/shared/utils';

const REQUEST_DELAY_MS = 125;
const limiter = pLimit(1);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchCardById(cardId: string): Promise<fixedScryfall> {
  return limiter(async () => {
    const url = `https://api.scryfall.com/cards/${cardId}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Hellscube/Hellfall/0.1.0',
        Accept: 'application/json;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Rate limited! Consider increasing your delay.');
      }
      const errorData = await response.json();
      throw new Error(`Scryfall API error: ${response.status} data: ${errorData}`);
    }

    await delay(REQUEST_DELAY_MS);

    const cardData: fixedScryfall = (await response.json()) as any;
    return cardData;
  });
}

export const fetchScryfallTokens = async () => {
  const requestedData = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g/values/Scryfall+Tokens+Database+(Unapproved)?alt=json&key=${sheetsKey}`
  );
  const asJson = (await requestedData.json()) as any;

  const [_oldkeys, ...rest] = asJson.values as string[][];
  const keys = ['hcid', 'id', 'token_maker', 'notes', 'tags'] as const;
  type keyType = (typeof keys)[number];
  rest.forEach(row => {
    while (row.length < keys.length) {
      row.push('');
    }
  });

  const HCScryfallTokens = await Promise.all(
    rest.map(async entry => {
      const entryAt = (key: keyType) => entry[keys.indexOf(key)];
      const token = ScryfallToHC(await fetchCardById(entry[1]));
      for (let i = 0; i < keys.length; i++) {
        if (entry[i]) {
          if (keys[i] == 'hcid') {
            token.hcid = entry[i];
          } else if (keys[i] == 'token_maker') {
            token.all_parts = entry[i].split(';').map(oldName => {
              const { name, count, base, shouldUseBase } = parseRelatedReferenceName(oldName);
              const maker: HCRelatedCard = {
                object: HCObject.ObjectType.RelatedCard,
                id: '',
                hcid: shouldUseBase ? name : '',
                component: 'token_maker',
                name: shouldUseBase ? base : name,
                type_line: '',
                set: '' as SetCode,
                image: '',
              };
              if (count) {
                maker.count = count.slice(1);
              }
              return maker;
            });
          }
        }
      }
      setDerivedProps(token, entryAt('tags').split(';'));

      return token;
    })
  );
  return HCScryfallTokens;
};
