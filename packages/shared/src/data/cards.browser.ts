import { HCCard } from '../types';
import type { JsonDataWrapper } from './jsonDataWrapper';

let cardsDataPromise: Promise<JsonDataWrapper<HCCard.Any>> | undefined;

/** Lazy-load Hellscube-Database.json as a separate webpack chunk. */
export function loadCardsData(): Promise<JsonDataWrapper<HCCard.Any>> {
  if (!cardsDataPromise) {
    cardsDataPromise = import(
      /* webpackChunkName: "hellscube-database" */
      './Hellscube-Database.json'
    ).then(mod => mod.default as JsonDataWrapper<HCCard.Any>);
  }
  return cardsDataPromise;
}
