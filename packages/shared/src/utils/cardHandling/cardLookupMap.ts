import { HCCard, isSetCode, SetCode } from '@hellfall/shared/types';
import { getCollectorNumSets, getGroupSets, splitCardName } from '../setHandling';
import { fixName } from '../textHandling';
import { getAllNames, getClosestName } from './nameHandling';
import { deleteFromMap, pushToMap } from '../listHandling';
import { isInteger } from '../numHandling';

/**
 * A cache for a {@linkcode CardLookupObject}
 */
export type lookupCache = {
  setNumMap: Record<SetCode, Record<string, string>>;
  setMap: Record<SetCode, string[]>;
  defaultId: string;
};

/**
 * Maps a card's names to the ids that it should use. Only for use in CardMap.
 *
 * We won't worry about oracle ids here. That can get caught by specifying the set/number
 */
export class CardLookupObject {
  /**
   * Maps a set to the collector numbers that the card has prints in, which map to ids
   */
  setNumMap = new Map<SetCode, Map<string, string>>();
  /**
   * Maps a set to the ids that are in that set
   */
  setMap = new Map<SetCode, Set<string>>();
  defaultId: string;
  /**
   * Creates a new CardLookupObject
   * @param card The initial card to use
   */
  constructor(card: HCCard.Any);
  /**
   * Creates a new CardLookupObject
   * @param card The {@linkcode lookupCache} to use
   */
  constructor(card: lookupCache);
  constructor(card: HCCard.Any | lookupCache) {
    if ('object' in card) {
      this.defaultId = card.id;
      this.set(card);
      return;
    }
    this.defaultId = card.defaultId;
    for (const [set, ids] of Object.entries(card.setMap)) {
      if (isSetCode(set)) {
        this.setMap.set(set, new Set(ids));
      }
    }
    for (const [set, numIds] of Object.entries(card.setNumMap)) {
      if (isSetCode(set)) {
        this.setNumMap.set(set, new Map<string, string>(Object.entries(numIds)));
      }
    }
  }

  /**
   * Returns the correct id for a set code and a collector number
   * @param code the set code to use
   * @param collector_number the collector number to use, if any
   * @param noDefault whether to return undefined if the set isn't specified (used for random land handling)
   */
  get(code?: SetCode, collector_number?: string, noDefault?: boolean): string | undefined {
    const defaultId = noDefault ? undefined : this.defaultId;
    if (!code) {
      return defaultId;
    }
    if (!collector_number) {
      const ids = this.setMap.get(code);
      if (ids?.size) {
        return Array.from(ids.values())[0];
      }
      const numIds = this.setNumMap.get(code)?.values();
      if (numIds) {
        const id = Array.from(numIds)[0];
        if (id) return id;
      }
      return defaultId;
    }
    const numMap = this.setNumMap.get(code);
    if (numMap) {
      const id = numMap.get(collector_number);
      if (id) return id;
      const fallback = Array.from(numMap.values())[0];
      if (fallback) return fallback;
    }
    const ids = this.setMap.get(code);
    if (ids?.size) {
      return Array.from(ids.values())[0];
    }
    return defaultId;
  }

  /**
   * Adds a new card to the CardLookupObject.
   * @param card {@linkcode HCCard.Any} to set
   */
  set(card: HCCard.Any) {
    getCollectorNumSets(card.set).forEach(code => {
      const oldMap = this.setNumMap.get(code);
      if (oldMap) {
        oldMap.set(card.collector_number.toLowerCase(), card.id);
      } else {
        const map = new Map<string, string>();
        map.set(card.collector_number.toLowerCase(), card.id);
        this.setNumMap.set(code, map);
      }
    });
    getGroupSets(card.set).forEach(code => {
      const oldSet = this.setMap.get(code);
      if (oldSet) {
        oldSet.add(card.id);
      } else {
        const set = new Set<string>();
        set.add(card.id);
        this.setMap.set(code, set);
      }
    });
  }
  /**
   * @param id the id to delete
   * @returns true if the last version of this card has been deleted
   */
  delete(id: string) {
    this.setMap.forEach((set, code) => {
      if (set.has(id)) {
        set.delete(id);
      }
      if (!set.size) {
        this.setMap.delete(code);
      }
    });
    if (!this.setMap.size) {
      return true;
    }
    if (this.defaultId == id) {
      this.defaultId = Array.from(Array.from(this.setMap.values())[0])[0];
    }
    this.setNumMap.forEach((map, code) => {
      map.forEach((num_id, num) => {
        if (num_id == id) {
          map.delete(num);
        }
      });
      if (!map.size) {
        this.setNumMap.delete(code);
      }
    });
    return false;
  }
  toJSON() {
    const setNumMap: Record<string, Record<string, string>> = {};
    for (const [set, map] of this.setNumMap) {
      const numIDMap: Record<string, string> = {};
      for (const [num, id] of map) {
        numIDMap[num] = id;
      }
      setNumMap[set] = numIDMap;
    }
    const setMap: Record<string, string[]> = {};
    for (const [set, ids] of this.setMap) {
      setMap[set] = Array.from(ids);
    }
    const defaultId = this.defaultId;
    return { setNumMap, setMap, defaultId };
  }
}

