import { HCCard, HCRelatedCard, SetCode } from '@hellfall/shared/types';
import {
  extraSetList,
  fixSetCodeMaybe,
  getAcceptedOrderSet,
  getChildSets,
  getDirectChildSets,
  splitCardName,
  toSetNumber,
} from '../setHandling';
import { CardLookupMap } from './cardLookupMap';
import { fixName } from '../textHandling';
import { isInteger } from '../numHandling';
import { getRandom, pushToMap, stringIterable } from '../listHandling';

const isNonExtra = (card: HCCard.Any) =>
  !extraSetList.includes(card.set) || Object.values(card.legalities).some(l => l == 'legal');

/**
 * The list of names and card ids for basics and thriving lands
 */
export const landIdList: [string, string][] = [
  ['Plains', 'bc71ebf6-2056-41f7-be35-b2e5c34afa99'],
  ['Island', 'b2c6aa39-2d2a-459c-a555-fb48ba993373'],
  ['Swamp', '56719f6a-1a6c-4c0a-8d21-18f7d7350b68'],
  ['Mountain', 'a3fb7228-e76b-4e96-a40e-20b5fed75685'],
  ['Forest', 'b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6'],
  ['Nebula', 'fad3359c-6c3d-4a94-8d7c-4f833d82cb8d'],
  ['Wastes', '05d24b0c-904a-46b6-b42a-96a4d91a0dd4'],
  ['Snow-Covered Plains', 'ac8cc74d-e43b-4118-bba0-dfa8b9c04d45'],
  ['Snow-Covered Island', '5b2460a5-6ae5-4cad-ba94-1a9e98e6e4c0'],
  ['Snow-Covered Swamp', 'd8239a86-7184-4005-ba1e-2dddcd756c47'],
  ['Snow-Covered Mountain', 'ca9f660b-e07d-4f42-a46e-abd0ca72510c'],
  ['Snow-Covered Forest', '5f0d3be8-e63e-4ade-ae58-6b0c14f2ce6d'],
  ['Snow-Covered Nebula', '2c268e90-9bec-45c3-9c99-436761643f3c'],
  ['Snow-Covered Wastes', '46a07b53-ff58-4bd6-80dd-ded2eb0e29a3'],
  ['Thriving Heath', 'd1946630-e224-40db-8f0d-388b09622288'],
  ['Thriving Isle', '69fc70b8-b143-4662-ac95-e2743037239d'],
  ['Thriving Moor', 'b7c7d0c0-ada6-4c89-b47b-977e35e67b39'],
  ['Thriving Bluff', '91fceb34-0f2d-4392-be27-00dcd765637f'],
  ['Thriving Grove', 'a8052556-8962-4130-86a8-6fb7b6a324f7'],
  ['Thriving Galaxy', '626d5aaa-b808-434b-b7ae-bde93811d2df'],
];

const landIdMap = new Map<string, string>(landIdList.map(l => [l[0].toLowerCase(), l[1]]));

/**
 * Checks if a card name is the name of a land that can be used with {@linkcode getRandomLand}.
 * @param name name to check
 */
const isLandName = (name: string) => landIdMap.has(name);

/**
 * the list of preference options
 */
export const preferTypeList = ['newest', 'oldest'] as const;
/**
 * a preference option
 */
export type preferType = (typeof preferTypeList)[number];
const combineSets = (...args: (Set<string> | undefined)[]) => {
  const retSet = new Set<string>();
  for (const set of args) {
    if (set) {
      for (const element of set) {
        retSet.add(element);
      }
    }
  }
  if (retSet.size) {
    return retSet;
  }
};

/**
 * Sorts two cards based on their accepted order (can be used as a proxy for date)
 * @param value1 first card to sort
 * @param value2 second card to sort
 * @param dirMult whether to reverse the direction (if `-1`)
 */
export const dateSort = (value1: HCCard.Any, value2: HCCard.Any, dirMult: 1 | -1 = 1) =>
  (toSetNumber(getAcceptedOrderSet(value1.set)) - toSetNumber(getAcceptedOrderSet(value2.set)) ||
    parseInt(value1.accepted_order) - parseInt(value2.accepted_order)) * dirMult;
const reverseDateSort = (value1: HCCard.Any, value2: HCCard.Any) => dateSort(value1, value2, -1);

const preferToSort: Record<preferType, (value1: HCCard.Any, value2: HCCard.Any) => number> = {
  newest: reverseDateSort,
  oldest: dateSort,
};
/**
 * Gets the preferred version of a card based on a {@linkcode preferType}
 * @param cards all prints of the card
 * @param prefer preference option
 */
export const getPreference = (cards: HCCard.Any[], prefer: preferType): HCCard.Any =>
  cards.sort(preferToSort[prefer])[0];

/**
 * The lightweight version of a class for a map of cards.
 *
 * Only maps ids to their cards and oracle ids and sets to their ids.
 */
export class LightCardMap {
  /**
   * Maps card ids to their cards
   */
  protected idMap = new Map<string, HCCard.Any>();
  /**
   * Maps oracle ids to the card ids they are associated with
   */
  protected oracleMap = new Map<string, Set<string>>();
  /**
   * Maps set codes to the card ids they are associated with
   */
  protected setMap = new Map<SetCode, Set<string>>();
  /**
   * Creates a new CardMap
   */
  constructor();
  /**
   * Creates a new CardMap
   * @param cards The initial cards to set, if any
   */
  constructor(cards: HCCard.Any[]);
  constructor(cards?: HCCard.Any[]) {
    if (!cards) return;
    cards.forEach(this.set);
  }

