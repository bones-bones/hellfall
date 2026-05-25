import type { HandlerRequest, HandlerResponse } from './lib/types.ts';
import { withCors } from './lib/cors.ts';
import { getAllCards, getCardById } from './cardsStore.ts';
import { combineAndWinnowSorts, parseSearchQuery, searchCards } from '@hellfall/shared/filters';
import { HCCard } from '@hellfall/shared/types';
import { toCockCube, toCockCubeJSON } from '@hellfall/shared/utils/cockatrice';
import { HCToDraftmancer } from '@hellfall/shared/utils/draftmancer';
import { HCToTTSDeck } from '@hellfall/shared/utils/tts';
import { readDataJson } from '../lib/loadDataFiles.ts';

const tagsData = readDataJson<{ data: string[] }>('tags.json');

export const searchFormats = [
  'json',
  'xml',
  'cockatrice',
  'draftmancer',
  'tabletopsimulator',
] as const;
export type searchFormatType = (typeof searchFormats)[number];
export const searchFormatEquivs: Record<string, searchFormatType> = {
  '': 'json',
  cock: 'cockatrice',
  cockxml: 'cockatrice',
  xmlcock: 'cockatrice',
  draft: 'draftmancer',
  mancer: 'draftmancer',
  text: 'json',
  tts: 'tabletopsimulator',
  tabletop: 'tabletopsimulator',
  simulator: 'tabletopsimulator',
};
async function readJsonBody(req: HandlerRequest): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString('utf-8');
  return body ? JSON.parse(body) : {};
}

const stripDoubleSpaces = (text: string): string =>
  text.includes('  ') ? stripDoubleSpaces(text.replaceAll('  ', ' ')) : text;

const formatSearchResult = (
  cardList: HCCard.Any[],
  allCards: HCCard.Any[],
  format: 'draftmancer' | 'cockatrice' | 'tabletopsimulator'
) => {
  switch (format) {
    case 'draftmancer': {
      const draftCards = HCToDraftmancer(cardList, allCards);
      return draftCards.cards.concat(draftCards.tokens);
    }
    case 'cockatrice': {
      const cockCards = toCockCubeJSON(cardList, allCards);
      return cockCards.cards.concat(cockCards.tokens);
    }
    case 'tabletopsimulator':
      return HCToTTSDeck('Custom', cardList, allCards);
  }
};

export async function searchHandler(req: HandlerRequest, res: HandlerResponse) {
  try {
    const intForm =
      (typeof req.query?.format == 'string' ? req.query?.format : req.query?.format?.[0]) ?? 'json';
    const format = searchFormats.includes(intForm as searchFormatType)
      ? (intForm as searchFormatType)
      : searchFormatEquivs[intForm] ?? 'json';
    const headers = withCors(
      { 'Content-Type': `application/${format == 'xml' ? 'xml' : 'json'}` },
      req
    );
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

    const query = typeof req.query?.q == 'string' ? req.query?.q : req.query?.q?.join(' ');

    const inputSorts = typeof req.query?.order == 'string' ? [req.query?.order] : req.query?.order;

    const { sortObjects, invalids, summary } = parseSearchQuery(query ?? '');

    const { sortList } = combineAndWinnowSorts(sortObjects, inputSorts ?? []);

    const invalidList = invalids.map(invalid =>
      stripDoubleSpaces(`Invalid expression "${invalid[0]}" was ignored. ${invalid[1]}`)
    );
    const allCards = getAllCards();

    const results = searchCards(allCards, query ?? '', tagsData.data);

    for (let i = sortList.length - 1; i >= 0; i--) {
      results.sort((a: HCCard.Any, b: HCCard.Any) => sortList[i].filter(a, '=', b));
    }

    res.setHeader(
      'Content-Disposition',
      `inline; filename="${
        format == 'json'
          ? 'search.json'
          : format == 'xml'
          ? 'cube.xml'
          : format == 'cockatrice'
          ? 'cube.json'
          : `${format}.json`
      }"`
    );
    res.statusCode = 200;
    if (format == 'xml') {
      res.end(toCockCube({ name: 'Custom', set: 'Custom', cardList: results, allCards }));
    } else if (format == 'json') {
      const response: any = {
        object: 'list',
        total_cards: results.length,
        details: `${results.length} card${results.length != 1 ? 's' : ''}${
          summary ? ` ${stripDoubleSpaces(summary)}` : ''
        }`,
      };
      if (invalidList.length) {
        response.warnings = invalidList;
      }
      response.data = results;
      res.end(JSON.stringify(response, null, 2));
    } else {
      res.end(JSON.stringify(formatSearchResult(results, allCards, format), null, 2));
    }
  } catch (error) {
    console.error('Error serving JSON:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
