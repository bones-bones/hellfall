import { HCCard, HCSet, toSubSets } from '@hellfall/shared/types';

/**
 * The class for a map of cards.
 */
export class CardMap {
  protected idMap = new Map<string, HCCard.Any>();
  protected setMap = new Map<HCSet, Set<string>>();

  /**
   * Adds a new card to the CardMap. If a card with the same id already exists, the card will be updated.
   */
  set(card: HCCard.Any): void {
    this.idMap.set(card.id, card);
    if (!this.setMap.has(card.set)) {
      this.setMap.set(card.set, new Set());
    }
    this.setMap.get(card.set)!.add(card.id);
  }

  protected setWithId(id: string, card: HCCard.Any): void {
    this.idMap.set(id, card);
    if (!this.setMap.has(card.set)) {
      this.setMap.set(card.set, new Set());
    }
    this.setMap.get(card.set)!.add(id);
  }
  /**
   * Adds multiple new cards to the CardMap. If a card with the same id already exists, the card will be updated.
   */
  setMultiple(cards: HCCard.Any[]): void;
  setMultiple(cards: this): void;
  setMultiple(cards: HCCard.Any[] | this): void {
    cards.forEach(card => this.set(card));
  }
  /**
   * @returns true if an element in the CardMap existed and has been removed, or false if the element does not exist.
   */
  delete(id: string): boolean {
    const value = this.idMap.get(id);
    if (!value) return false;
    const set = this.setMap.get(value.set);
    set?.delete(id);
    if (set?.size == 0) {
      this.setMap.delete(value.set);
    }
    this.idMap.delete(id);
    return true;
  }

  /**
   * Deletes multiple cards from the CardMap.
   */
  deleteMultiple(ids: string[]): void {
    ids.forEach(id => this.delete(id));
  }

  constructor();
  constructor(cards: HCCard.Any[]);
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
   * Returns a specified card from the CardMap object. Any change made to that card will effectively modify it inside the CardMap.
   * @returns Returns the card with the specified id. If no card has the specified id, undefined is returned.
   */
  get(id: string): HCCard.Any | undefined {
    return this.idMap.get(id);
  }

  /**
   * Returns a subset of the CardMap object as a new CardMap, based on the provided list of ids.
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
   * Returns the subset of the CardMap object in the given set as a new CardMap.
   * @returns Returns the subset of the CardMap in the given set.
   */
  getAllInSet(set: HCSet): this {
    const idList = [
      ...Array.from(this.setMap.get(set) ?? []),
      ...(toSubSets[set]?.flatMap(subSet => Array.from(this.setMap.get(subSet) ?? [])) ?? []),
    ];
    if (!idList) return new (this.constructor as any)() as this;
    return this.getSubset(idList);
  }

  /**
   * Returns the subset of the CardMap object exactly in the given set as a new CardMap.
   * @returns Returns the subset of the CardMap exactly in the given set.
   */
  getAllInSetExact(set: HCSet): this {
    const idList = this.setMap.get(set);
    if (!idList) return new (this.constructor as any)() as this;
    return this.getSubset(idList);
  }

  /**
   * Returns the ids of the cards in the given set.
   * @returns Returns the ids of the cards in the given set.
   */
  getAllIdsInSet(set: HCSet): string[] {
    return [
      ...Array.from(this.setMap.get(set) ?? []),
      ...(toSubSets[set]?.flatMap(subSet => Array.from(this.setMap.get(subSet) ?? [])) ?? []),
    ];
  }

  /**
   * Returns the ids of the cards exactly in the given set.
   * @returns Returns the ids of the cards exactly in the given set.
   */
  getAllIdsInSetExact(set: HCSet): string[] {
    return Array.from(this.setMap.get(set) ?? []);
  }

