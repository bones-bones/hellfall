import type { HandlerRequest, HandlerResponse } from './lib/types.ts';
import { withCors } from './lib/cors.ts';
import { getAllCards, getCardById } from './cardsStore.ts';
import { combineAndWinnowSorts, parseSearchQuery, searchCards } from '@hellfall/shared/filters';
import tags_data from '@hellfall/shared/data/tags.json';
import { HCCard } from '@hellfall/shared/types';

async function readJsonBody(req: HandlerRequest): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString('utf-8');
  return body ? JSON.parse(body) : {};
}

const stripDoubleSpaces = (text: string): string =>
  text.includes('  ') ? stripDoubleSpaces(text.replaceAll('  ', ' ')) : text;

export async function searchHandler(req: HandlerRequest, res: HandlerResponse) {
  try {
    const headers = withCors({ 'Content-Type': 'application/json' }, req);
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

    const query = typeof req.query?.q == 'string' ? req.query?.q : req.query?.q?.join(' ');

    const inputSorts = typeof req.query?.order == 'string' ? [req.query?.order] : req.query?.order;

    const { sortObjects, invalids, summary } = parseSearchQuery(query ?? '');

    const { sortList } = combineAndWinnowSorts(sortObjects, inputSorts ?? []);

    const invalidList = invalids.map(invalid =>
      stripDoubleSpaces(`Invalid expression "${invalid[0]}" was ignored. ${invalid[1]}`)
    );

    const results = searchCards(getAllCards(), query ?? '', tags_data.data);

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

    res.setHeader('Content-Disposition', `inline; filename="search.json"`);
    res.statusCode = 200;
    res.end(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Error serving JSON:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
