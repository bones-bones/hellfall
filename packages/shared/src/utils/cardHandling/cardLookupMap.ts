import { HCCard, isSetCode, SetCode } from '@hellfall/shared/types';
import { getCollectorNumSets, getGroupSets } from '../setHandling';
import { fixName, normalizeText, splitMasterpiece } from '../textHandling';
import { getAllNames } from './nameHandling';
import { deleteFromMap, pushToMap } from '../listHandling';

const stripParens = (text: string) =>
  text.startsWith('(') && text.endsWith(')') ? text.slice(1, -1) : text;

// TODO: use this as a submap in CardMap
/**
 * Splits a name of a card from input into the card's name, set (if any), and collector num (if any)
 * @param text text to split
 */
const splitCardName = (text:string): {name:string, code?:SetCode, collector_number?:string} => {
  const {name, code} = splitMasterpiece(text)
  if (code) {
    return {name, code};
  }
  const splitText = text.split(' ');
  if (splitText.length > 2 && isSetCode(stripParens(splitText.at(-2)!))) {
    return {name:splitText.slice(0,-2).join(''), code:stripParens(splitText.at(-2)!).toUpperCase() as SetCode, collector_number:splitText.at(-1)?.toLowerCase()}
  }
  if (splitText.length > 1 && isSetCode(stripParens(splitText.at(-1)!))) {
    return {name:splitText.slice(0,-1).join(''), code:stripParens(splitText.at(-1)!).toUpperCase() as SetCode}
  }
  return {name: text}

}

/**
 * Maps a card's names to the ids that it should use. Only for use in CardMap.
 */
class CardLookupObject {
  /**
   * Maps a set to the collector numbers that the card has prints in
   */
  protected setNumMap = new Map<SetCode, Map<string,string>>();
  /**
   * Maps a set to the ids that are in that set
   */
  protected setMap = new Map<SetCode,Set<string>>();
  protected defaultId:string;
  /**
   * Creates a new CardLookupObject
   * @param card The initial card to use
   */
  constructor(card:HCCard.Any) {
    this.defaultId = card.id;
    this.set(card);
  }

  /**
   * Returns the correct id for a set code and a collector number
   * @param 
   */
  get = (code?: SetCode, collector_number?:string):string|undefined => {
    if (!code) {
      return this.defaultId;
    }
    if (!collector_number) {
      const numIds = this.setNumMap.get(code)?.values();
      if (numIds) {
        const id = Array.from(numIds)[0]
        if (id) return id;
      }
      const ids = this.setMap.get(code)
      if (ids?.size) {
        return Array.from(ids.values())[0];
      }
      return this.defaultId
    }
    const numMap = this.setNumMap.get(code);
    if (numMap) {
      const id = numMap.get(collector_number)
      if (id) return id;
      const fallback = Array.from(numMap.values())[0]
      if (fallback) return fallback;
    }
    const ids = this.setMap.get(code)
    if (ids?.size) {
      return Array.from(ids.values())[0];
    }
    return this.defaultId
  }

  /**
   * Adds a new card to the CardLookupObject.
   * @param card {@linkcode HCCard.Any} to set
   */
  set = (card: HCCard.Any) => {
    getCollectorNumSets(card.set).forEach(code => {
      const oldMap = this.setNumMap.get(code);
      if (oldMap) {
        oldMap.set(card.collector_number.toLowerCase(),card.id);
      } else {
        const map = new Map<string,string>();
        map.set(card.collector_number.toLowerCase(),card.id);
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
    })
  };
  /**
   * @param id the id to delete
   * @returns true if the last version of this card has been deleted
   */
  delete = (id:string) => {
    this.setMap.forEach((set, code) => {
      if (set.has(id)) {
        set.delete(id);
      }
      if (!set.size) {
        this.setMap.delete(code);
      }
    })
    if (!this.setMap.size) {
      return true;
    }
    if (this.defaultId == id) {
      this.defaultId = Array.from(Array.from(this.setMap.values())[0])[0]
    }
    this.setNumMap.forEach((map, code) => {
      map.forEach((num_id, num) => {
        if (num_id == id) {
          map.delete(num);
        }
      })
      if (!map.size) {
        this.setNumMap.delete(code);
      }
    })
    return false;
  }
  
}

/**
 * A version of a `Map<string,string>()` that alows direct deletion of values.
 */
class DoubleMap {
  protected forwardMap = new Map<string,string>();
  protected reverseMap = new Map<string, Set<string>>();
  /**
   * Gets the specified value.
   * @param key key of the value to get
   */
  get = (key:string) => this.forwardMap.get(key);