  /**
   * Determines whether all the cards in a CardMap satisfy the specified test.
   * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each card until the predicate returns a value which is coercible to the Boolean value false, or until the end of the CardMap.
   */
  every(predicate: (card: HCCard.Any) => unknown): boolean;
  every(predicate: (card: HCCard.Any, id: string) => unknown): boolean;
  every(predicate: (card: HCCard.Any, id: string, set: HCSet) => unknown): boolean;
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
   * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each card until the predicate returns a value which is coercible to the Boolean value true, or until the end of the CardMap.
   */
  some(predicate: (card: HCCard.Any) => unknown): boolean;
  some(predicate: (card: HCCard.Any, id: string) => unknown): boolean;
  some(predicate: (card: HCCard.Any, id: string, set: HCSet) => unknown): boolean;
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
   * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each card.
   */
  forEach(callbackfn: (card: HCCard.Any) => void): void;
  forEach(callbackfn: (card: HCCard.Any, id: string) => void): void;
  forEach(callbackfn: (card: HCCard.Any, id: string, set: HCSet) => void): void;
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
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each card.
   */
  mapToArray<T>(callbackfn: (card: HCCard.Any) => T): T[];
  mapToArray<T>(callbackfn: (card: HCCard.Any, id: string) => T): T[];
  mapToArray<T>(callbackfn: (card: HCCard.Any, id: string, set: HCSet) => T): T[];
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
   * Calls a defined callback function on each card, and returns a new CardMap.
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each card.
   */
  map(callbackfn: (card: HCCard.Any) => HCCard.Any): this;
  map(callbackfn: (card: HCCard.Any, id: string) => HCCard.Any): this;
  map(callbackfn: (card: HCCard.Any, id: string, set: HCSet) => HCCard.Any): this;
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
   * @param callback A function that accepts up to three arguments. The flatMap method calls the callbackfn function one time for each card.
   */
  flatMap<T>(callback: (card: HCCard.Any) => T | ReadonlyArray<T>): T[];
  flatMap<T>(callback: (card: HCCard.Any, id: string) => T | ReadonlyArray<T>): T[];
  flatMap<T>(callback: (card: HCCard.Any, id: string, set: HCSet) => T | ReadonlyArray<T>): T[];
  flatMap<T>(callback: (...args: any[]) => T | ReadonlyArray<T>): T[] {
    return this.mapToArray(callback).flat() as T[];
  }