  /**
   * Returns a specified card from the CardMap object.
   * Any change made to that card will effectively modify it inside the CardMap.
   * If no card has the specified id, undefined is returned
   * @param id the id of the card to get
   */
  get = (id: string) => this.idMap.get(id);

  /**
   * Returns multiple specified cards as a list, based on the provided list of ids.
   * @param idList the list of ids to get
   * @returns Returns the cards with the given ids.
   */
  getMultiple = (idList: stringIterable): HCCard.Any[] => {
    const cards: HCCard.Any[] = [];
    for (const id of idList) {
      const card = this.get(id);
      if (!card) continue;
      cards.push(card);
    }
    return cards;
  };
  /**
   * Returns the images for multiple specified cards as a list, based on the provided list of ids.
   * @param idList the list of ids to get images for
   * @param defaultImage the image to use if the card doesn't exist
   * @returns Returns the cards with the given ids.
   */
  getImages = (idList: stringIterable, defaultImage: string) => {
    const images: string[] = [];
    for (const id of idList) {
      const card = this.get(id);
      images.push(card?.still_image ?? card?.image ?? defaultImage);
    }
    return images;
  };

  /**
   * Returns a subset of the CardMap object as a new CardMap, based on the provided list of ids.
   * @param idList the list of ids to get
   * @returns Returns the subset of the CardMap with the given ids.
   */
  getSubset(idList: stringIterable): this {
    const subMap = new (this.constructor as any)() as this;
    for (const id of idList) {
      const card = this.get(id);
      if (card) {
        subMap.set(card);
      }
    }
    return subMap;
  }

  /**
   * Returns the ids of the cards with a given oracle_id
   * @param oracle_id the oracle id to use
   */
  getIdsOfPrints(oracle_id: string): Set<string> | undefined {
    return this.oracleMap.get(oracle_id);
  }

  /**
   * Returns a portion of the CardMap object as a list, based on a provided oracle id.
   * @param oracle_id the oracle id to use
   */
  getAllPrints(oracle_id: string): HCCard.Any[] {
    return this.getMultiple(this.getIdsOfPrints(oracle_id) ?? []);
  }

  /**
   * Returns a subset of the CardMap object as a new CardMap, based on a provided oracle id.
   * @param oracle_id the oracle id to use
   */
  getAllPrintsAsSubset(oracle_id: string): this {
    return this.getSubset(this.getIdsOfPrints(oracle_id) ?? []);
  }

  /**
   * Returns a card based on an oracle id.
   * @param oracle_id the oracle id to use
   * @param prefer the version of the card to prefer, if any
   */
  getPreferredByOracleId(oracle_id: string, prefer: preferType = 'newest'): HCCard.Any|undefined {
    const prints = this.getAllPrints(oracle_id);
    if (prints.length) {
      return getPreference(prints, prefer);
    }
  }

  /**
   * Returns a portion of the CardMap object as a list, based on a provided list of oracle ids.
   * @param oracleList the oracle ids to use
   * @param prefer the version of the card to prefer, if any
   */
  getCardsByOracleIds(oracleList: stringIterable, prefer: preferType = 'newest'): HCCard.Any[] {
    const cards: HCCard.Any[] = [];
    for (const id of oracleList) {
      const prints = this.getAllPrints(id);
      if (prints.length) {
        cards.push(getPreference(prints, prefer));
      }
    }
    return cards;
  }

  /**
   * Returns a subset of the CardMap object as a new CardMap, based on a provided list of oracle ids.
   * @param oracleList the oracle ids to use
   * @param prefer the version of the card to prefer, if any
   */
  getCardsByOracleIdsAsSubset(oracleList: stringIterable, prefer: preferType = 'newest'): this {
    const subMap = new (this.constructor as any)() as this;
    for (const id of oracleList) {
      const prints = this.getAllPrints(id);
      if (prints.length) {
        subMap.set(getPreference(prints, prefer));
      }
    }
    return subMap;
  }
  /**
   * Returns a portion of the CardMap object as a list, based on a prefer option.
   * @param prefer the version of the card to prefer
   */
  getPreferred(prefer: preferType): HCCard.Any[] {
    const cards: HCCard.Any[] = [];
    for (const id of this.oracle_iter()) {
      const prints = this.getAllPrints(id);
      if (prints.length) {
        cards.push(getPreference(prints, prefer));
      }
    }
    return cards;
  }
  /**
   * Returns a subset of the CardMap object as a new CardMap, based on a prefer option.
   * @param prefer the version of the card to prefer
   */
  getPreferredAsSubset(prefer: preferType): this {
    const subMap = new (this.constructor as any)() as this;
    for (const id of this.oracle_iter()) {
      const prints = this.getAllPrints(id);
      if (prints.length) {
        subMap.set(getPreference(prints, prefer));
      }
    }
    return subMap;
  }

  /**
   * Returns the ids of the cards exactly in the given set.
   * @param code the set code to get
   */
  getAllIdsInSetExact = (code: SetCode): Set<string> | undefined => this.setMap.get(code);

  /**
   * Returns the ids of the cards in the given set.
   * @param code the set code to get
   */
  getAllIdsInSet = (code: SetCode): Set<string> | undefined =>
    combineSets(
      this.getAllIdsInSetExact(code),
      ...(getChildSets(code)?.map(this.getAllIdsInSetExact) ?? [])
    );

  /**
   * Returns the ids of the cards directly in the given set.
   * @param code the set code to get
   */
  getAllIdsInSetDirect = (code: SetCode): Set<string> | undefined =>
    combineSets(
      this.getAllIdsInSetExact(code),
      ...(getDirectChildSets(code)?.map(this.getAllIdsInSetExact) ?? [])
    );

