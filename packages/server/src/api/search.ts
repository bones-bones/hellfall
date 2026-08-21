import { withCors, HandlerRequest, HandlerResponse } from './lib';
import { combineAndWinnowSorts, parseSearchQuery, searchCards } from '@hellfall/shared/filters';
import { HCCard, SetCode } from '@hellfall/shared/types';
import {
  toCockCube,
  toCockCubeJSON,
  HCToDraftmancer,
  HCToTTSDeck,
  CardMap,
  getRandom,
  displaySetCode,
} from '@hellfall/shared/utils';
import { cardMap } from './cardMap.ts';

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

type RandomBody = {
  num?: number;
};

const formatSearchResult = (
  idList: string[],
  cardMap: CardMap,
  format: 'draftmancer' | 'cockatrice' | 'tabletopsimulator'
) => {
  switch (format) {
    case 'draftmancer': {
      const draftCards = HCToDraftmancer(cardMap, '' as SetCode, idList);
      return draftCards.cards.concat(draftCards.tokens);
    }
    case 'cockatrice': {
      const cockCards = toCockCubeJSON(cardMap, '' as SetCode, idList);
      return cockCards.cards.concat(cockCards.tokens);
    }
    case 'tabletopsimulator':
      return HCToTTSDeck('Custom', idList, cardMap);
  }
};

export async function searchHandler(req: HandlerRequest, res: HandlerResponse, isRandom?: boolean) {
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

    const { sortObjects, invalids, summary } = parseSearchQuery(query ?? '', cardMap);

    const { sortList } = combineAndWinnowSorts(sortObjects, inputSorts ?? []);

    const invalidList = invalids.map(invalid =>
      stripDoubleSpaces(`Invalid expression "${invalid[0]}" was ignored. ${invalid[1]}`)
    );

    const results = searchCards(cardMap, query ?? '');
    if (isRandom) {
      const body = (await readJsonBody(req)) as RandomBody;
      if (!results.length) {
        res.statusCode = 404;
        res.end(JSON.stringify({ ok: false, reason: 'no_cards_found' }));
        return;
      }
      res.statusCode = 200;
      if (body.num && body.num > 1) {
        const randomCards: HCCard.Any[] = [];
        for (let i = 0; i < body.num; i++) {
          randomCards.push(getRandom(results));
        }
        res.end(JSON.stringify({ data: randomCards, object: 'list' }));
        return;
      }
      res.end(JSON.stringify(getRandom(results)));
      return;
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
      res.end(
        toCockCube({
          name: 'Custom',
          set: 'Custom' as SetCode,
          cardMap,
          idList: results.map(card => card.id),
        })
      );
    } else if (format == 'json') {
      for (let i = sortList.length - 1; i >= 0; i--) {
        results.sort(sortList[i].filter);
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
      res.end(
        JSON.stringify(
          formatSearchResult(
            results.map(card => card.id),
            cardMap,
            format
          ),
          null,
          2
        )
      );
    }
  } catch (error) {
    console.error('Error serving JSON:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