/**
 * A version of a `Map<string,string>()` that alows direct deletion of and access to values.
 */
class DoubleMap {
  protected forwardMap = new Map<string, string>();
  protected reverseMap = new Map<string, Set<string>>();

  /**
   * Creates a new DoubleMap
   * @param initRecord the initial record to use, if any
   */
  constructor(initRecord?: Record<string, string>) {
    if (!initRecord) return;
    this.forwardMap = new Map(Object.entries(initRecord));
    for (const [key, value] of this.forwardMap) {
      pushToMap(this.reverseMap, value, key);
    }
  }

  /**
   * Gets the specified value.
   * @param key key of the value to get
   */
  get = (key: string) => this.forwardMap.get(key);

  /**
   * Gets the specified keys.
   * @param value value of the keys to get
   */
  getKeys = (value: string) => this.reverseMap.get(value);

  /**
   * Adds a new element with a specified key and value to the Map.
   * If an element with the same key already exists, the element will be updated.
   * @param key key to set
   * @param value value to set
   */
  set = (key: string, value: string) => {
    this.forwardMap.set(key, value);
    pushToMap(this.reverseMap, value, key);
  };

  /**
   * @param key the key to delete
   * @returns true if the value was deleted
   */
  delete = (key: string) => {
    const value = this.forwardMap.get(key);
    if (!value) return false;
    deleteFromMap(this.reverseMap, value, key);
    this.forwardMap.delete(key);
    return true;
  };
  /**
   * @param value the value to delete
   * @returns true if the keys were deleted
   */
  deleteKeys = (value: string) => {
    const keys = this.reverseMap.get(value);
    if (!keys) return false;
    keys.forEach(key => this.forwardMap.delete(key));
    this.reverseMap.delete(value);
  };
  /**
   * Checks if the specified value exists.
   * @param key key of the value to check
   */
  has = (key: string) => this.forwardMap.has(key);

  /**
   * Checks if the specified keys exist.
   * @param value value of the keys to check
   */
  hasKeys = (value: string) => this.reverseMap.has(value);

  /**
   * Removes all elements from the DoubleMap.
   */
  clear = () => {
    this.forwardMap.clear();
    this.reverseMap.clear();
  };
  *keys(): IterableIterator<string> {
    for (const key of this.forwardMap.keys()) {
      yield key;
    }
  }
  *[Symbol.iterator](): Iterator<[string, string]> {
    for (const [key, value] of this.forwardMap.entries()) {
      yield [key, value];
    }
  }
}

/**
 * A cache for a {@linkcode CardLookupMap}
 */
export type lookupMapCache = {
  nameMap: Record<string, lookupCache>;
  aliasMap: Record<string, string>;
  hcidMap: Record<string, string>;
};

/**
 * Maps a card's names to the ids that it should use. Only for use in CardMap.
 */
export class CardLookupMap {
  /**
   * This maps a name to its individual maps
   */
  protected nameMap = new Map<string, CardLookupObject>();

  /**
   * This maps an alias to the name that it is associated with
   */
  protected aliasMap = new DoubleMap();

  /**
   * This maps a hcid to the preferred id to use
   */
  protected hcidMap = new DoubleMap();

  /**
   * Creates a new CardLookupMap
   * @param cache the {@linkcode lookupMapCache} to use, if any
   */
  constructor(cache?: lookupMapCache) {
    if (!cache) return;
    for (const [name, card] of Object.entries(cache.nameMap)) {
      this.nameMap.set(name, new CardLookupObject(card));
    }
    this.aliasMap = new DoubleMap(cache.aliasMap);
    this.hcidMap = new DoubleMap(cache.hcidMap);
  }

