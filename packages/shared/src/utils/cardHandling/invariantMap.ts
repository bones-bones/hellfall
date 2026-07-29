import { HCRelatedCard, rootMappedType } from '@hellfall/shared/types';
import { isValidV4UUID } from '../textHandling';
import { xor } from '../listHandling';

/**
 * A related card that can be used for a {@linkcode printInvariant} object.
 */
export type invariantRelatedCard = HCRelatedCard & {
  /**
   * The id for the default version of this card to use for the related card.
   */
  default_id: string;
};

/**
 * An object containing a card's invariant properties (i.e. those that don't change depending on the card print).
 *
 * `name` and `oracle_id` are mandatory.
 */
export type printInvariant = { name: string; oracle_id: string; parts?: invariantRelatedCard[] } & Pick<
  rootMappedType,
  'keywords' | 'rulings' | 'oracle_id_is_scryfall' | 'legalities' | 'export_name'
>;

/**
 * The input for an {@linkcode InvariantMap}.
 *
 * Must either be {@linkcode printInvariant} or of form `[name, oracle_id]`
 */
export type printInput = [string, string] | printInvariant;

/**
 * Converts {@linkcode printInput} to {@linkcode printInvariant}
 * @param input input to convert
 */
export const toPrintInvariant = (input: printInput) =>
  Array.isArray(input) ? { name: input[0], oracle_id: input[1] } : input;

/**
 * Gets the name from a {@linkcode printInput}.
 * For use when you don't want to bother with {@linkcode toPrintInvariant}.
 * @param input input to get the name from
 */
export const getNameFromInput = (input: printInput) => {
  if (Array.isArray(input)) {
    return input[0];
  }
  return input.name;
};

/**
 * Gets the oracle id from a {@linkcode printInput}.
 * For use when you don't want to bother with {@linkcode toPrintInvariant}.
 * @param input input to get the oracle id from
 */
export const getOracleIDFromInput = (input: printInput) => {
  if (Array.isArray(input)) {
    return input[1];
  }
  return input.oracle_id;
};

/**
 * The class for mapping card names and oracle IDs to invariant properties
 * (i.e. those that don't change depending on the card print).
 */
export class InvariantMap {
  /**
   * This maps a name to its oracle id
   */
  protected nameMap = new Map<string, string>();
  /**
   * This maps an oracle id to the invariant properties
   */
  protected oracleIDMap = new Map<string, printInvariant>();

  /**
   * Adds a new input to the OracleIDMap.
   *
   * If either name or oracle id are already in, this will overwrite them.
   *
   * Will silently fail if the oracle id is invalid.
   * @param input {@linkcode printInput} to set
   */
  set = (input: [string, string] | printInvariant) => {
    const invariant = toPrintInvariant(input);
    if (!isValidV4UUID(invariant.oracle_id)) return;
    const oldName = this.oracleIDMap.get(invariant.oracle_id)?.name;
    const oldOracleID = this.nameMap.get(invariant.name.toLowerCase());
    if (oldName && oldName.toLowerCase() != invariant.name.toLowerCase()) {
      this.nameMap.delete(oldName);
    }
    if (oldOracleID && oldOracleID != invariant.oracle_id) {
      this.oracleIDMap.delete(oldOracleID);
    }
    this.nameMap.set(invariant.name.toLowerCase(), invariant.oracle_id);
    this.oracleIDMap.set(invariant.oracle_id, invariant);
  };

  /**
   * Adds multiple new {@linkcode printInput} objects to the OracleIDMap, skipping invalid oracle ids
   * @param inputs the inputs to add
   */
  setMultiple(inputs: printInput[]): void;
  setMultiple(inputs: this): void;
  setMultiple(inputs: printInput[] | this): void {
    inputs.forEach(this.set);
  }

  /**
   * @param input the input to delete (only deletes exact matches)
   * @returns true if an element in the OracleIDMap existed and has been removed,
   * or false if the element does not exist.
   */
  delete = (input: printInput) => {
    if (this.has(input)) {
      this.nameMap.delete(getNameFromInput(input).toLowerCase());
      this.oracleIDMap.delete(getOracleIDFromInput(input));
      return true;
    }
    return false;
  };

  /**
   * @param input the input to delete (only deletes overlaps, not exact matches)
   * @returns true if an element in the OracleIDMap existed and has been removed,
   * or false if the element does not exist.
   */
  deleteOverlap = (input: printInput) => {
    if (this.hasOverlap(input)) {
      const name = getNameFromInput(input);
      const oracle_id = getOracleIDFromInput(input);
      if (this.nameMap.has(name)) {
        this.oracleIDMap.delete(this.nameMap.get(name)!);
        this.nameMap.delete(name);
      }
      if (this.oracleIDMap.has(oracle_id)) {
        this.nameMap.delete(this.oracleIDMap.get(oracle_id)!.name);
        this.oracleIDMap.delete(oracle_id);
      }
      return true;
    }
    return false;
  };