  /**
   * Returns the first card that meets the condition specified in a callback function.
   * @param predicate A function that accepts up to three arguments. The find method calls the predicate function one time for each card until it finds one where the predicate returns true. If such an element is found, find immediately returns that card. Otherwise, find returns undefined.
   * @note If you're only checking the id, just use get instead, since that'll be much faster
   */
  find(predicate: (card: HCCard.Any) => any): HCCard.Any | undefined;
  find(predicate: (card: HCCard.Any, id: string) => any): HCCard.Any | undefined;
  find(predicate: (card: HCCard.Any, id: string, set: HCSet) => any): HCCard.Any | undefined;
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
   * @param set The set to find against.
   * @param predicate A function that accepts up to two arguments. The find method calls the predicate function one time for each card in the set until returning true.
   */
  findFromSet(set: HCSet, predicate: (card: HCCard.Any) => any): HCCard.Any | undefined;
  findFromSet(set: HCSet, predicate: (card: HCCard.Any, id: string) => any): HCCard.Any | undefined;
  findFromSet(set: HCSet, predicate: (...args: any[]) => any): HCCard.Any | undefined {
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
   * @param set The set to find against exactly.
   * @param predicate A function that accepts up to two arguments. The find method calls the predicate function one time for each card in the set until returning true.
   */
  findFromSetExact(set: HCSet, predicate: (card: HCCard.Any) => any): HCCard.Any | undefined;
  findFromSetExact(
    set: HCSet,
    predicate: (card: HCCard.Any, id: string) => any
  ): HCCard.Any | undefined;
  findFromSetExact(set: HCSet, predicate: (...args: any[]) => any): HCCard.Any | undefined {
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
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each card.
   * @note If you're only checking the ids or sets, just use getSubset or getAllInSet instead, since that'll be much faster
   */
  filter(predicate: (card: HCCard.Any) => any): this;
  filter(predicate: (card: HCCard.Any, id: string) => any): this;
  filter(predicate: (card: HCCard.Any, id: string, set: HCSet) => any): this;
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
   * Returns the cards in a set that meet the condition specified in a callback function.
   * @param set The set to filter against.
   * @param predicate A function that accepts up to two arguments. The filter method calls the predicate function one time for each card in the set.
   */
  filterFromSet(set: HCSet, predicate: (card: HCCard.Any) => any): this;
  filterFromSet(set: HCSet, predicate: (card: HCCard.Any, id: string) => any): this;
  filterFromSet(set: HCSet, predicate: (...args: any[]) => any): this {
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
   * @param set The set to filter against exactly.
   * @param predicate A function that accepts up to two arguments. The filter method calls the predicate function one time for each card in the set.
   */
  filterFromSetExact(set: HCSet, predicate: (card: HCCard.Any) => any): this;
  filterFromSetExact(set: HCSet, predicate: (card: HCCard.Any, id: string) => any): this;
  filterFromSetExact(set: HCSet, predicate: (...args: any[]) => any): this {
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
   * Calls the specified callback function for all the cards in a CardMap. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts two arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument.
   */
  reduce<U>(callbackfn: (previousValue: U, card: HCCard.Any) => U, initialValue: U): U {
    let accumulator: U = initialValue;
    for (const card of this.values()) {
      accumulator = callbackfn(accumulator, card);
    }
    return accumulator;
  }

  /**
   * @returns boolean indicating whether a card with the specified id exists or not, and possibly whether it is in the specified set or not.
   */
  has(id: string): boolean;
  has(id: string, set: HCSet): boolean;
  has(id: string, set?: HCSet): boolean {
    if (set) {
      return Boolean(
        this.setMap.get(set)?.has(id) ||
          toSubSets[set]?.some(subSet => this.setMap.get(subSet)?.has(id))
      );
    }
    return this.idMap.has(id);
  }

  /**
   * @returns boolean indicating whether a card with the specified id exists or not in the specified exact set.
   */
  hasExact(id: string, set: HCSet): boolean {
    return Boolean(this.setMap.get(set)?.has(id));
  }

  /**
   * @returns boolean indicating whether the specified set exists or not.
   */
  hasSet(set: HCSet): boolean {
    return Boolean(
      this.setMap.get(set)?.size || toSubSets[set]?.some(subSet => this.setMap.get(subSet)?.size)
    );
  }
  /**
   * @returns boolean indicating whether the specified exact set exists or not.
   */
  hasSetExact(set: HCSet): boolean {
    return Boolean(this.setMap.get(set)?.size);
  }

  /**
   * Removes all elements from the CardMap.
   */
  clear(): void {
    this.idMap.clear();
    this.setMap.clear();
  }
  isEmpty(): boolean {
    return this.idMap.size === 0;
  }
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
   * Returns an array of the cards in the CardMap. This is identical to `Array.from(CardMap.values())`.
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
   * @returns the number of cards in the CardMap.
   */
  size(): number {
    return this.idMap.size;
  }
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
  get(id: string): HCCard.Any | undefined {
    return this.idMap.get(id.toLowerCase());
  }
  /**
   * Adds a new card to the CardMap. If a card with the same id already exists, the card will be updated.
   */
  set(card: HCCard.Any): void {
    this.idMap.set(card.hcid.toLowerCase(), card);
    if (!this.setMap.has(card.set)) {
      this.setMap.set(card.set, new Set());
    }
    this.setMap.get(card.set)!.add(card.hcid.toLowerCase());
  }
  /**
   * @returns true if an element in the CardMap existed and has been removed, or false if the element does not exist.
   */
  delete(id: string): boolean {
    const value = this.idMap.get(id.toLowerCase());
    if (!value) return false;
    const set = this.setMap.get(value.set);
    set?.delete(id.toLowerCase());
    if (set?.size == 0) {
      this.setMap.delete(value.set);
    }
    this.idMap.delete(id.toLowerCase());
    return true;
  }
  /**
   * @returns boolean indicating whether a card with the specified id exists or not, and possibly whether it is in the specified set or not.
   */
  has(id: string): boolean;
  has(id: string, set: HCSet): boolean;
  has(id: string, set?: HCSet): boolean {
    if (set) {
      return Boolean(
        this.setMap.get(set)?.has(id.toLowerCase()) ||
          toSubSets[set]?.some(subSet => this.setMap.get(subSet)?.has(id.toLowerCase()))
      );
    }
    return this.idMap.has(id.toLowerCase());
  }

  /**
   * @returns boolean indicating whether a card with the specified id exists or not in the specified exact set.
   */
  hasExact(id: string, set: HCSet): boolean {
    return Boolean(this.setMap.get(set)?.has(id.toLowerCase()));
  }
}