  /**
   * Returns the correct id for a name, a set code, and a collector number
   * @param name the name of the card to get
   * @param code the set code to use, if any
   * @param collector_number the collector number to use, if any
   * @param noDefault whether to return undefined if the set isn't specified (used for random land handling)
   */
  getBySetAndNumber = (
    name: string,
    code?: SetCode,
    collector_number?: string,
    noDefault?: boolean
  ) => {
    if (!name) return;
    if (!code && this.hcidMap.has(name) && name != '3' && name != '1984') {
      return this.hcidMap.get(name);
    }
    const lookup = this.nameMap.get(name) ?? this.nameMap.get(this.aliasMap.get(name) ?? '');
    if (!lookup) return;
    return lookup.get(code, collector_number, noDefault);
  };

  /**
   * Returns the correct id for a card name.
   * Can handle masterpiece prefixes, set suffixes, and collector numbers.
   * @param text the name of the card to get
   */
  get = (text: string) => {
    const { name, code, collector_number } = splitCardName(fixName(text));
    return this.getBySetAndNumber(name, code, collector_number);
  };

  /**
   * Returns the correct id for a card name, going with the best possible match if nothing is an exact match.
   * @param text the name of the card to get
   */
  getFuzzy = (text: string) => {
    const fixed = fixName(text);
    const { name, code, collector_number } = splitCardName(fixed);
    const exact = this.getBySetAndNumber(name, code, collector_number);
    if (exact) return exact;
    const closest = getClosestName(this.names(), fixed);
    return this.getBySetAndNumber(closest, code, collector_number);
  };

  /**
   * Returns the correct id for a card hcid.
   * @param hcid the hcid of the card to get
   */
  getFromHCID = (hcid: string) => this.hcidMap.get(fixName(hcid));

  /**
   * Adds a new card to the CardLookupMap.
   * @param card {@linkcode HCCard.Any} to set
   */
  set = (card: HCCard.Any) => {
    const name = fixName(card.name);
    const existing = this.nameMap.get(name);
    const fixed = fixName(card.hcid);
    this.hcidMap.set(fixed, card.id);
    if (existing) {
      existing.set(card);
    } else {
      this.nameMap.set(name, new CardLookupObject(card));
      if (this.aliasMap.has(name)) {
        this.aliasMap.delete(name);
      }
    }
    const names = getAllNames(card).filter(
      n => !this.nameMap.has(n) && !this.aliasMap.has(n) && !this.hcidMap.has(n)
    );
    names.forEach(n => this.aliasMap.set(n, name));
  };
  /**
   * @param card the card to delete
   * @returns true if the last version of this card has been deleted
   */
  delete = (card: HCCard.Any) => {
    const fixed = fixName(card.name);
    const lookup = this.nameMap.get(fixed);
    if (!lookup) return false;
    this.hcidMap.deleteKeys(card.id);
    if (lookup.delete(card.id)) {
      this.nameMap.delete(fixed);
      this.aliasMap.deleteKeys(fixed);
      return true;
    }
    return false;
  };
  /**
   * Checks if a card with the specified name exists.
   * Can handle masterpiece prefixes, set suffixes, and collector numbers.
   * @param text the name of the card to check
   */
  has = (text: string) => {
    const { name, code, collector_number } = splitCardName(fixName(text));
    if (!name) return false;
    return this.nameMap.has(name) || this.aliasMap.has(name);
  };
  /**
   * Checks if a card with the specified hcid exists.
   * @param hcid the hcid of the card to check
   */
  hasHCID = (hcid: string) => this.hcidMap.has(fixName(hcid));
  /**
   * Removes all elements from the CardLookupMap.
   */
  clear = () => {
    this.nameMap.clear();
    this.aliasMap.clear();
    this.hcidMap.clear();
  };
  *names(): IterableIterator<string> {
    for (const name of this.nameMap.keys()) {
      yield name;
    }
    for (const name of this.aliasMap.keys()) {
      yield name;
    }
    for (const name of this.hcidMap.keys()) {
      if (!isInteger(name)) {
        yield name;
      }
    }
  }
  toJSON() {
    const nameMap: Record<string, CardLookupObject> = {};
    for (const [name, lookup] of this.nameMap) {
      nameMap[name] = lookup;
    }
    const aliasMap: Record<string, string> = {};
    for (const [alias, name] of this.aliasMap) {
      aliasMap[alias] = name;
    }
    const hcidMap: Record<string, string> = {};
    for (const [hcid, id] of this.hcidMap) {
      hcidMap[hcid] = id;
    }
    return { nameMap, aliasMap, hcidMap };
  }
}
