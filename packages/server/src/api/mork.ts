import { withCors, HandlerRequest, HandlerResponse, env } from './lib';
import { cardMap } from './cardMap.ts';
import { Firestore } from '@google-cloud/firestore';
import {
  cardsCollection,
  changesetCollection,
  firestoreDocRefToCard,
} from '@hellfall/shared/utils/firestore';

export const commands = ['exact', 'exist', 'fuzzy', 'multiple_fuzzy'] as const;
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

const nameRequiredCommands: commandType[] = ['exact', 'fuzzy'];
const exactCommands: commandType[] = ['exact', 'exist'];
const nameListRequiredCommands: commandType[] = ['exist', 'multiple_fuzzy'];

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
    const getCard = exactCommands.includes(body.command)
      ? cardMap.getFromName
      : cardMap.getFromFuzzyName;
    if (nameListRequiredCommands.includes(body.command)) {
      if (!body.card_names) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, reason: 'missing_card_names' }));
        return;
      }
      const cards = body.card_names.flatMap(card => getCard(card) ?? []);
      if (body.command == 'exist') {
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
      // if (rawCommands.includes(body.command)) {
      // }
      // const response: any = {
      //   ok: true,
      //   uuid: cardToUse.id,
      //   hcid: cardToUse.hcid,
      //   oracle_id: cardToUse.oracle_id,
      // };
      // switch (body.command) {
      //   case 'creator':
      //     response.name = cardToUse.name;
      //     response.creators = cardToUse.creators;
      //     break;
      //   case 'rulings':
      //     response.name = cardToUse.name;
      //     response.rulings = cardToUse.rulings;
      //     break;
      //   case 'info':
      //     response.info = getInfo(cardToUse);
      //     break;
      //   case 'errata_data':
      //     response.name = cardToUse.name;
      //     response.creators = cardToUse.creators;
      //     response.image = cardToUse.image;
      //     break;
      // }
      // res.end(JSON.stringify(response));
    }
  } catch (error) {
    console.error('Error processing command:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
