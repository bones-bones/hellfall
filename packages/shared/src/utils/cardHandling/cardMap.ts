import { HCCard, HCKind, SetCode } from '@hellfall/shared/types';
import { getChildSets, getDirectChildSets } from '../setHandling';

/**
 * the list of preference options
 */
export const preferTypeList = ['newest', 'oldest'] as const;
/**
 * a preference option
 */
export type preferType = (typeof preferTypeList)[number];

const newestSort = (value1: HCCard.Any, value2: HCCard.Any) => {
  if (value1.kind != value2.kind) {
    return Object.values(HCKind).indexOf(value1.kind) - Object.values(HCKind).indexOf(value2.kind);
  }
  switch (value1.kind) {
    case 'card':
      return parseInt(value1.hcid) - parseInt(value2.hcid);
    case 'land':
      return parseInt(value1.hcid.slice(1)) - parseInt(value2.hcid.slice(1));
  }
  return parseInt(value1.collector_number) - parseInt(value2.collector_number);
};
const oldestSort = (value1: HCCard.Any, value2: HCCard.Any) => -1 * newestSort(value1, value2);
const preferToSort: Record<preferType, (value1: HCCard.Any, value2: HCCard.Any) => number> = {
  newest: newestSort,
  oldest: oldestSort,
};

export const getPreference = (cards: HCCard.Any[], prefer: preferType): HCCard.Any =>
  cards.sort(preferToSort[prefer])[0];
/**
 * The class for a map of cards.
 */
export class CardMap {
  protected idMap = new Map<string, HCCard.Any>();
  protected oracleMap = new Map<string, Set<string>>();
  protected setMap = new Map<SetCode, Set<string>>();

  /**
   * Adds a new card to the CardMap. If a card with the same id already exists, the card will be updated.
   * @param card card to set
   */
  set = (card: HCCard.Any) => {
    this.idMap.set(card.id, card);
    if (!this.oracleMap.has(card.oracle_id)) {
      this.oracleMap.set(card.oracle_id, new Set());
    }
    this.oracleMap.get(card.oracle_id)!.add(card.id);
    if (!this.setMap.has(card.set)) {
      this.setMap.set(card.set, new Set());
    }
    this.setMap.get(card.set)!.add(card.id);
  };

