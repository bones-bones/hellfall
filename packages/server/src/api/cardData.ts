import { env, HandlerRequest, HandlerResponse, withCors } from './lib';
import { isValidV4UUID, toPlainText } from '@hellfall/shared/utils';
import { getCardMap } from './cardMap.ts';
import { Firestore } from '@google-cloud/firestore';
import {
  cardsCollection,
  firestoreDocRefToCard,
  firestoreDocToCard,
} from '@hellfall/shared/utils/firestore';
// import { getCardById } from './cardsStore.ts';

const db = new Firestore({ databaseId: env.FIRESTORE_DATABASE_ID });
const cardsCol: cardsCollection = db.collection(env.FIRESTORE_CARDS_COLLECTION);

export const getCardById = async (cardId: string) => {
  if (!isValidV4UUID(cardId)) {
    return;
  }
  const docRef = cardsCol.doc(cardId);
  return await firestoreDocRefToCard(docRef);
};

export const cardJsonHandler = async (
  req: HandlerRequest,
  res: HandlerResponse,
  cardId: string
) => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  try {
    if (!isValidV4UUID(cardId)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'invalid_card_id' }));
      return;
    }

    const card = (await getCardMap()).get(cardId);

    if (!card) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Card not found' }));
      return;
    }

    res.setHeader('Content-Disposition', `inline; filename="${cardId}.json"`);
    res.statusCode = 200;
    res.end(JSON.stringify(card.toJSON ? card.toJSON() : card, null, 2));
  } catch (error) {
    console.error('Error serving JSON:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};

export const cardTextHandler = async (
  req: HandlerRequest,
  res: HandlerResponse,
  cardId: string
) => {
  const headers = withCors({ 'Content-Type': 'text/plain; charset=utf-8' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  try {
    if (!cardId || cardId.length > 200) {
      res.statusCode = 400;
      res.end('invalid_card_id');
      return;
    }

    const card = (await getCardMap()).get(cardId);

    if (!card) {
      res.statusCode = 404;
      res.end('Card not found');
      return;
    }

    const plainText = toPlainText(card);

    res.setHeader('Content-Disposition', `inline; filename="${cardId}.txt"`);
    res.statusCode = 200;
    res.end(plainText);
  } catch (error) {
    console.error('Error serving text:', error);
    res.statusCode = 500;
    res.end('Internal server error');
  }
};

/**
 * GET /api/cards/hcid/:hcid — resolve via HCID, then name / print UUID.
 * Deep links and CardRoute use this when the client has no CardMap.
 */
export const cardByHcidHandler = async (
  req: HandlerRequest,
  res: HandlerResponse,
  hcid: string
) => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  try {
    const decoded = decodeURIComponent(hcid ?? '').trim();
    if (!decoded || decoded.length > 200) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'invalid_hcid' }));
      return;
    }

    const cardMap = await getCardMap();
    const card =
      cardMap.getFromHCID(decoded) ?? cardMap.getFromName(decoded) ?? cardMap.get(decoded);

    if (!card) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Card not found' }));
      return;
    }

    res.setHeader('Content-Disposition', `inline; filename="${card.hcid || card.id}.json"`);
    res.statusCode = 200;
    res.end(JSON.stringify(card.toJSON ? card.toJSON() : card, null, 2));
  } catch (error) {
    console.error('Error serving card by HCID:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};

/**
 * GET /api/cards/:cardId/prints — all prints for the card's oracle_id.
 */
export const cardPrintsHandler = async (
  req: HandlerRequest,
  res: HandlerResponse,
  cardId: string
) => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  try {
    if (!cardId || cardId.length > 200) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'invalid_card_id' }));
      return;
    }

    const cardMap = await getCardMap();
    const card = cardMap.get(cardId) ?? cardMap.getFromHCID(cardId) ?? cardMap.getFromName(cardId);

    if (!card) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Card not found' }));
      return;
    }

    const prints = cardMap.getAllPrints(card.oracle_id);
    res.statusCode = 200;
    res.end(
      JSON.stringify(
        {
          object: 'list',
          total_cards: prints.length,
          data: prints.map(p => (p.toJSON ? p.toJSON() : p)),
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error('Error serving card prints:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