  /**
   * Returns the portion of the CardMap object exactly in the given set as a list.
   * @param code the set code to get
   */
  getAllInSetExact(code: SetCode): HCCard.Any[] {
    return this.getMultiple(this.getAllIdsInSetExact(code) ?? []);
  }

  /**
   * Returns the subset of the CardMap object exactly in the given set as a new CardMap.
   * @param code the set code to get
   */
  getAllInSetExactAsSubmap(code: SetCode): this {
    return this.getSubset(this.getAllIdsInSetExact(code) ?? []);
  }

  /**
   * Returns the portion of the CardMap object in the given set as a list.
   * @param code the set code to get
   */
  getAllInSet(code: SetCode): HCCard.Any[] {
    return this.getMultiple(this.getAllIdsInSet(code) ?? []);
  }

  /**
   * Returns the subset of the CardMap object in the given set as a new CardMap.
   * @param code the set code to get
   */
  getAllInSetAsSubmap(code: SetCode): this {
    return this.getSubset(this.getAllIdsInSet(code) ?? []);
  }

  /**
   * Returns the portion of the CardMap object directly in the given set as a list.
   * @param code the set code to get
   * @returns excludes cards with different set types e.g. vetoed cards
   */
  getAllInSetDirect(code: SetCode): HCCard.Any[] {
    return this.getMultiple(this.getAllIdsInSetDirect(code) ?? []);
  }

  /**
   * Returns the subset of the CardMap object directly in the given set as a new CardMap.
   * @param code the set code to get
   * @returns excludes cards with different set types e.g. vetoed cards
   */
  getAllInSetDirectAsSubmap(code: SetCode): this {
    return this.getSubset(this.getAllIdsInSetDirect(code) ?? []);
  }

  /**
   * Returns the ids of the cards exactly in the given sets.
   * @param codeList the list of set codess to get
   */
  getAllIdsInSetListExact = (codeList: SetCode[]): Set<string> | undefined =>
    combineSets(...codeList.map(this.getAllIdsInSetExact));

  /**
   * Returns the ids of the cards in the given sets.
   * @param codeList the list of set codess to get
   */
  getAllIdsInSetList = (codeList: SetCode[]): Set<string> | undefined =>
    combineSets(...codeList.map(this.getAllIdsInSet));

  /**
   * Returns the ids of the cards directly in the given sets.
   * @param codeList the list of set codess to get
   */
  getAllIdsInSetListDirect = (codeList: SetCode[]): Set<string> | undefined =>
    combineSets(...codeList.map(this.getAllIdsInSetDirect));

  /**
   * Returns the portion of the CardMap object exactly in the given sets as a list.
   * @param codeList the list of set codess to get
   */
  getAllInSetListExact(codeList: SetCode[]): HCCard.Any[] {
    return this.getMultiple(this.getAllIdsInSetListExact(codeList) ?? []);
  }

  /**
   * Returns the subset of the CardMap object exactly in the given sets as a new CardMap.
   * @param codeList the list of set codess to get
   */
  getAllInSetListExactAsSubmap(codeList: SetCode[]): this {
    return this.getSubset(this.getAllIdsInSetListExact(codeList) ?? []);
  }

  /**
   * Returns the portion of the CardMap object in the given sets as a list.
   * @param codeList the list of set codess to get
   */
  getAllInSetList(codeList: SetCode[]): HCCard.Any[] {
    return this.getMultiple(this.getAllIdsInSetList(codeList) ?? []);
  }

  /**
   * Returns the subset of the CardMap object in the given sets as a new CardMap.
   * @param codeList the list of set codess to get
   */
  getAllInSetListAsSubmap(codeList: SetCode[]): this {
    return this.getSubset(this.getAllIdsInSetList(codeList) ?? []);
  }

  /**
   * Returns the portion of the CardMap object directly in the given sets as a list.
   * @param codeList the list of set codess to get
   */
  getAllInSetListDirect(codeList: SetCode[]): HCCard.Any[] {
    return this.getMultiple(this.getAllIdsInSetListDirect(codeList) ?? []);
  }

  /**
   * Returns the subset of the CardMap object directly in the given sets as a new CardMap.
   * @param codeList the list of set codess to get
   */
  getAllInSetListDirectAsSubmap(codeList: SetCode[]): this {
    return this.getSubset(this.getAllIdsInSetListDirect(codeList) ?? []);
  }

  /**
   * Gets a random id from this CardMap
   * @param oracle_id oracle id to get from, if any
   */
  getRandomId = (oracle_id?: string) =>
    oracle_id && this.hasOracleId(oracle_id)
      ? getRandom(this.getIdsOfPrints(oracle_id)!)
      : getRandom(this.ids());
  /**
   * Gets a random card from this CardMap
   * @param oracle_id oracle id to get from, if any
   */
  getRandomCard = (oracle_id?: string) => this.get(this.getRandomId(oracle_id))!;

  /**
   * Adds a new card to the CardMap. If a card with the same id already exists, the card will be updated.
   * @param card card to set
   */
  set = (card: HCCard.Any) => {
    this.idMap.set(card.id, card);
    pushToMap(this.oracleMap, card.oracle_id, card.id);
    pushToMap(this.setMap, card.set, card.id);
  };

