import type { HandlerRequest, HandlerResponse } from './lib/types.ts';
import { withCors } from './lib/cors.ts';
import { combineAndWinnowSorts, parseSearchQuery, searchCards } from '@hellfall/shared/filters';
import { HCCard, HCSet } from '@hellfall/shared/types';
import {
  toCockCube,
  toCockCubeJSON,
  HCToDraftmancer,
  HCToTTSDeck,
  CardMap,
} from '@hellfall/shared/utils';
import { cardMap } from './cardsStore.ts';
import { tagsData } from '@hellfall/shared/data';

// const tagsData = readDataJson<{ data: string[] }>('tags.json');

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
  idList: string[],
  cardMap: CardMap,
  format: 'draftmancer' | 'cockatrice' | 'tabletopsimulator'
) => {
  switch (format) {
    case 'draftmancer': {
      const draftCards = HCToDraftmancer(cardMap, '' as HCSet, idList);
      return draftCards.cards.concat(draftCards.tokens);
    }
    case 'cockatrice': {
      const cockCards = toCockCubeJSON(cardMap, '' as HCSet, idList);
      return cockCards.cards.concat(cockCards.tokens);
    }
    case 'tabletopsimulator':
      return HCToTTSDeck('Custom', idList, cardMap);
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

    const resultMap = searchCards(cardMap, query ?? '', tagsData.data);

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
      res.end(
        toCockCube({ name: 'Custom', set: 'Custom' as HCSet, cardMap, idList: resultMap.ids() })
      );
    } else if (format == 'json') {
      const results = resultMap.cards();
      for (let i = sortList.length - 1; i >= 0; i--) {
        results.sort((a: HCCard.Any, b: HCCard.Any) => sortList[i].filter(a, '=', b));
      }
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
      res.end(JSON.stringify(formatSearchResult(resultMap.ids(), cardMap, format), null, 2));
    }
  } catch (error) {
    console.error('Error serving JSON:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
