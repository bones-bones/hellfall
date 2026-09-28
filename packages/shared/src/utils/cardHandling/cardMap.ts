import { HCCard, HCRelatedCard, SetCode } from '@hellfall/shared/types';
import { splitCardName } from '../setDateHandling';
// import { CardLookupMap, lookupCache, lookupMapCache } from './cardLookupMap';
import { fixName } from '../textHandling';
import { isInteger } from '../numHandling';
import { pushToMap, stringIterable } from '../listHandling';
import { getPreference, shouldSwap } from './preferenceHandling';
import {
  addCardToLookup,
  CardLookupObject,
  DoubleMap,
  LookupCacheObject,
  lookupCacheToJSON,
} from './cardLookupUtils';
import { LightCardMap } from './lightCardMap';
import { getAllNames, getClosestName } from './nameHandling';
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
 * A cache only containing cards.
 */
type cardCache = {
  data: HCCard.Any[];
};

/**
 * A full cache with everything needed to build a {@linkcode CardMap}
 */
type fullCache = {
  nameMap: Record<string, lookupCache>;
  idMap: Record<string, HCCard.Any>;
  aliasMap: Record<string, string>;
  hcidMap: Record<string, string>;
  oracleMap: Record<string, string[]>;
};

/**
 * A cache for a {@linkcode CardLookupObject}
 */
type lookupCache = {
  setNumMap: Record<SetCode, Record<string, string>>;
  setMap: Record<SetCode, string[]>;
  defaultId: string;
};

/**
 * The class for a map of cards.
 */
export class CardMap extends LightCardMap {
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
  // /**
  //  * Maps names to the card ids they are associated with
  //  */
  // protected lookupMap = new CardLookupMap();
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
   * @param cards The initial {@linkcode cardCache} to set, if any
   */
  constructor(cards: cardCache);
  /**
   * Creates a new CardMap
   * @param cards The initial {@linkcode fullCache} to set, if any
   */
  constructor(cards: fullCache);
  constructor(cards?: HCCard.Any[] | cardCache | fullCache) {
    super();
    if (!cards) return;
    const cardsToSet = Array.isArray(cards) ? cards : 'data' in cards ? cards.data : undefined;
    if (cardsToSet) {
      cardsToSet.forEach(this.set);
      return;
    }
    if (!('idMap' in cards)) return;
    for (const [id, card] of Object.entries(cards.idMap)) {
      this.idMap.set(id, card);
      pushToMap(this.setMap, card.set, id);
    }
    for (const [oracle_id, ids] of Object.entries(cards.oracleMap)) {
      this.oracleMap.set(oracle_id, new Set(ids));
    }
    for (const [name, card] of Object.entries(cards.nameMap)) {
      this.nameMap.set(name, new CardLookupObject(card));
    }
    this.aliasMap = new DoubleMap(cards.aliasMap);
    this.hcidMap = new DoubleMap(cards.hcidMap);
  }