  /**
   * Adds a new card to the CardMap with its id. If a card with the same id already exists, the card will be updated.
   * @param id id to use
   * @param card card to add
   */
  protected setWithId = (id: string, card: HCCard.Any) => {
    this.idMap.set(id, card);
    if (!this.oracleMap.has(card.oracle_id)) {
      this.oracleMap.set(card.oracle_id, new Set());
    }
    this.oracleMap.get(card.oracle_id)!.add(id);
    if (!this.setMap.has(card.set)) {
      this.setMap.set(card.set, new Set());
    }
    this.setMap.get(card.set)!.add(id);
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
  deleteMultiple(ids: string[]): void {
    ids.forEach(this.delete);
  }

  /**
   * Creates a new CardMap
   */
  constructor();
  /**
   * Creates a new CardMap
   * @param cards The initial cards to set, if any
   */
  constructor(cards: HCCard.Any[]);
  /**
   * Creates a new CardMap
   * @param cards The initial cards to set, if any
   * @param useHCIDs Whether to use the cards' hcids. This should only be used on the backend
   */
  constructor(cards: HCCard.Any[], useHCIDs: boolean);
  constructor(cards?: HCCard.Any[], useHCIDs?: boolean) {
    this.idMap = new Map();
    this.setMap = new Map();
    if (!cards) return;
    if (useHCIDs) {
      cards?.forEach(card => this.setWithId(card.hcid.toLowerCase(), card));
    } else {
      cards?.forEach(card => this.set(card));
    }
  }

  /**
   * Returns a specified card from the CardMap object.
   * Any change made to that card will effectively modify it inside the CardMap.
   * If no card has the specified id, undefined is returned
   * @param id the id of the card to get
   */
  get = (id: string) => this.idMap.get(id);

  /**
   * Returns a subset of the CardMap object as a new CardMap, based on the provided list of ids.
   * @param idList the list of ids to get
   * @returns Returns the subset of the CardMap with the given ids.
   */
  getSubset(idList: string[] | Set<string>): this {
    const subMap = new (this.constructor as any)() as this;
    idList.forEach(id => {
      const card = this.get(id);
      if (card) {
        subMap.set(card);
      }
    });
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
   * Returns a subset of the CardMap object as a new CardMap, based on a provided oracle id.
   * @param oracle_id the oracle id to use
   */
  getAllPrints(oracle_id: string): this {
    return this.getSubset(this.getIdsOfPrints(oracle_id) ?? []);
  }

  /**
   * Returns a subset of the CardMap object as a new CardMap, based on a provided list of oracle ids.
   * @param oracleList the oracle ids to use
   * @param prefer the version of the card to prefer, if any
   */
  getCardsByOracleIds(oracleList: string[], prefer: preferType = 'newest'): this {
    const subMap = new (this.constructor as any)() as this;
    oracleList.forEach(id => {
      const cards = this.getAllPrints(id).cards();
      if (cards.length) {
        subMap.set(getPreference(cards, prefer));
      }
    });
    return subMap;
  }
  /**
   * Returns a subset of the CardMap object as a new CardMap, based on a prefer option.
   * @param prefer the version of the card to prefer
   */
  getPreferred(prefer: preferType): this {
    const subMap = new (this.constructor as any)() as this;
    this.oracle_ids().forEach(id => {
      const cards = this.getAllPrints(id).cards();
      if (cards.length) {
        subMap.set(getPreference(cards, prefer));
      }
    });
    return subMap;
  }

  /**
   * Returns the subset of the CardMap object in the given set as a new CardMap.
   * @param set the set to get
   */
  getAllInSet(set: SetCode): this {
    const idList = [
      ...Array.from(this.setMap.get(set) ?? []),
      ...(getChildSets(set)?.flatMap(subSet => Array.from(this.setMap.get(subSet) ?? [])) ?? []),
    ];
    if (!idList) return new (this.constructor as any)() as this;
    return this.getSubset(idList);
  }

  /**
   * Returns the subset of the CardMap object directly in the given set as a new CardMap
   * @param set the set to get
   * @returns excludes cards with different set types e.g. vetoed cards
   */
  getAllInSetDirect(set: SetCode): this {
    const idList = [
      ...Array.from(this.setMap.get(set) ?? []),
      ...(getDirectChildSets(set)?.flatMap(subSet => Array.from(this.setMap.get(subSet) ?? [])) ??
        []),
    ];
    if (!idList) return new (this.constructor as any)() as this;
    return this.getSubset(idList);
  }

  /**
   * Returns the subset of the CardMap object exactly in the given set as a new CardMap.
   * @param set the set to get
   */
  getAllInSetExact(set: SetCode): this {
    const idList = this.setMap.get(set);
    if (!idList) return new (this.constructor as any)() as this;
    return this.getSubset(idList);
  }

  /**
   * Returns the ids of the cards in the given set.
   * @param set the set to get
   */
  getAllIdsInSet(set: SetCode): string[] {
    return [
      ...Array.from(this.setMap.get(set) ?? []),
      ...(getChildSets(set)?.flatMap(subSet => Array.from(this.setMap.get(subSet) ?? [])) ?? []),
    ];
  }

  /**
   * Returns the ids of the cards directly in the given set.
   * @param set the set to get
   */
  getAllIdsInSetDirect(set: SetCode): string[] {
    return [
      ...Array.from(this.setMap.get(set) ?? []),
      ...(getDirectChildSets(set)?.flatMap(subSet => Array.from(this.setMap.get(subSet) ?? [])) ??
        []),
    ];
  }

  /**
   * Returns the ids of the cards exactly in the given set.
   * @param set the set to get
   */
  getAllIdsInSetExact(set: SetCode): string[] {
    return Array.from(this.setMap.get(set) ?? []);
  }
  /**
   * Returns the subset of the CardMap object in the given sets as a new CardMap.
   * @param setList the list of sets to get
   */
  getAllInSetList(setList: SetCode[]): this {
    const idList = setList.flatMap(set => this.getAllIdsInSet(set));
    return this.getSubset(idList);
  }
  /**
   * Returns the subset of the CardMap object directly in the given sets as a new CardMap.
   * @param setList the list of sets to get
   */
  getAllInSetListDirect(setList: SetCode[]): this {
    const idList = setList.flatMap(set => this.getAllIdsInSetDirect(set));
    return this.getSubset(idList);
  }

  /**
   * Returns the subset of the CardMap object exactly in the given sets as a new CardMap.
   * @param setList the list of sets to get
   */
  getAllInSetListExact(setList: SetCode[]): this {
    const idList = setList.flatMap(set => this.getAllIdsInSetExact(set));
    return this.getSubset(idList);
  }

  /**
   * Returns the ids of the cards in the given sets.
   * @param setList the list of sets to get
   */
  getAllIdsInSetList(setList: SetCode[]): string[] {
    return setList.flatMap(set => this.getAllIdsInSet(set));
  }

  /**
   * Returns the ids of the cards directly in the given sets.
   * @param setList the list of sets to get
   */
  getAllIdsInSetListDirect(setList: SetCode[]): string[] {
    return setList.flatMap(set => this.getAllIdsInSetDirect(set));
  }

  /**
   * Returns the ids of the cards exactly in the given sets.
   * @param setList the list of sets to get
   */
  getAllIdsInSetListExact(setList: SetCode[]): string[] {
    return setList.flatMap(set => this.getAllIdsInSetExact(set));
  }

  /**
   * Gets a random id from this CardMap
   */
  getRandomId = () => this.ids()[Math.floor(Math.random() * this.size())];
  /**
   * Gets a random card from this CardMap
   */
  getRandomCard = () => this.cards()[Math.floor(Math.random() * this.size())];

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
  mapToArray<T>(callbackfn: (card: HCCard.Any) => T): T[];
  mapToArray<T>(callbackfn: (card: HCCard.Any, id: string) => T): T[];
  mapToArray<T>(callbackfn: (card: HCCard.Any, id: string, set: SetCode) => T): T[];
  mapToArray<T>(callbackfn: (...args: any[]) => T): T[] {
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
   * Calls a defined callback function on each card, and returns a map that contains the results.
   * @template K the type of the key that `callbackfn` returns
   * @template V the type of the value that `callbackfn` returns
   * @param callbackfn A function that accepts up to three arguments.
   * The map method calls the callbackfn function one time for each card.
   */
  mapToMap<K, V>(callbackfn: (card: HCCard.Any) => [K, V]): Map<K, V>;
  mapToMap<K, V>(callbackfn: (card: HCCard.Any, id: string) => [K, V]): Map<K, V>;
  mapToMap<K, V>(callbackfn: (card: HCCard.Any, id: string, set: SetCode) => [K, V]): Map<K, V>;
  mapToMap<K, V>(callbackfn: (...args: any[]) => [K, V]): Map<K, V> {
    const retMap = new Map<K, V>();
    for (const [id, card] of this) {
      switch (callbackfn.length) {
        case 3: {
          retMap.set(...callbackfn(card, id, card.set));
          break;
        }
        case 2: {
          retMap.set(...callbackfn(card, id));
          break;
        }
        default: {
          retMap.set(...callbackfn(card));
        }
      }
    }
    return retMap;
  }
  /**
   * Calls a defined callback function on each card, and returns an id map that contains the results.
   * @template V the type of the value that `callbackfn` returns
   * @param callbackfn A function that accepts up to three arguments.
   * The map method calls the callbackfn function one time for each card.
   */
  mapToIdMap<V>(callbackfn: (card: HCCard.Any) => V): Map<string, V>;
  mapToIdMap<V>(callbackfn: (card: HCCard.Any, id: string) => V): Map<string, V>;
  mapToIdMap<V>(callbackfn: (card: HCCard.Any, id: string, set: SetCode) => V): Map<string, V>;
  mapToIdMap<V>(callbackfn: (...args: any[]) => V): Map<string, V> {
    const retMap = new Map<string, V>();
    for (const [id, card] of this) {
      switch (callbackfn.length) {
        case 3: {
          retMap.set(id, callbackfn(card, id, card.set));
          break;
        }
        case 2: {
          retMap.set(id, callbackfn(card, id));
          break;
        }
        default: {
          retMap.set(id, callbackfn(card));
        }
      }
    }
    return retMap;
  }
  /**
   * Calls a defined callback function on each card, and returns a new CardMap.
   * @param callbackfn A function that accepts up to three arguments.
   * The map method calls the callbackfn function one time for each card.
   */
  map(callbackfn: (card: HCCard.Any) => HCCard.Any): this;
  map(callbackfn: (card: HCCard.Any, id: string) => HCCard.Any): this;
  map(callbackfn: (card: HCCard.Any, id: string, set: SetCode) => HCCard.Any): this;
  map(callbackfn: (...args: any[]) => HCCard.Any): this {
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
    return this.mapToArray(callback).flat() as T[];
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
    for (const [id, card] of this.getAllInSet(set)) {
      switch (predicate.length) {
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
    for (const [id, card] of this.getAllInSetExact(set)) {
      switch (predicate.length) {
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
   * Returns the cards that meet the condition specified in a callback function.
   *
   * If you're only checking the ids or sets, just use {@linkcode getSubset}
   * or {@linkcode getAllInSet} instead, since those'll be much faster
   * @param predicate A function that accepts up to three arguments.
   * The filter method calls the predicate function one time for each card.
   */
  filter(predicate: (card: HCCard.Any) => any): this;
  filter(predicate: (card: HCCard.Any, id: string) => any): this;
  filter(predicate: (card: HCCard.Any, id: string, set: SetCode) => any): this;
  filter(predicate: (...args: any[]) => any): this {
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
   * excluding cards with the same oracle id
   *
   * If you're only checking the ids or sets, just use {@linkcode getSubset}
   * or {@linkcode getAllInSet} instead, since those'll be much faster
   * @param predicate A function that accepts up to three arguments.
   * The filter method calls the predicate function one time for each card.
   */
  filterOracle(predicate: (card: HCCard.Any) => any): this;
  filterOracle(predicate: (card: HCCard.Any, id: string) => any): this;
  filterOracle(predicate: (card: HCCard.Any, id: string, set: SetCode) => any): this;
  filterOracle(predicate: (...args: any[]) => any): this {
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
   * Returns the cards in a set that meet the condition specified in a callback function.
   * @param set The set to look inside.
   * @param predicate A function that accepts up to two arguments.
   * The filter method calls the predicate function one time for each card in the set.
   */
  filterFromSet(set: SetCode, predicate: (card: HCCard.Any) => any): this;
  filterFromSet(set: SetCode, predicate: (card: HCCard.Any, id: string) => any): this;
  filterFromSet(set: SetCode, predicate: (...args: any[]) => any): this {
    const subMap = new (this.constructor as any)() as this;
    for (const [id, card] of this.getAllInSet(set)) {
      switch (predicate.length) {
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
   * Returns the cards exactly in a set that meet the condition specified in a callback function.
   * @param set The set to look inside exactly.
   * @param predicate A function that accepts up to two arguments
   *  The filter method calls the predicate function one time for each card in the set.
   */
  filterFromSetExact(set: SetCode, predicate: (card: HCCard.Any) => any): this;
  filterFromSetExact(set: SetCode, predicate: (card: HCCard.Any, id: string) => any): this;
  filterFromSetExact(set: SetCode, predicate: (...args: any[]) => any): this {
    const subMap = new (this.constructor as any)() as this;
    for (const [id, card] of this.getAllInSetExact(set)) {
      switch (predicate.length) {
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
    this.setMap.clear();
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
    return Array.from(this.idMap.keys());
  }
  /**
   * Returns an array of the sets in the CardMap.
   */
  sets(): SetCode[] {
    return Array.from(this.setMap.keys());
  }

  /**
   * @returns the number of cards in the CardMap.
   */
  size = () => this.idMap.size;
}

/**
 * The class for a map of cards where hcids are used instead of normal ids. Only for use in the backend.
 */
export class HCIDMap extends CardMap {
  constructor();
  constructor(cards: HCCard.Any[]);
  constructor(cards?: HCCard.Any[]) {
    if (!cards) {
      super();
      return;
    }
    super(cards, true);
  }
  /**
   * Returns a specified card from the CardMap object. Any change made to that card will effectively modify it inside the CardMap.
   * @returns Returns the card with the specified id. If no card has the specified id, undefined is returned.
   */
  get = (id: string) => this.idMap.get(id.toLowerCase());

  /**
   * Adds a new card to the CardMap. If a card with the same id already exists, the card will be updated.
   */
  set = (card: HCCard.Any) => {
    this.idMap.set(card.hcid.toLowerCase(), card);
    if (!this.setMap.has(card.set)) {
      this.setMap.set(card.set, new Set());
    }
    this.setMap.get(card.set)!.add(card.hcid.toLowerCase());
  };
  /**
   * @returns true if an element in the CardMap existed and has been removed, or false if the element does not exist.
   */
  delete = (id: string) => {
    const value = this.idMap.get(id.toLowerCase());
    if (!value) return false;
    const set = this.setMap.get(value.set);
    set?.delete(id.toLowerCase());
    if (set?.size == 0) {
      this.setMap.delete(value.set);
    }
    this.idMap.delete(id.toLowerCase());
    return true;
  };
  /**
   * @returns boolean indicating whether a card with the specified id exists or not, and possibly whether it is in the specified set or not.
   */
  has = (id: string, set?: SetCode) => {
    if (set) {
      return Boolean(
        this.setMap.get(set)?.has(id.toLowerCase()) ||
          getChildSets(set)?.some(subSet => this.setMap.get(subSet)?.has(id.toLowerCase()))
      );
    }
    return this.idMap.has(id.toLowerCase());
  };

  /**
   * @returns boolean indicating whether a card with the specified id exists or not in the specified exact set.
   */
  hasExact = (id: string, set: SetCode) => Boolean(this.setMap.get(set)?.has(id.toLowerCase()));
}
