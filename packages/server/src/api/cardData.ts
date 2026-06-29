import { HandlerRequest, HandlerResponse, withCors } from './lib';
import { isValidV4UUID, toPlainText } from '@hellfall/shared/utils';
import { cardMap } from './cardMap.ts';
// import { getCardById } from './cardsStore.ts';

export async function cardJsonHandler(req: HandlerRequest, res: HandlerResponse, cardId: string) {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  try {
    if (!isValidV4UUID(cardId)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'invalid_card_id' }));
      return;
    }

    const card = cardMap.get(cardId);

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
}

export async function cardTextHandler(req: HandlerRequest, res: HandlerResponse, cardId: string) {
  const headers = withCors({ 'Content-Type': 'text/plain; charset=utf-8' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  try {
    if (!cardId || cardId.length > 200) {
      res.statusCode = 400;
      res.end('invalid_card_id');
      return;
    }

    const card = cardMap.get(cardId);

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
}