  /**
   * Gets the specified keys.
   * @param value value of the keys to get
   */
  getKeys = (value:string) => this.reverseMap.get(value);

  /**
   * Adds a new element with a specified key and value to the Map.
   * If an element with the same key already exists, the element will be updated.
   * @param key key to set
   * @param value value to set
   */
  set = (key:string, value:string) => {
    this.forwardMap.set(key,value);
    pushToMap(this.reverseMap,value,key);
  }

  /**
   * @param key the key to delete
   * @returns true if the value was deleted
   */
  delete = (key:string) => {
    const value = this.forwardMap.get(key)
    if (!value) return false;
    deleteFromMap(this.reverseMap,value,key)
    this.forwardMap.delete(key)
    return true;
  };
  /**
   * @param value the value to delete
   * @returns true if the keys were deleted
   */
  deleteKeys = (value:string) => {
    const keys = this.reverseMap.get(value)
    if (!keys) return false;
    keys.forEach(key => this.forwardMap.delete(key))
    this.reverseMap.delete(value);
  };
  /**
   * Checks if the specified value exists.
   * @param key key of the value to check
   */
  has = (key:string) => this.forwardMap.has(key);

  /**
   * Checks if the specified keys exist.
   * @param value value of the keys to check
   */
  hasKeys = (value:string) => this.reverseMap.has(value);

  /**
   * Removes all elements from the DoubleMap.
   */
  clear = () => {
    this.forwardMap.clear();
    this.reverseMap.clear();
  };
}

export class CardLookupMap {
  /**
   * This maps a name to its individual maps
   */
  protected nameMap = new Map<string,CardLookupObject>();

  /**
   * This maps an alias to the name that it is associated with
   */
  protected aliasMap = new DoubleMap;

  /**
   * This maps a name to the preferred id to use
   */
  protected preferredMap = new DoubleMap();
  /**
   * Returns the correct id for a card name.
   * Can handle masterpiece prefixes, set suffixes, and collector numbers.
   * @param text the name of the card to get
   */
  get = (text: string) => {
    const {name, code, collector_number} = splitCardName(fixName(text));
    if (!code && this.preferredMap.has(name)) {
      return this.preferredMap.get(name)
    } 
    const lookup = this.nameMap.get(name) ?? this.nameMap.get(this.aliasMap.get(name) ?? '');
    if (!lookup) return;
    return lookup.get(code,collector_number);
  };

  /**
   * Adds a new card to the CardLookupMap.
   * @param card {@linkcode HCCard.Any} to set
   */
  set = (card: HCCard.Any) => {
    const name = fixName(card.name)
    const existing = this.nameMap.get(name)
    if (card.hcid != '3' && card.hcid != '1984') {
      const fixed = fixName(card.hcid)
      this.preferredMap.set(fixed, card.id)
    }
    if (existing) {
      existing.set(card)
    } else {
      this.nameMap.set(name, new CardLookupObject(card));
      if (this.aliasMap.has(name)) {
        this.aliasMap.delete(name);
      }
      if (this.preferredMap.has(name)) {
        this.preferredMap.delete(name);
      }
    }
    const names = getAllNames(card).filter(n => !this.nameMap.has(n) && !this.aliasMap.has(n) && !this.preferredMap.has(n));
    names.forEach(n => {
      if (!existing) {
        this.preferredMap.set(n,card.id);
      } else {
        if (this.preferredMap.has(n)) {
          this.preferredMap.delete(n)
        }
      }
      this.aliasMap.set(n,name);
    })
  }
  /**
   * @param card the card to delete
   * @returns true if the last version of this card has been deleted
   */
  delete = (card: HCCard.Any) => {
    const fixed = fixName(card.name)
    const lookup = this.nameMap.get(fixed)
    if (!lookup) return false;
    this.preferredMap.deleteKeys(card.id);
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
    const {name, code, collector_number} = splitCardName(fixName(text));
    return this.nameMap.has(name) || this.aliasMap.has(name);
  };
  /**
   * Removes all elements from the CardLookupMap.
   */
  clear = () => {
    this.nameMap.clear();
    this.aliasMap.clear();
    this.preferredMap.clear();
  };
}