  /**
   * @param name the name to delete
   * @returns true if an element in the OracleIDMap existed and has been removed,
   * or false if the element does not exist.
   */
  deleteName = (name: string) => {
    if (this.nameMap.has(name.toLowerCase())) {
      this.oracleIDMap.delete(this.nameMap.get(name.toLowerCase())!);
    }
    return this.nameMap.delete(name.toLowerCase());
  };

  /**
   * @param oracle_id the oracle id to delete
   * @returns true if an element in the OracleIDMap existed and has been removed,
   * or false if the element does not exist.
   */
  deleteOracleID = (oracle_id: string) => {
    if (this.oracleIDMap.has(oracle_id)) {
      this.nameMap.delete(this.oracleIDMap.get(oracle_id)!.name.toLowerCase());
    }
    return this.oracleIDMap.delete(oracle_id);
  };

  /**
   * Deletes multiple invariants from the OracleIDMap.
   * @param inputs the inputs to delete
   */
  deleteMultiple = (inputs: printInput[]) => inputs.forEach(this.delete);

  /**
   * Deletes multiple overlaps from the OracleIDMap.
   * @param inputs the inputs to delete
   */
  deleteMultipleOverlaps = (inputs: printInput[]) => inputs.forEach(this.deleteOverlap);

  /**
   * Deletes multiple names from the OracleIDMap.
   * @param names the names to delete
   */
  deleteMultipleNames = (names: string[]) => names.forEach(this.deleteName);

  /**
   * Deletes multiple oracle ids from the OracleIDMap.
   * @param oracle_ids the oracle ids to delete
   */
  deleteMultipleOracleIds = (oracle_ids: string[]) => oracle_ids.forEach(this.deleteOracleID);

  /**
   * Creates a new OracleIDMap
   */
  constructor();
  /**
   * Creates a new OracleIDMap
   * @param inputs The initial {@linkcode printInput} objects to set, if any
   */
  constructor(inputs: printInput[]);
  constructor(entries?: printInput[]) {
    this.nameMap = new Map();
    this.oracleIDMap = new Map();
    if (!entries) return;
    entries?.forEach(this.set);
  }

  /**
   * Returns a specified invariant from the OracleIDMap object.
   * @param input the input for the invariant to get
   */
  get = (input: printInput) =>
    this.hasName(getNameFromInput(input))
      ? this.oracleIDMap.get(getOracleIDFromInput(input))
      : undefined;

  /**
   * Returns a specified oracle id from the OracleIDMap object.
   * @param name the name of the oracle id to get
   */
  getOracleID = (name: string) => this.nameMap.get(name.toLowerCase());

  /**
   * Returns a specified name from the OracleIDMap object.
   * @param oracle_id the oracle id of the name to get
   */
  getName = (oracle_id: string) => this.oracleIDMap.get(oracle_id)?.name;

  /**
   * Returns a specified {@linkcode printInvariant} from the OracleIDMap object.
   * @param name the name of the {@linkcode printInvariant} to get
   */
  getFromName = (name: string) => {
    const oracle_id = this.getOracleID(name);
    if (oracle_id) return this.oracleIDMap.get(oracle_id);
  };

  /**
   * Returns a specified {@linkcode printInvariant} from the OracleIDMap object.
   * @param oracle_id the oracle id of the {@linkcode printInvariant} to get
   */
  getFromOracleID = (oracle_id: string) => this.oracleIDMap.get(oracle_id);

  /**
   * Determines whether all the invariants in a InvariantMap satisfy the specified test.
   * @param predicate A function that accepts up to three arguments.
   * The every method calls the predicate function for each invariant until the predicate returns
   * a value which is coercible to the Boolean value false, or until the end of the InvariantMap.
   */
  every(predicate: (invariant: printInvariant) => unknown): boolean;
  every(predicate: (invariant: printInvariant, oracle_id: string) => unknown): boolean;
  every(
    predicate: (invariant: printInvariant, oracle_id: string, name: string) => unknown
  ): boolean;
  every(predicate: (...args: any[]) => unknown): boolean {
    for (const [oracle_id, invariant, name] of this) {
      switch (predicate.length) {
        case 3: {
          if (predicate(invariant, oracle_id, name)) {
            continue;
          }
          return false;
        }
        case 2: {
          if (predicate(invariant, oracle_id)) {
            continue;
          }
          return false;
        }
        default: {
          if (predicate(invariant)) {
            continue;
          }
          return false;
        }
      }
    }
    return false;
  }