  /**
   * Returns the correct id for a name, a set code, and a collector number
   * @param name the name of the card to get
   * @param code the set code to use, if any
   * @param collector_number the collector number to use, if any
   * @param noDefault whether to return undefined if the set isn't specified (used for random land handling)
   */
  getIDFromNameSetAndNumber = (
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
   * Returns a specified card from the CardMap object.
   * Any change made to that card will effectively modify it inside the CardMap.
   * If no card has the specified name, undefined is returned
   * @param name the name of the card to get
   * @param code the set code to use, if any
   * @param collector_number the collector number to use, if any
   */
  getFromNameSetAndNumber = (name: string, code?: SetCode, collector_number?: string) =>
    this.idMap.get(
      this.getIDFromNameSetAndNumber(
        fixName(name),
        code,
        collector_number && fixName(collector_number)
      ) ?? fixName(name)
    );

  /**
   * Returns the correct id for a card name.
   * Can handle masterpiece prefixes, set suffixes, and collector numbers.
   * @param text the name of the card to get
   */
  getIDFromName = (text: string) => {
    const { name, code, collector_number } = splitCardName(fixName(text));
    return this.getIDFromNameSetAndNumber(name, code, collector_number);
  };

  /**
   * Returns a specified card from the CardMap object.
   * Any change made to that card will effectively modify it inside the CardMap.
   * If no card has the specified name, undefined is returned
   * @param name the name of the card to get
   */
  getFromName = (name: string) => this.idMap.get(this.getIDFromName(name) ?? name);

  /**
   * Returns a specified oracle id from the CardMap object.
   * @param name the name of the card to get
   */
  getOracleIDFromName = (name: string) => this.getFromName(name)?.oracle_id;

  /**
   * Returns the correct id for a card name, going with the best possible match if nothing is an exact match.
   * @param text the name of the card to get
   */
  getIDFromFuzzyName = (text: string) => {
    const fixed = fixName(text);
    const { name, code, collector_number } = splitCardName(fixed);
    const exact = this.getIDFromNameSetAndNumber(name, code, collector_number);
    if (exact) return exact;
    const closest = getClosestName(this.names(), fixed);
    return this.getIDFromNameSetAndNumber(closest, code, collector_number);
  };

  /**
   * Returns a specified card from the CardMap object.
   * Any change made to that card will effectively modify it inside the CardMap.
   * If no card has the specified name, undefined is returned
   * @param name the fuzzy name of the card to get
   */
  getFromFuzzyName = (name: string) => this.idMap.get(this.getIDFromFuzzyName(name) ?? name);

  /**
   * Returns the correct id for a card hcid.
   * @param hcid the hcid of the card to get
   */
  getIDFromHCID = (hcid: string) => this.hcidMap.get(fixName(hcid));

  /**
   * Returns a specified card from the CardMap object.
   * Any change made to that card will effectively modify it inside the CardMap.
   * If no card has the specified hcid, undefined is returned
   * @param hcid the hcid of the card to get
   */
  getFromHCID = (hcid: string) => this.idMap.get(this.getIDFromHCID(hcid) ?? '');

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
    const startsWithNumber = isInteger(first) && count > 0 && first.length != fixed.length;
    if (startsWithNumber) {
      const card = this.getForDeck(fixed.slice(first.length + 1))?.card;
      if (card) {
        return { card, count };
      }
    }
    const { name, code, collector_number } = splitCardName(fixed);
    const isLand = isLandName(name);
    const id = this.getIDFromNameSetAndNumber(name, code, collector_number, isLand);
    if (id) {
      const card = this.get(id)!;
      return { card };
    } else if (isLand) {
      return { card: this.getRandomCard(landIdMap.get(name)) };
    }
    if (startsWithNumber && count < 200) {
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
      const card = this.get(this.getIDFromName(name) ?? name);
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
      const card = this.get(this.getIDFromName(name) ?? name);
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
    pushToMap(this.setMap, card.set, card.id);
    addCardToLookup(
      card,
      this.toLookupCacheObject(),
      (card: HCCard.Any, lookup: CardLookupObject) => shouldSwap(card, this.get(lookup.defaultId))
    );
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
    this.hcidMap.deleteKeys(id);
    const fixed = fixName(value.name);
    if (this.nameMap.get(fixed)?.delete(id)) {
      this.nameMap.delete(fixed);
      this.aliasMap.deleteKeys(fixed);
      return true;
    }
    this.idMap.delete(id);
    return true;
  };

  /**
   * Checks if a card with the specified hcid exists
   * @param hcid the hcid to check for
   */
  hasHCID = (hcid: string) => this.hcidMap.has(fixName(hcid));

  /**
   * Checks if a card with the specified name exists.
   * Can handle masterpiece prefixes, set suffixes, and collector numbers.
   * @param text the name of the card to check
   */
  hasName = (text: string) => {
    const { name } = splitCardName(fixName(text));
    if (!name) return false;
    return this.nameMap.has(name) || this.aliasMap.has(name);
  };

  /**
   * Removes all elements from the CardMap.
   */
  clear = () => {
    this.idMap.clear();
    this.setMap.clear();
    this.oracleMap.clear();
    this.nameMap.clear();
    this.aliasMap.clear();
    this.hcidMap.clear();
  };

  /**
   * Resets the default ids. Use this before setting `has_default_id` props on cards.
   */
  resetDefaultIds = () => {
    for (const [name, lookup] of this.nameMap) {
      lookup.defaultId = getPreference(this.getMultiple(lookup.getAllIds())).id;
    }
  };

  /**
   * Rebuilds `has_default_id` props on cards.
   */
  rebuildDefaultIdProps = () => {
    for (const lookup of this.nameMap.values()) {
      for (const id of lookup.getAllIds()) {
        const card = this.get(id);
        if (!card) {
          continue;
        }
        if (id == lookup.defaultId) {
          card.has_default_id = true;
        } else {
          delete card.has_default_id;
        }
      }
    }
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

  *lookups(): IterableIterator<CardLookupObject> {
    for (const lookup of this.nameMap.values()) {
      yield lookup;
    }
  }

  protected toLookupCacheObject(): LookupCacheObject {
    return {
      oracleMap: this.oracleMap,
      nameMap: this.nameMap,
      hcidMap: this.hcidMap,
      aliasMap: this.aliasMap,
    };
  }
  /**
   * Returns a full cache from this `cardMap` for database lookups.
   */
  toJSON() {
    const idMap: Record<string, HCCard.Any> = {};
    for (const [id, card] of this.idMap) {
      idMap[id] = card;
    }
    const { oracleMap, nameMap, aliasMap, hcidMap } = lookupCacheToJSON(this.toLookupCacheObject());
    return { idMap, oracleMap, nameMap, aliasMap, hcidMap };
  }
}