  /**
   * Adds multiple new cards to the CardMap. If a card with the same id already exists, the card will be updated.
   * @param cards the cards to add. Can be either a list of cards or a CardMap
   */
  setMultiple(cards: HCCard.Any[]): void;
  setMultiple(cards: this): void;
  setMultiple(cards: HCCard.Any[] | this): void {
    cards.forEach(this.set);
  }
  /**
   * @param id the id to delete
   * @returns true if an element in the CardMap existed and has been removed, or false if the element does not exist.
   */
  delete = (id: string) => {
    const value = this.idMap.get(id);
    if (!value) return false;
    const oracle = this.oracleMap.get(value.oracle_id);
    oracle?.delete(id);
    if (oracle?.size == 0) {
      this.oracleMap.delete(value.oracle_id);
    }
    const set = this.setMap.get(value.set);
    set?.delete(id);
    if (set?.size == 0) {
      this.setMap.delete(value.set);
    }
    this.idMap.delete(id);
    return true;
  };

  /**
   * Deletes multiple cards from the CardMap.
   * @param ids the ids to delete
   */
  deleteMultiple = (ids: string[]) => ids.forEach(this.delete);

  /**
   * Checks if a card with the specified id exists, and if it is in the specified set, if any.
   * @param id the id to check for
   * @param set the set to look inside, if any
   */
  has = (id: string, set?: SetCode) => {
    if (set) {
      return Boolean(
        this.setMap.get(set)?.has(id) ||
          getChildSets(set)?.some(subSet => this.setMap.get(subSet)?.has(id))
      );
    }
    return this.idMap.has(id);
  };

  /**
   * Checks if a card with the specified id exists in the specified exact set.
   * @param id the id to check for
   * @param set the exact set to look inside
   */
  hasExact = (id: string, set: SetCode) => Boolean(this.setMap.get(set)?.has(id));

  /**
   * Checks if the specified set exists in this CardMap.
   * @param set the set to check for
   */
  hasSet = (set: SetCode) =>
    Boolean(
      this.setMap.get(set)?.size || getChildSets(set)?.some(subSet => this.setMap.get(subSet)?.size)
    );

  /**
   * Checks if the specified exact set exists in this CardMap.
   * @param set the exact set to check for
   */
  hasSetExact = (set: SetCode) => Boolean(this.setMap.get(set)?.size);

  /**
   * Checks if a card with the specified oracle id exists
   * @param oracle_id the oracle id to check for
   */
  hasOracleId = (oracle_id: string) => this.oracleMap.has(oracle_id);

  /**
   * Removes all elements from the CardMap.
   */
  clear = () => {
    this.idMap.clear();
    this.oracleMap.clear();
  };

  /**
   * Checks if this CardMap is empty
   */
  isEmpty = () => this.idMap.size === 0;

  *[Symbol.iterator](): Iterator<[string, HCCard.Any]> {
    for (const [id, card] of this.idMap.entries()) {
      yield [id, card];
    }
  }
  *keys(): IterableIterator<string> {
    for (const id of this.idMap.keys()) {
      yield id;
    }
  }
  *oracle_iter(): IterableIterator<string> {
    for (const id of this.oracleMap.keys()) {
      yield id;
    }
  }
  *values(): IterableIterator<HCCard.Any> {
    for (const card of this.idMap.values()) {
      yield card;
    }
  }
  *entries(): IterableIterator<[string, HCCard.Any]> {
    for (const [id, card] of this.idMap.entries()) {
      yield [id, card];
    }
  }
  /**
   * Returns an array of the cards in the CardMap. This is identical to `Array.from(CardMap.values())`
   */
  cards(): HCCard.Any[] {
    return Array.from(this.idMap.values());
  }
  /**
   * Returns an array of the ids in the CardMap. This is identical to `Array.from(CardMap.keys())`
   */
  ids(): string[] {
    return Array.from(this.idMap.keys());
  }
  /**
   * Returns an array of the oracle ids in the CardMap.`
   */
  oracle_ids(): string[] {
    return Array.from(this.oracleMap.keys());
  }

  /**
   * Returns an array of the exact sets in the CardMap.
   */
  sets(): SetCode[] {
    return Array.from(this.setMap.keys());
  }

  /**
   * @returns the number of cards in the CardMap.
   */
  get size(): number {
    return this.idMap.size;
  }

