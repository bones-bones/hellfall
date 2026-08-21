import { withCors, HandlerRequest, HandlerResponse, env } from './lib';
import { cardMap } from './cardMap.ts';
import { Firestore } from '@google-cloud/firestore';
import {
  cardsCollection,
  changesetCollection,
  firestoreDocRefToCard,
} from '@hellfall/shared/utils/firestore';

export const commands = [
  'uuid',
  'multiple_uuid',
  'exact',
  'multiple_exact',
  'fuzzy',
  'multiple_fuzzy',
  'all_exist',
  'get_cache',
] as const;
export type commandType = (typeof commands)[number];
export const isCommand = (value: any): value is commandType => commands.includes(value);

const db = new Firestore({ databaseId: env.FIRESTORE_DATABASE_ID });
const changesetsCol: changesetCollection = db.collection(
  env.FIRESTORE_CHANGESETS_COLLECTION
) as changesetCollection;
const cardsCol: cardsCollection = db.collection(env.FIRESTORE_CARDS_COLLECTION);

type CommandBody = {
  command: commandType;
  card_name?: string;
  card_names?: string[];
};
async function readJsonBody(req: HandlerRequest): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString('utf-8');
  return body ? JSON.parse(body) : {};
}

const jsonHeaders = (req: HandlerRequest): Record<string, string> => {
  return withCors({ 'Content-Type': 'application/json' }, req);
};

const exactCommands: commandType[] = ['exact', 'multiple_exact', 'all_exist'];
const uuidRequiredCommands: commandType[] = ['uuid', 'multiple_uuid'];
const nameRequiredCommands: commandType[] = ['uuid', 'exact', 'fuzzy'];
const nameListRequiredCommands: commandType[] = [
  'multiple_uuid',
  'multiple_exact',
  'multiple_fuzzy',
  'all_exist',
];

export async function morkHandler(req: HandlerRequest, res: HandlerResponse) {
  const headers = jsonHeaders(req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end();
    return;
  }
  let body: CommandBody | undefined;
  try {
    body = (await readJsonBody(req)) as CommandBody;
    if (!isCommand(body.command)) {
      res.statusCode = 404;
      res.end(JSON.stringify({ ok: false, reason: 'invalid_command' }));
      return;
    }
    if (body.command == 'get_cache') {
      res.statusCode = 200;
      res.end(JSON.stringify(cardMap));
      return;
    }
    const getCard = uuidRequiredCommands.includes(body.command)
      ? cardMap.get
      : exactCommands.includes(body.command)
      ? cardMap.getFromName
      : cardMap.getFromFuzzyName;
    if (nameListRequiredCommands.includes(body.command)) {
      if (!body.card_names) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, reason: 'missing_card_names' }));
        return;
      }
      const cards = body.card_names.flatMap(card => getCard(card) ?? []);
      if (body.command == 'all_exist') {
        const ok = cards.length == body.card_names.length;
        res.statusCode = ok ? 200 : 404;
        res.end(JSON.stringify({ ok }));
        return;
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ data: cards }));
      return;
    }

    if (nameRequiredCommands.includes(body.command)) {
      if (!body.card_name) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, reason: 'missing_card_name' }));
        return;
      }
      const card = getCard(body.card_name);
      if (!card) {
        res.statusCode = 404;
        res.end(JSON.stringify({ ok: false, reason: 'card_not_found' }));
        return;
      }
      const dbCard = await firestoreDocRefToCard(cardsCol.doc(card.id));
      const cardToUse = dbCard ?? card;
      res.statusCode = 200;
      res.end(JSON.stringify(cardToUse));
      return;
    }
  } catch (error) {
    console.error('Error processing command:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