  /**
   * Determines whether the specified callback function returns true for any invariant.
   * @param predicate A function that accepts up to three arguments.
   * The some method calls the predicate function for each invariant until the predicate returns
   * a value which is coercible to the Boolean value true, or until the end of the InvariantMap.
   */
  some(predicate: (invariant: printInvariant) => unknown): boolean;
  some(predicate: (invariant: printInvariant, oracle_id: string) => unknown): boolean;
  some(predicate: (invariant: printInvariant, oracle_id: string, name: string) => unknown): boolean;
  some(predicate: (...args: any[]) => unknown): boolean {
    for (const [oracle_id, invariant, name] of this) {
      switch (predicate.length) {
        case 3: {
          if (!predicate(invariant, oracle_id, name)) {
            continue;
          }
          return true;
        }
        case 2: {
          if (!predicate(invariant, oracle_id)) {
            continue;
          }
          return true;
        }
        default: {
          if (!predicate(invariant)) {
            continue;
          }
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Performs the specified action for each invariant.
   * @param callbackfn A function that accepts up to three arguments.
   * forEach calls the callbackfn function one time for each invariant.
   */
  forEach(callbackfn: (invariant: printInvariant) => void): void;
  forEach(callbackfn: (invariant: printInvariant, oracle_id: string) => void): void;
  forEach(callbackfn: (invariant: printInvariant, oracle_id: string, name: string) => void): void;
  forEach(callbackfn: (...args: any[]) => void): void {
    for (const [oracle_id, invariant, name] of this) {
      switch (callbackfn.length) {
        case 3: {
          callbackfn(invariant, oracle_id, name);
          break;
        }
        case 2: {
          callbackfn(invariant, oracle_id);
          break;
        }
        default: {
          callbackfn(invariant);
        }
      }
    }
  }

  /**
   * Calls a defined callback function on each invariant, and returns an array that contains the results.
   * @template T The type that `callbackfn` returns
   * @param callbackfn A function that accepts up to three arguments.
   * The map method calls the callbackfn function one time for each invariant.
   */
  map<T>(callbackfn: (invariant: printInvariant) => T): T[];
  map<T>(callbackfn: (invariant: printInvariant, oracle_id: string) => T): T[];
  map<T>(callbackfn: (invariant: printInvariant, oracle_id: string, name: string) => T): T[];
  map<T>(callbackfn: (...args: any[]) => T): T[] {
    const ret: T[] = [];
    for (const [oracle_id, invariant, name] of this) {
      switch (callbackfn.length) {
        case 3: {
          ret.push(callbackfn(invariant, oracle_id, name));
          break;
        }
        case 2: {
          ret.push(callbackfn(invariant, oracle_id));
          break;
        }
        default: {
          ret.push(callbackfn(invariant));
        }
      }
    }
    return ret;
  }

  /**
   * Calls a defined callback function on each invariant, then flattens the resulting array.
   * This is identical to a map followed by flat with depth 1.
   * @template T The type that `callback` returns
   * @param callback A function that accepts up to three arguments.
   * The flatMap method calls the callbackfn function one time for each invariant.
   */
  flatMap<T>(callback: (invariant: printInvariant) => T | ReadonlyArray<T>): T[];
  flatMap<T>(callback: (invariant: printInvariant, oracle_id: string) => T | ReadonlyArray<T>): T[];
  flatMap<T>(
    callback: (invariant: printInvariant, oracle_id: string, name: string) => T | ReadonlyArray<T>
  ): T[];
  flatMap<T>(callback: (...args: any[]) => T | ReadonlyArray<T>): T[] {
    return this.map(callback).flat() as T[];
  }

  /**
   * Returns the first invariant that meets the condition specified in a callback function.
   *
   * If you're only checking the oracle_id or name, just use {@linkcode getFromOracleID} or
   * {@linkcode getFromName}, respectively, instead, since that'll be much faster
   * @param predicate A function that accepts up to three arguments.
   * The find method calls the predicate function one time for each invariant
   * until it finds one where the predicate returns true. If such an element is found,
   * find immediately returns that invariant. Otherwise, find returns undefined.
   */
  find(predicate: (invariant: printInvariant) => any): printInvariant | undefined;
  find(
    predicate: (invariant: printInvariant, oracle_id: string) => any
  ): printInvariant | undefined;
  find(
    predicate: (invariant: printInvariant, oracle_id: string, name: string) => any
  ): printInvariant | undefined;
  find(predicate: (...args: any[]) => any): printInvariant | undefined {
    for (const [oracle_id, invariant, name] of this) {
      switch (predicate.length) {
        case 3: {
          if (predicate(invariant, oracle_id, name)) {
            return invariant;
          }
          break;
        }
        case 2: {
          if (predicate(invariant, oracle_id)) {
            return invariant;
          }
          break;
        }
        default: {
          if (predicate(invariant)) {
            return invariant;
          }
        }
      }
    }
    return undefined;
  }
  /**
   * Returns the invariants that meet the condition specified in a callback function.
   * @param predicate A function that accepts up to three arguments.
   * The filter method calls the predicate function one time for each invariant.
   */
  filter(predicate: (invariant: printInvariant) => any): printInvariant[];
  filter(predicate: (invariant: printInvariant, oracle_id: string) => any): printInvariant[];
  filter(
    predicate: (invariant: printInvariant, oracle_id: string, name: string) => any
  ): printInvariant[];
  filter(predicate: (...args: any[]) => any): printInvariant[] {
    const ret: printInvariant[] = [];
    for (const [oracle_id, invariant, name] of this) {
      switch (predicate.length) {
        case 3: {
          if (predicate(invariant, oracle_id, name)) {
            ret.push(invariant);
          }
          break;
        }
        case 2: {
          if (predicate(invariant, oracle_id)) {
            ret.push(invariant);
          }
          break;
        }
        default: {
          if (predicate(invariant)) {
            ret.push(invariant);
          }
        }
      }
    }
    return ret;
  }
  /**
   * Calls the specified callback function for all the invariants in a InvariantMap.
   * The return value of the callback function is the accumulated result,
   * and is provided as an argument in the next call to the callback function.
   * @template U the type of the value that is accumulated
   * @param callbackfn A function that accepts two arguments.
   * The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start
   * the accumulation. The first call to the callbackfn function provides this value as an argument.
   */
  reduce<U>(callbackfn: (previousValue: U, invariant: printInvariant) => U, initialValue: U): U {
    let accumulator: U = initialValue;
    for (const invariant of this.values()) {
      accumulator = callbackfn(accumulator, invariant);
    }
    return accumulator;
  }

  /**
   * Checks if a invariant with the specified input exists
   * (i.e. whether one has the same name and oracle id)
   * @param input the input to check for
   */
  has = (input: printInput) =>
    this.hasName(getNameFromInput(input)) && this.hasOracleId(getOracleIDFromInput(input));

  /**
   * Checks if a invariant that overlaps with the specified input exists
   * (i.e. whether one has the same name or same oracle id, but not both)
   * @param input the input to check for
   */
  hasOverlap = (input: printInput) =>
    xor(this.hasName(getNameFromInput(input)), this.hasOracleId(getOracleIDFromInput(input)));

  /**
   * Checks if a invariant with the specified name exists
   * @param name the name to check for
   */
  hasName = (name: string) => this.nameMap.has(name.toLowerCase());

  /**
   * Checks if a invariant with the specified oracle_id exists
   * @param oracle_id the oracle id to check for
   */
  hasOracleId = (oracle_id: string) => this.oracleIDMap.has(oracle_id);

  /**
   * Removes all elements from the InvariantMap.
   */
  clear = () => {
    this.nameMap.clear();
    this.oracleIDMap.clear();
  };
  /**
   * Checks if this InvariantMap is empty
   */
  isEmpty = () => this.nameMap.size === 0;

  clone = () => new InvariantMap(this.map(invariant => structuredClone(invariant)));

  *[Symbol.iterator](): Iterator<[string, printInvariant, string]> {
    for (const [oracle_id, invariant] of this.oracleIDMap.entries()) {
      yield [oracle_id, invariant, invariant.name.toLowerCase()];
    }
  }
  *keys(): IterableIterator<string> {
    for (const id of this.oracleIDMap.keys()) {
      yield id;
    }
  }
  *values(): IterableIterator<printInvariant> {
    for (const invariant of this.oracleIDMap.values()) {
      yield invariant;
    }
  }
  *entries(): IterableIterator<[string, printInvariant, string]> {
    for (const [oracle_id, invariant, name] of this) {
      yield [oracle_id, invariant, name];
    }
  }
  /**
   * Returns an array of the invariants in the InvariantMap. This is identical to `Array.from(InvariantMap.values())`
   */
  invariants(): printInvariant[] {
    return Array.from(this.oracleIDMap.values());
  }
  /**
   * Returns an array of the names in the InvariantMap. This is identical to `Array.from(InvariantMap.keys())`
   */
  names(): string[] {
    return Array.from(this.nameMap.keys());
  }
  /**
   * Returns an array of the oracle ids in the InvariantMap.`
   */
  oracle_ids(): string[] {
    return Array.from(this.oracleIDMap.keys());
  }

  /**
   * @returns the number of invariants in the InvariantMap.
   */
  get size(): number {
    return this.oracleIDMap.size;
  }
}