  /**
   * Determines whether all the cards in a CardMap satisfy the specified test.
   * @param predicate A function that accepts up to three arguments.
   * The every method calls the predicate function for each card until the predicate returns a value
   * which is coercible to the Boolean value false, or until the end of the CardMap.
   */
  every(predicate: (card: HCCard.Any) => unknown): boolean;
  every(predicate: (card: HCCard.Any, id: string) => unknown): boolean;
  every(predicate: (card: HCCard.Any, id: string, set: SetCode) => unknown): boolean;
  every(predicate: (...args: any[]) => unknown): boolean {
    for (const [id, card] of this) {
      switch (predicate.length) {
        case 3: {
          if (predicate(card, id, card.set)) {
            continue;
          }
          return false;
        }
        case 2: {
          if (predicate(card, id)) {
            continue;
          }
          return false;
        }
        default: {
          if (predicate(card)) {
            continue;
          }
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Determines whether the specified callback function returns true for any card.
   * @param predicate A function that accepts up to three arguments.
   * The some method calls the predicate function for each card until the predicate returns a value
   * which is coercible to the Boolean value true, or until the end of the CardMap.
   */
  some(predicate: (card: HCCard.Any) => unknown): boolean;
  some(predicate: (card: HCCard.Any, id: string) => unknown): boolean;
  some(predicate: (card: HCCard.Any, id: string, set: SetCode) => unknown): boolean;
  some(predicate: (...args: any[]) => unknown): boolean {
    for (const [id, card] of this) {
      switch (predicate.length) {
        case 3: {
          if (!predicate(card, id, card.set)) {
            continue;
          }
          return true;
        }
        case 2: {
          if (!predicate(card, id)) {
            continue;
          }
          return true;
        }
        default: {
          if (!predicate(card)) {
            continue;
          }
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Performs the specified action for each card.
   * @param callbackfn A function that accepts up to three arguments.
   * forEach calls the callbackfn function one time for each card.
   */
  forEach(callbackfn: (card: HCCard.Any) => void): void;
  forEach(callbackfn: (card: HCCard.Any, id: string) => void): void;
  forEach(callbackfn: (card: HCCard.Any, id: string, set: SetCode) => void): void;
  forEach(callbackfn: (...args: any[]) => void): void {
    for (const [id, card] of this) {
      switch (callbackfn.length) {
        case 3: {
          callbackfn(card, id, card.set);
          break;
        }
        case 2: {
          callbackfn(card, id);
          break;
        }
        default: {
          callbackfn(card);
        }
      }
    }
  }

  /**
   * Calls a defined callback function on each card, and returns an array that contains the results.
   * @template T The type that `callbackfn` returns
   * @param callbackfn A function that accepts up to three arguments.
   * The map method calls the callbackfn function one time for each card.
   */
  map<T>(callbackfn: (card: HCCard.Any) => T): T[];
  map<T>(callbackfn: (card: HCCard.Any, id: string) => T): T[];
  map<T>(callbackfn: (card: HCCard.Any, id: string, set: SetCode) => T): T[];
  map<T>(callbackfn: (...args: any[]) => T): T[] {
    const ret: T[] = [];
    for (const [id, card] of this) {
      switch (callbackfn.length) {
        case 3: {
          ret.push(callbackfn(card, id, card.set));
          break;
        }
        case 2: {
          ret.push(callbackfn(card, id));
          break;
        }
        default: {
          ret.push(callbackfn(card));
        }
      }
    }
    return ret;
  }

  /**
   * Calls a defined callback function on each card, and returns a new CardMap.
   * @param callbackfn A function that accepts up to three arguments.
   * The map method calls the callbackfn function one time for each card.
   */
  mapToMap(callbackfn: (card: HCCard.Any) => HCCard.Any): this;
  mapToMap(callbackfn: (card: HCCard.Any, id: string) => HCCard.Any): this;
  mapToMap(callbackfn: (card: HCCard.Any, id: string, set: SetCode) => HCCard.Any): this;
  mapToMap(callbackfn: (...args: any[]) => HCCard.Any): this {
    const mapped = new (this.constructor as any)() as this;
    for (const [id, card] of this) {
      switch (callbackfn.length) {
        case 3: {
          mapped.set(callbackfn(card, id, card.set));
          break;
        }
        case 2: {
          mapped.set(callbackfn(card, id));
          break;
        }
        default: {
          mapped.set(callbackfn(card));
        }
      }
    }
    return mapped;
  }

  /**
   * Calls a defined callback function on each card, then flattens the resulting array.
   * This is identical to a map followed by flat with depth 1.
   * @template T The type that `callback` returns
   * @param callback A function that accepts up to three arguments.
   * The flatMap method calls the callbackfn function one time for each card.
   */
  flatMap<T>(callback: (card: HCCard.Any) => T | ReadonlyArray<T>): T[];
  flatMap<T>(callback: (card: HCCard.Any, id: string) => T | ReadonlyArray<T>): T[];
  flatMap<T>(callback: (card: HCCard.Any, id: string, set: SetCode) => T | ReadonlyArray<T>): T[];
  flatMap<T>(callback: (...args: any[]) => T | ReadonlyArray<T>): T[] {
    return this.map(callback).flat() as T[];
  }

  /**
   * Returns the first card that meets the condition specified in a callback function.
   *
   * If you're only checking the id, just use {@linkcode get} instead, since that'll be much faster
   * @param predicate A function that accepts up to three arguments.
   * The find method calls the predicate function one time for each card
   * until it finds one where the predicate returns true. If such an element is found,
   * find immediately returns that card. Otherwise, find returns undefined.
   */
  find(predicate: (card: HCCard.Any) => any): HCCard.Any | undefined;
  find(predicate: (card: HCCard.Any, id: string) => any): HCCard.Any | undefined;
  find(predicate: (card: HCCard.Any, id: string, set: SetCode) => any): HCCard.Any | undefined;
  find(predicate: (...args: any[]) => any): HCCard.Any | undefined {
    for (const [id, card] of this) {
      switch (predicate.length) {
        case 3: {
          if (predicate(card, id, card.set)) {
            return card;
          }
          break;
        }
        case 2: {
          if (predicate(card, id)) {
            return card;
          }
          break;
        }
        default: {
          if (predicate(card)) {
            return card;
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Returns the cards in a set that meet the condition specified in a callback function.
   * @param set The set to look inside.
   * @param predicate A function that accepts up to two arguments.
   * The find method calls the predicate function one time for each card in the set until returning true.
   */
  findFromSet(set: SetCode, predicate: (card: HCCard.Any) => any): HCCard.Any | undefined;
  findFromSet(
    set: SetCode,
    predicate: (card: HCCard.Any, id: string) => any
  ): HCCard.Any | undefined;
  findFromSet(set: SetCode, predicate: (...args: any[]) => any): HCCard.Any | undefined {
    for (const card of this.getAllInSet(set)) {
      switch (predicate.length) {
        case 2: {
          if (predicate(card, card.id)) {
            return card;
          }
          break;
        }
        default: {
          if (predicate(card)) {
            return card;
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Returns the cards exactly in a set that meet the condition specified in a callback function.
   * @param set The set to look inside exactly.
   * @param predicate A function that accepts up to two arguments.
   * The find method calls the predicate function one time for each card in the set until returning true.
   */
  findFromSetExact(set: SetCode, predicate: (card: HCCard.Any) => any): HCCard.Any | undefined;
  findFromSetExact(
    set: SetCode,
    predicate: (card: HCCard.Any, id: string) => any
  ): HCCard.Any | undefined;
  findFromSetExact(set: SetCode, predicate: (...args: any[]) => any): HCCard.Any | undefined {
    for (const card of this.getAllInSetExact(set)) {
      switch (predicate.length) {
        case 2: {
          if (predicate(card, card.id)) {
            return card;
          }
          break;
        }
        default: {
          if (predicate(card)) {
            return card;
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Returns the cards that meet the condition specified in a callback function as an array.
   *
   * If you're only checking the ids or sets, just use {@linkcode getSubset}
   * or {@linkcode getAllInSet} instead, since those'll be much faster
   * @param predicate A function that accepts up to three arguments.
   * The filter method calls the predicate function one time for each card.
   */
  filter(predicate: (card: HCCard.Any) => any): HCCard.Any[];
  filter(predicate: (card: HCCard.Any, id: string) => any): HCCard.Any[];
  filter(predicate: (card: HCCard.Any, id: string, set: SetCode) => any): HCCard.Any[];
  filter(predicate: (...args: any[]) => any): HCCard.Any[] {
    const cards: HCCard.Any[] = [];
    for (const [id, card] of this) {
      switch (predicate.length) {
        case 3: {
          if (predicate(card, id, card.set)) {
            cards.push(card);
          }
          break;
        }
        case 2: {
          if (predicate(card, id)) {
            cards.push(card);
          }
          break;
        }
        default: {
          if (predicate(card)) {
            cards.push(card);
          }
        }
      }
    }
    return cards;
  }
  /**
   * Returns the cards that meet the condition specified in a callback function as a new CardMap.
   *
   * If you're only checking the ids or sets, just use {@linkcode getSubset}
   * or {@linkcode getAllInSet} instead, since those'll be much faster
   * @param predicate A function that accepts up to three arguments.
   * The filter method calls the predicate function one time for each card.
   */
  filterToMap(predicate: (card: HCCard.Any) => any): this;
  filterToMap(predicate: (card: HCCard.Any, id: string) => any): this;
  filterToMap(predicate: (card: HCCard.Any, id: string, set: SetCode) => any): this;
  filterToMap(predicate: (...args: any[]) => any): this {
    const subMap = new (this.constructor as any)() as this;
    for (const [id, card] of this) {
      switch (predicate.length) {
        case 3: {
          if (predicate(card, id, card.set)) {
            subMap.set(card);
          }
          break;
        }
        case 2: {
          if (predicate(card, id)) {
            subMap.set(card);
          }
          break;
        }
        default: {
          if (predicate(card)) {
            subMap.set(card);
          }
        }
      }
    }
    return subMap;
  }
  /**
   * Returns the cards that meet the condition specified in a callback function,
   * excluding cards with the same oracle id, as a list
   *
   * If you're only checking the ids or sets, just use {@linkcode getSubset}
   * or {@linkcode getAllInSet} instead, since those'll be much faster
   * @param predicate A function that accepts up to three arguments.
   * The filter method calls the predicate function one time for each card.
   */
  filterOracle(predicate: (card: HCCard.Any) => any): HCCard.Any[];
  filterOracle(predicate: (card: HCCard.Any, id: string) => any): HCCard.Any[];
  filterOracle(predicate: (card: HCCard.Any, id: string, set: SetCode) => any): HCCard.Any[];
  filterOracle(predicate: (...args: any[]) => any): HCCard.Any[] {
    const cards: HCCard.Any[] = [];
    const oracleSet = new Set<string>();
    for (const [id, card] of this) {
      if (oracleSet.has(card.oracle_id)) {
        continue;
      }
      switch (predicate.length) {
        case 3: {
          if (predicate(card, id, card.set)) {
            cards.push(card);
            oracleSet.add(card.oracle_id);
          }
          break;
        }
        case 2: {
          if (predicate(card, id)) {
            cards.push(card);
            oracleSet.add(card.oracle_id);
          }
          break;
        }
        default: {
          if (predicate(card)) {
            cards.push(card);
            oracleSet.add(card.oracle_id);
          }
        }
      }
    }
    return cards;
  }

  /**
   * Returns the cards that meet the condition specified in a callback function,
   * excluding cards with the same oracle id, as a CardMap
   *
   * If you're only checking the ids or sets, just use {@linkcode getSubset}
   * or {@linkcode getAllInSet} instead, since those'll be much faster
   * @param predicate A function that accepts up to three arguments.
   * The filter method calls the predicate function one time for each card.
   */
  filterOracleToMap(predicate: (card: HCCard.Any) => any): this;
  filterOracleToMap(predicate: (card: HCCard.Any, id: string) => any): this;
  filterOracleToMap(predicate: (card: HCCard.Any, id: string, set: SetCode) => any): this;
  filterOracleToMap(predicate: (...args: any[]) => any): this {
    const subMap = new (this.constructor as any)() as this;
    for (const [id, card] of this) {
      if (subMap.hasOracleId(card.oracle_id)) {
        continue;
      }
      switch (predicate.length) {
        case 3: {
          if (predicate(card, id, card.set)) {
            subMap.set(card);
          }
          break;
        }
        case 2: {
          if (predicate(card, id)) {
            subMap.set(card);
          }
          break;
        }
        default: {
          if (predicate(card)) {
            subMap.set(card);
          }
        }
      }
    }
    return subMap;
  }
  /**
   * Returns the cards that meet the condition specified in a callback function as an array.
   *
   * Use this one when dealing with searches.
   * @param predicate A function that accepts up to three arguments.
   * @param preferMode The prefer mode to use, if any; if supplied, will assume that unique mode is cards
   * @param excludeExtras whether to exclude extra cards if possible
   * The filter method calls the predicate function one time for each card.
   */
  filterForSearch(
    predicate: (card: HCCard.Any) => any,
    preferMode?: preferType,
    excludeExtras?: boolean
  ): HCCard.Any[] {
    if (!preferMode) {
      const withExtras = this.filter(predicate);
      if (!excludeExtras) {
        return withExtras;
      }
      const withoutExtras = withExtras.filter(isNonExtra);
      return withoutExtras.length ? withoutExtras : withExtras;
    }
    const withExtras = new LightCardMap();
    for (const card of this.values()) {
      if (predicate(card)) {
        withExtras.set(card);
      }
    }
    if (!excludeExtras) {
      return withExtras.getPreferred(preferMode);
    }
    const withoutExtras = withExtras.filterToMap(isNonExtra);

    return (withoutExtras.size ? withoutExtras : withExtras).getPreferred(preferMode);
  }

  /**
   * Returns the cards in a set that meet the condition specified in a callback function as a list.
   * @param set The set to look inside.
   * @param predicate A function that accepts up to two arguments.
   * The filter method calls the predicate function one time for each card in the set.
   */
  filterFromSet(set: SetCode, predicate: (card: HCCard.Any) => any): HCCard.Any[];
  filterFromSet(set: SetCode, predicate: (card: HCCard.Any, id: string) => any): HCCard.Any[];
  filterFromSet(set: SetCode, predicate: (...args: any[]) => any): HCCard.Any[] {
    const cards: HCCard.Any[] = [];
    for (const card of this.getAllInSet(set)) {
      switch (predicate.length) {
        case 2: {
          if (predicate(card, card.id)) {
            cards.push(card);
          }
          break;
        }
        default: {
          if (predicate(card)) {
            cards.push(card);
          }
        }
      }
    }
    return cards;
  }

  /**
   * Returns the cards in a set that meet the condition specified in a callback function as a CardMap.
   * @param set The set to look inside.
   * @param predicate A function that accepts up to two arguments.
   * The filter method calls the predicate function one time for each card in the set.
   */
  filterFromSetToMap(set: SetCode, predicate: (card: HCCard.Any) => any): this;
  filterFromSetToMap(set: SetCode, predicate: (card: HCCard.Any, id: string) => any): this;
  filterFromSetToMap(set: SetCode, predicate: (...args: any[]) => any): this {
    const subMap = new (this.constructor as any)() as this;
    for (const card of this.getAllInSet(set)) {
      switch (predicate.length) {
        case 2: {
          if (predicate(card, card.id)) {
            subMap.set(card);
          }
          break;
        }
        default: {
          if (predicate(card)) {
            subMap.set(card);
          }
        }
      }
    }
    return subMap;
  }

  /**
   * Returns the cards in a set that meet the condition specified in a callback function as a list.
   * @param set The set to look inside.
   * @param predicate A function that accepts up to two arguments.
   * The filter method calls the predicate function one time for each card in the set.
   */
  filterFromSetExact(set: SetCode, predicate: (card: HCCard.Any) => any): HCCard.Any[];
  filterFromSetExact(set: SetCode, predicate: (card: HCCard.Any, id: string) => any): HCCard.Any[];
  filterFromSetExact(set: SetCode, predicate: (...args: any[]) => any): HCCard.Any[] {
    const cards: HCCard.Any[] = [];
    for (const card of this.getAllInSetExact(set)) {
      switch (predicate.length) {
        case 2: {
          if (predicate(card, card.id)) {
            cards.push(card);
          }
          break;
        }
        default: {
          if (predicate(card)) {
            cards.push(card);
          }
        }
      }
    }
    return cards;
  }

  /**
   * Returns the cards exactly in a set that meet the condition specified in a callback function as a CardMap.
   * @param set The set to look inside exactly.
   * @param predicate A function that accepts up to two arguments
   *  The filter method calls the predicate function one time for each card in the set.
   */
  filterFromSetExactToMap(set: SetCode, predicate: (card: HCCard.Any) => any): this;
  filterFromSetExactToMap(set: SetCode, predicate: (card: HCCard.Any, id: string) => any): this;
  filterFromSetExactToMap(set: SetCode, predicate: (...args: any[]) => any): this {
    const subMap = new (this.constructor as any)() as this;
    for (const card of this.getAllInSetExact(set)) {
      switch (predicate.length) {
        case 2: {
          if (predicate(card, card.id)) {
            subMap.set(card);
          }
          break;
        }
        default: {
          if (predicate(card)) {
            subMap.set(card);
          }
        }
      }
    }
    return subMap;
  }

  /**
   * Calls the specified callback function for all the cards in a CardMap.
   * The return value of the callback function is the accumulated result,
   * and is provided as an argument in the next call to the callback function.
   * @template U the type of the value that is accumulated
   * @param callbackfn A function that accepts two arguments.
   * The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start
   * the accumulation. The first call to the callbackfn function provides this value as an argument.
   */
  reduce<U>(callbackfn: (previousValue: U, card: HCCard.Any) => U, initialValue: U): U {
    let accumulator: U = initialValue;
    for (const card of this.values()) {
      accumulator = callbackfn(accumulator, card);
    }
    return accumulator;
  }
}

/**
 * The class for a map of cards.
 */
export class CardMap extends LightCardMap {
  /**
   * Maps names to the card ids they are associated with
   */
  protected lookupMap = new CardLookupMap();
  /**
   * Creates a new CardMap
   */
  constructor();
  /**
   * Creates a new CardMap
   * @param cards The initial cards to set, if any
   */
  constructor(cards: HCCard.Any[]);
  constructor(cards?: HCCard.Any[]) {
    super();
    if (!cards) return;
    cards.forEach(this.set);
  }

  /**
   * Returns a specified id from the CardMap object.
   * If no card has the specified id, the name is returned
   * @param name the name of the card to get
   */
  getIDFromName = (name: string) => this.lookupMap.get(name) ?? name;

  /**
   * Returns a specified card from the CardMap object.
   * Any change made to that card will effectively modify it inside the CardMap.
   * If no card has the specified name, undefined is returned
   * @param name the name of the card to get
   */
  getFromName = (name: string) => this.idMap.get(this.getIDFromName(name));

  /**
   * Returns a specified card from the CardMap object.
   * Any change made to that card will effectively modify it inside the CardMap.
   * If no card has the specified name, undefined is returned
   * @param name the name of the card to get
   * @param code the set code to use, if any
   * @param collector_number the collector number to use, if any
   */
  getFromNameSetAndNumber = (name: string, code?: SetCode, collector_number?: string) =>
    this.idMap.get(
      this.lookupMap.getBySetAndNumber(
        fixName(name),
        fixSetCodeMaybe(code),
        collector_number && fixName(collector_number)
      ) ?? fixName(name)
    );
  /**
   * Returns a specified card from the CardMap object.
   * Any change made to that card will effectively modify it inside the CardMap.
   * If no card has the specified hcid, undefined is returned
   * @param hcid the hcid of the card to get
   */
  getFromHCID = (hcid: string) => this.idMap.get(this.lookupMap.getFromHCID(hcid) ?? '');

  /**
   * Returns the correct card for a card name and a number of prints, if any.
   *
   * Suitable for use in the deckbuilder.
   * @param text the name of the card to get
   */
  getForDeck = (text: string): { card?: HCCard.Any; count?: number } => {
    const fixed = fixName(text);
    const first = fixed.split(' ')[0];
    const count = parseInt(first);
    if (isInteger(first) && count > 0 && first.length != fixed.length) {
      const card = this.getForDeck(fixed.slice(first.length + 1))?.card;
      if (card) {
        return { card, count };
      }
    }
    const { name, code, collector_number } = splitCardName(fixed);
    const isLand = isLandName(name);
    const id = this.lookupMap.getBySetAndNumber(name, code, collector_number, isLand);
    if (id) {
      const card = this.get(id)!;
      return { card };
    } else if (isLand) {
      return { card: this.getRandomCard(landIdMap.get(name)) };
    }
    if (isInteger(first) && count > 0) {
      return { count };
    }
    return {};
  };

  /**
   * Returns a specified card from the CardMap object.
   * Any change made to that card will effectively modify it inside the CardMap.
   * If no card has the specified hcid, undefined is returned
   * @param part the related card for the card to get
   */
  getFromPart = (part: HCRelatedCard) =>
    this.get(part.id) ??
    this.getFromHCID(part.hcid) ??
    this.getFromNameSetAndNumber(part.name, part.set);

  /**
   * Returns a portion of the CardMap object as a list, based on a provided list of names.
   * @param nameList the names to use
   */
  getCardsByNames = (nameList: stringIterable) => {
    const cards: HCCard.Any[] = [];
    for (const name of nameList) {
      const card = this.get(this.getIDFromName(name));
      if (card) {
        cards.push(card);
      }
    }
    return cards;
  };

  /**
   * Returns a subset of the CardMap object as a new CardMap, based on a provided list of names.
   * @param nameList the names to use
   */
  getCardsByNamesAsSubset = (nameList: stringIterable) => {
    const subMap = new (this.constructor as any)() as this;
    for (const name of nameList) {
      const card = this.get(this.getIDFromName(name));
      if (card) {
        subMap.set(card);
      }
    }
    return subMap;
  };

  /**
   * Adds a new card to the CardMap. If a card with the same id already exists, the card will be updated.
   * @param card card to set
   */
  set = (card: HCCard.Any) => {
    this.idMap.set(card.id, card);
    pushToMap(this.oracleMap, card.oracle_id, card.id);
    pushToMap(this.setMap, card.set, card.id);
    this.lookupMap.set(card);
  };

  /**
   * @param id the id to delete
   * @returns true if an element in the CardMap existed and has been removed, or false if the element does not exist.
   */
  delete = (id: string) => {
    const value = this.idMap.get(id);
    if (!value) return false;
    const oracle = this.oracleMap.get(value.oracle_id);
    oracle?.delete(id);
    if (oracle?.size == 0) {
      this.oracleMap.delete(value.oracle_id);
    }
    const set = this.setMap.get(value.set);
    set?.delete(id);
    if (set?.size == 0) {
      this.setMap.delete(value.set);
    }
    this.idMap.delete(id);
    this.lookupMap.delete(value);
    return true;
  };

  /**
   * Checks if a card with the specified hcid exists
   * @param hcid the hcid to check for
   */
  hasHCID = (hcid: string) => this.lookupMap.hasHCID(hcid);

  /**
   * Checks if a card with the specified name exists
   * @param name the name to check for
   */
  hasName = (name: string) => this.lookupMap.has(name);

  /**
   * Removes all elements from the CardMap.
   */
  clear = () => {
    this.idMap.clear();
    this.setMap.clear();
    this.oracleMap.clear();
    this.lookupMap.clear();
  };
  /**
   * Removes all elements from the {@linkcode CardLookupMap} and rebuilds it.
   *
   * Use this after applying invariants.
   */
  rebuildLookupMap = () => {
    this.lookupMap.clear();
    this.forEach(card => this.lookupMap.set(card));
  };
}
