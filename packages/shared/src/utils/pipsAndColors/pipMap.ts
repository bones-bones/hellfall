import { HCCardSymbol, HCColors } from '@hellfall/shared/types';
import { unescapeText } from '../textHandling';
import { listsAreLooselyEqual, listsAreLooselyEqualLower, listsShare } from '../listHandling';
import { orderColors } from './orderColors';

const fixPip = (text: string) => unescapeText(text, true).replaceAll(' ', '');

const escapeRegex = (text: string) => text.replaceAll(/[.-/?$]/g, '\\$1');
const doubleable = ['W', 'U', 'P', 'B', 'R', 'G'];
const getDevotionOfPip = (pip: HCCardSymbol, search: HCCardSymbol) => {
  const splitPip = pip.symbol.split('/');
  const doubles = splitPip
    .filter(text => text.length == 2 && text[0] == text[1] && doubleable.includes(text[0]))
    .map(t => t[0]);
  const splitSearch = search.symbol.split('/');
  if (listsShare(doubles, splitSearch)) {
    return 2;
  }
  if (listsShare(splitPip, splitSearch)) {
    return 1;
  }
  return 0;
};

/**
 * Checks if two pip symbols are loosely equal
 * @param pip1 the first pip symbol to check
 * @param pip2 the second pip symbol to check
 */
export const pipSymbolsAreEqual = (pip1: string, pip2: string): boolean => {
  const symbol1 = fixPip(pip1);
  const symbol2 = fixPip(pip2);
  if (symbol1 === symbol2) return true;
  // If either isn't hybrid, skip the transposition check
  if (!symbol1.includes('/') || !symbol2.includes('/')) return false;
  return listsAreLooselyEqualLower(symbol1.split('/'), symbol2.split('/'));
};
const stripBraces = (text: string) =>
  text.startsWith('{') && text.endsWith('}') ? text.slice(1, -1) : text;

/**
 * Checks if two pips are loosely equal
 * @param pip1 the first pip to check
 * @param pip2 the second pip to check
 */
export const pipsAreEqual = (pip1: HCCardSymbol, pip2: HCCardSymbol): boolean =>
  pipSymbolsAreEqual(pip1.symbol, pip2.symbol);

const getOtherLooseValues = (symbol: string): string[] => {
  if (!symbol.includes('/')) return [];
  const segments = symbol.split('/');
  if (segments.length > 3) {
    if (pipSymbolsAreEqual(symbol, 'w/u/b/r/g')) {
      return ['w/u/b/r/g'];
    }
    if (pipSymbolsAreEqual(symbol, 'w/u/p/b/r/g')) {
      return ['w/u/p/b/r/g'];
    }
    return [];
  }
  if (segments.length == 2) {
    return [`${segments[1]}/${segments[0]}`];
  }
  const values: string[] = [];
  const add = (a: string, b: string, c: string) => values.push(`${a}/${b}/${c}`);
  const [a, b, c] = segments;
  add(a, c, b);
  add(b, a, c);
  add(b, c, a);
  add(c, a, b);
  add(c, b, a);
  return values;
};

/**
 * The class for a map of pips.
 */
export class PipMap {
  protected symbolMap = new Map<string, HCCardSymbol>();
  protected indicatorMap = new Map<string, HCCardSymbol>();
  private _manaSymbolRegex: RegExp | null = null;
  /**
   * A regex that matches a mana symbol
   */
  get manaSymbolRegex(): RegExp {
    if (!this._manaSymbolRegex) {
      const symbols = this.filter(pip => pip.represents_mana).mapToArray(pip =>
        escapeRegex(pip.symbol)
      );
      this._manaSymbolRegex = new RegExp(`{(${symbols.join('|')})}`);
    }
    return this._manaSymbolRegex;
  }
  private _coloredSymbolRegex: RegExp | null = null;
  /**
   * A regex that matches a colored mana symbol
   */
  get coloredSymbolRegex(): RegExp {
    if (!this._coloredSymbolRegex) {
      const symbols = this.filter(pip => pip.colors?.some(c => c != 'C')).mapToArray(pip =>
        escapeRegex(pip.symbol)
      );
      this._coloredSymbolRegex = new RegExp(`{(${symbols.join('|')})}`);
    }
    return this._coloredSymbolRegex;
  }
  private _anySymbolRegex: RegExp = /{[^}]+}/;
  /**
   * A regex that matches any symbol
   */
  get anySymbolRegex(): RegExp {
    return this._anySymbolRegex;
  }
  private _repeatedSymbolRegex: RegExp | null = null;
  /**
   * A regex that matches two of the same mana symbol in a row
   */
  get repeatedSymbolRegex(): RegExp {
    if (!this._repeatedSymbolRegex) {
      const symbols = this.filter(pip => pip.colors?.some(c => c != 'C')).mapToArray(pip =>
        escapeRegex(pip.symbol)
      );
      this._repeatedSymbolRegex = new RegExp(`({(${symbols.join('|')})}){2}`);
    }
    return this._repeatedSymbolRegex;
  }
  private _hybridSymbolRegex: RegExp | null = null;
  /**
   * A regex that matches a hybrid mana symbol
   */
  get hybridSymbolRegex(): RegExp {
    if (!this._hybridSymbolRegex) {
      const symbols = this.filter(pip => pip.hybrid).mapToArray(pip => escapeRegex(pip.symbol));
      this._hybridSymbolRegex = new RegExp(`{(${symbols.join('|')})}`);
    }
    return this._hybridSymbolRegex;
  }
  private _phyrexianSymbolRegex: RegExp | null = null;
  /**
   * A regex that matches a phyrexian symbol
   */
  get phyrexianSymbolRegex(): RegExp {
    if (!this._phyrexianSymbolRegex) {
      const symbols = this.filter(pip => pip.phyrexian).mapToArray(pip => escapeRegex(pip.symbol));
      this._phyrexianSymbolRegex = new RegExp(`{(${symbols.join('|')})}`);
    }
    return this._phyrexianSymbolRegex;
  }
  clearRegexes(): void {
    this._manaSymbolRegex = null;
    this._coloredSymbolRegex = null;
    this._repeatedSymbolRegex = null;
    this._hybridSymbolRegex = null;
    this._phyrexianSymbolRegex = null;
  }
  /**
   * Adds a new pip to the PipMap. If a pip with the same symbol already exists, the pip will be updated.
   * @param pip pip to set
   */
  set = (pip: HCCardSymbol) => {
    this.symbolMap.set(fixPip(pip.symbol), pip);
    if (pip.symbol.startsWith('CI-')) {
      this.indicatorMap.set(fixPip(pip.symbol), pip);
    }
    this.clearRegexes();
  };

  /**
   * Adds multiple new pips to the PipMap. If a pip with the same symbol already exists, the pip will be updated.
   * @param pips the pips to add. Can be either a list of pips or a PipMap
   */
  setMultiple(pips: HCCardSymbol[]): void;
  setMultiple(pips: this): void;
  setMultiple(pips: HCCardSymbol[] | this): void {
    pips.forEach(this.set);
  }
  /**
   * @param symbol the symbol to delete
   * @returns true if an element in the PipMap existed and has been removed, or false if the element does not exist.
   */
  delete = (symbol: string) => {
    const value = this.get(symbol);
    if (!value) return false;
    this.symbolMap.delete(fixPip(symbol));
    if (this.indicatorMap.has(fixPip(symbol))) {
      this.indicatorMap.delete(fixPip(symbol));
    }
    this.clearRegexes();
    return true;
  };

  /**
   * Deletes multiple pips from the PipMap.
   * @param symbols the symbols to delete
   */
  deleteMultiple = (symbols: string[]) => symbols.forEach(this.delete);

  /**
   * Creates a new PipMap
   */
  constructor();
  /**
   * Creates a new PipMap
   * @param pips The initial pips to set, if any
   */
  constructor(pips: HCCardSymbol[]);
  constructor(pips?: HCCardSymbol[]) {
    this.symbolMap = new Map();
    if (!pips) return;
    pips?.forEach(pip => this.set(pip));
  }

  /**
   * Returns a specified pip from the PipMap object.
   * If no pip has the specified symbol, undefined is returned
   * @param symbol the symbol of the pip to get (can be either with or without braces)
   */
  get = (symbol: string) => this.symbolMap.get(stripBraces(fixPip(symbol)));

  /**
   * Returns a specified pip from the PipMap object based on a loose value.
   * If no pip has the specified symbol, undefined is returned
   * @param symbol the symbol of the pip to get (can be either with or without braces)
   */
  getLoose = (symbol: string) => {
    const exact = this.symbolMap.get(stripBraces(fixPip(symbol)));
    if (exact) {
      return exact;
    }
    for (const loose of getOtherLooseValues(stripBraces(fixPip(symbol)))) {
      const pip = this.symbolMap.get(loose);
      if (pip) {
        return pip;
      }
    }
  };
  /**
   * Gets the pip for a color indicator from its colors
   * @param colors the colors of the indicator to get
   */
  getIndicator = (colors: string[]) => {
    const exact = this.get(`CI-${colors.join('')}`);
    if (exact) {
      return exact;
    }
    for (const [symbol, pip] of this.indicatorMap) {
      if (listsAreLooselyEqual(pip.colors, colors)) {
        return pip;
      }
    }
  };

  /**
   * Returns a subset of the PipMap object as a new PipMap, based on the provided list of symbols.
   * @param symbolList the list of symbols to get
   * @returns Returns the subset of the PipMap with the given symbols.
   */
  getSubset(symbolList: string[] | Set<string>): this {
    const subMap = new (this.constructor as any)() as this;
    symbolList.forEach(symbol => {
      const pip = this.get(symbol);
      if (pip) {
        subMap.set(pip);
      }
    });
    return subMap;
  }

  /**
   * Returns an array of all the pips in some text from a card
   * @param text text to get the pips from
   */
  getPipsFromText = (text: string) =>
    text.match(/{([^}]+)}/g)?.flatMap(match => this.get(match) ?? []) ?? [];

  /**
   * Returns an array of all the pips in some text from a search
   * @param text text to get the pips from
   */
  getPipsFromSearch = (text: string): HCCardSymbol[] =>
    fixPip(text)
      .split(/({[^}]+})/g)
      .filter(Boolean)
      .map(stripBraces)
      .flatMap(p => {
        // If this text is just a symbol, return it
        const pip = this.getLoose(p);
        if (pip) {
          return pip;
        }
        // If this text isn't a symbol and has a slash, then it's invalid
        if (p.includes('/')) return [];

        const pips: HCCardSymbol[] = [];
        let currText = p;

        // Loop until all text is matched, or until the rest can't be matched
        while (currText.length > 0) {
          let matched = false;
          // Try to match as much as possible of the string, starting at the front
          for (let i = currText.length; i > 0; i--) {
            const currPip = this.get(currText.slice(0, i));
            if (currPip) {
              pips.push(currPip);
              currText = currText.slice(i);
              matched = true;
              break;
            }
          }
          if (!matched) {
            // If no match, return to prevent infinite loop
            return pips;
          }
        }
        // If everything matched, return
        return pips;
      });

  /**
   * Returns an array of all the invalid pip text in some text from a search
   * @param text text to get the invalid pips text from
   */
  getNonPipsFromSearch = (text: string): string[] =>
    fixPip(text)
      .split(/({[^}]+})/g)
      .filter(Boolean)
      .map(stripBraces)
      .flatMap(p => {
        // This is essentially the inverse of the previous one
        const pip = this.getLoose(p);
        if (pip) {
          return [];
        }
        // If this text isn't a symbol and has a slash, then it's invalid
        if (p.includes('/')) return p;

        let currText = p;

        // Loop until all text is matched, or until the rest can't be matched
        while (currText.length > 0) {
          let matched = false;
          // Try to match as much as possible of the string, starting at the front
          for (let i = currText.length; i > 0; i--) {
            const currPip = this.get(currText.slice(0, i));
            if (currPip) {
              currText = currText.slice(i);
              matched = true;
              break;
            }
          }
          if (!matched) {
            // If no match, return to prevent infinite loop
            return currText;
          }
        }
        // If everything matched, return
        return [];
      });

  /**
   * Gets all the pips from text, then converts each pip into its colors, if any
   * @param text text to get the pip colors from
   */
  getPipColorsFromText = (text: string): HCColors[] =>
    this.getPipsFromText(text).flatMap(pip => [pip.colors ?? []]);

  /**
   * Gets the devotion to something from text
   * @param text text to get the devotion from
   * @param pip pip to get the devotion to
   */
  getDevotionFromText = (text: string, pip: HCCardSymbol): number =>
    this.getPipsFromText(text).reduce(
      (total: number, p: HCCardSymbol) => total + getDevotionOfPip(p, pip),
      0
    );

  /**
   * Gets the colors included among the pips in text
   * @param text text to get the pip colors from
   */
  getColorsFromText = (text: string): HCColors =>
    orderColors(
      this.getPipColorsFromText(text)
        .flatMap(c => c)
        .filter(c => c != 'C')
    );

  /**
   * Gets the total mana value of a cost string
   */
  getMVFromCost = (cost: string): number =>
    this.getPipsFromText(cost).reduce((totalMV, pip) => totalMV + (pip.mana_value ?? 0), 0);

  /**
   * gets the file src for a pip name
   * @param name name of the pip to get the src for
   */
  getPipSrc = (name: string) => `/pips/${this.get(name)?.filename}`;

  /**
   * Gets a random symbol from this PipMap
   */
  getRandomSymbol = (): string => this.symbols()[Math.floor(Math.random() * this.size)];

  /**
   * Gets a random pip from this PipMap
   */
  getRandomPip = (): HCCardSymbol => this.pips()[Math.floor(Math.random() * this.size)];

  /**
   * Determines whether all the pips in a PipMap satisfy the specified test.
   * @param predicate A function that accepts up to two arguments.
   * The every method calls the predicate function for each pip until the predicate returns a value
   * which is coercible to the Boolean value false, or until the end of the PipMap.
   */
  every(predicate: (pip: HCCardSymbol) => unknown): boolean;
  every(predicate: (pip: HCCardSymbol, symbol: string) => unknown): boolean;
  every(predicate: (...args: any[]) => unknown): boolean {
    for (const [symbol, pip] of this) {
      switch (predicate.length) {
        case 2: {
          if (predicate(pip, symbol)) {
            continue;
          }
          return false;
        }
        default: {
          if (predicate(pip)) {
            continue;
          }
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Determines whether the specified callback function returns true for any pip.
   * @param predicate A function that accepts up to two arguments.
   * The some method calls the predicate function for each pip until the predicate returns a value
   * which is coercible to the Boolean value true, or until the end of the PipMap.
   */
  some(predicate: (pip: HCCardSymbol) => unknown): boolean;
  some(predicate: (pip: HCCardSymbol, symbol: string) => unknown): boolean;
  some(predicate: (...args: any[]) => unknown): boolean {
    for (const [symbol, pip] of this) {
      switch (predicate.length) {
        case 2: {
          if (!predicate(pip, symbol)) {
            continue;
          }
          return true;
        }
        default: {
          if (!predicate(pip)) {
            continue;
          }
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Performs the specified action for each pip.
   * @param callbackfn A function that accepts up to two arguments.
   * forEach calls the callbackfn function one time for each pip.
   */
  forEach(callbackfn: (pip: HCCardSymbol) => void): void;
  forEach(callbackfn: (pip: HCCardSymbol, symbol: string) => void): void;
  forEach(callbackfn: (...args: any[]) => void): void {
    for (const [symbol, pip] of this) {
      switch (callbackfn.length) {
        case 2: {
          callbackfn(pip, symbol);
          break;
        }
        default: {
          callbackfn(pip);
        }
      }
    }
  }

  /**
   * Calls a defined callback function on each pip, and returns an array that contains the results.
   * @template T The type that `callbackfn` returns
   * @param callbackfn A function that accepts up to two arguments.
   * The map method calls the callbackfn function one time for each pip.
   */
  mapToArray<T>(callbackfn: (pip: HCCardSymbol) => T): T[];
  mapToArray<T>(callbackfn: (pip: HCCardSymbol, symbol: string) => T): T[];
  mapToArray<T>(callbackfn: (...args: any[]) => T): T[] {
    const ret: T[] = [];
    for (const [symbol, pip] of this) {
      switch (callbackfn.length) {
        case 2: {
          ret.push(callbackfn(pip, symbol));
          break;
        }
        default: {
          ret.push(callbackfn(pip));
        }
      }
    }
    return ret;
  }
  /**
   * Calls a defined callback function on each pip, and returns a map that contains the results.
   * @template K the type of the key that `callbackfn` returns
   * @template V the type of the value that `callbackfn` returns
   * @param callbackfn A function that accepts up to two arguments.
   * The map method calls the callbackfn function one time for each pip.
   */
  mapToMap<K, V>(callbackfn: (pip: HCCardSymbol) => [K, V]): Map<K, V>;
  mapToMap<K, V>(callbackfn: (pip: HCCardSymbol, symbol: string) => [K, V]): Map<K, V>;
  mapToMap<K, V>(callbackfn: (...args: any[]) => [K, V]): Map<K, V> {
    const retMap = new Map<K, V>();
    for (const [symbol, pip] of this) {
      switch (callbackfn.length) {
        case 2: {
          retMap.set(...callbackfn(pip, symbol));
          break;
        }
        default: {
          retMap.set(...callbackfn(pip));
        }
      }
    }
    return retMap;
  }
  /**
   * Calls a defined callback function on each pip, and returns a new PipMap.
   * @param callbackfn A function that accepts up to two arguments.
   * The map method calls the callbackfn function one time for each pip.
   */
  map(callbackfn: (pip: HCCardSymbol) => HCCardSymbol): this;
  map(callbackfn: (pip: HCCardSymbol, symbol: string) => HCCardSymbol): this;
  map(callbackfn: (...args: any[]) => HCCardSymbol): this {
    const mapped = new (this.constructor as any)() as this;
    for (const [symbol, pip] of this) {
      switch (callbackfn.length) {
        case 2: {
          mapped.set(callbackfn(pip, symbol));
          break;
        }
        default: {
          mapped.set(callbackfn(pip));
        }
      }
    }
    return mapped;
  }

  /**
   * Calls a defined callback function on each pip, then flattens the resulting array.
   * This is symbolentical to a map followed by flat with depth 1.
   * @template T The type that `callback` returns
   * @param callback A function that accepts up to two arguments.
   * The flatMap method calls the callbackfn function one time for each pip.
   */
  flatMap<T>(callback: (pip: HCCardSymbol) => T | ReadonlyArray<T>): T[];
  flatMap<T>(callback: (pip: HCCardSymbol, symbol: string) => T | ReadonlyArray<T>): T[];
  flatMap<T>(callback: (...args: any[]) => T | ReadonlyArray<T>): T[] {
    return this.mapToArray(callback).flat() as T[];
  }

  /**
   * Returns the first pip that meets the condition specified in a callback function.
   *
   * If you're only checking the symbol, just use {@linkcode get} instead, since that'll be much faster
   * @param predicate A function that accepts up to two arguments.
   * The find method calls the predicate function one time for each pip
   * until it finds one where the predicate returns true. If such an element is found,
   * find immediately returns that pip. Otherwise, find returns undefined.
   */
  find(predicate: (pip: HCCardSymbol) => any): HCCardSymbol | undefined;
  find(predicate: (pip: HCCardSymbol, symbol: string) => any): HCCardSymbol | undefined;
  find(predicate: (...args: any[]) => any): HCCardSymbol | undefined {
    for (const [symbol, pip] of this) {
      switch (predicate.length) {
        case 2: {
          if (predicate(pip, symbol)) {
            return pip;
          }
          break;
        }
        default: {
          if (predicate(pip)) {
            return pip;
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Returns the pips that meet the condition specified in a callback function.
   *
   * If you're only checking the symbols, just use {@linkcode getSubset} instead,
   * since that'll be much faster
   * @param predicate A function that accepts up to two arguments.
   * The filter method calls the predicate function one time for each pip.
   */
  filter(predicate: (pip: HCCardSymbol) => any): this;
  filter(predicate: (pip: HCCardSymbol, symbol: string) => any): this;
  filter(predicate: (...args: any[]) => any): this {
    const subMap = new (this.constructor as any)() as this;
    for (const [symbol, pip] of this) {
      switch (predicate.length) {
        case 2: {
          if (predicate(pip, symbol)) {
            subMap.set(pip);
          }
          break;
        }
        default: {
          if (predicate(pip)) {
            subMap.set(pip);
          }
        }
      }
    }
    return subMap;
  }

  /**
   * Calls the specified callback function for all the pips in a PipMap.
   * The return value of the callback function is the accumulated result,
   * and is provided as an argument in the next call to the callback function.
   * @template U the type of the value that is accumulated
   * @param callbackfn A function that accepts two arguments.
   * The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start
   * the accumulation. The first call to the callbackfn function provides this value as an argument.
   */
  reduce<U>(callbackfn: (previousValue: U, pip: HCCardSymbol) => U, initialValue: U): U {
    let accumulator: U = initialValue;
    for (const pip of this.values()) {
      accumulator = callbackfn(accumulator, pip);
    }
    return accumulator;
  }

  /**
   * Checks if a pip with the specified symbol exists
   * @param symbol the symbol to check for
   */
  has = (symbol: string) => this.symbolMap.has(fixPip(symbol));

  /**
   * Removes all elements from the PipMap.
   */
  clear = () => {
    this.symbolMap.clear();
    this.indicatorMap.clear();
    this.clearRegexes();
  };
  /**
   * Checks if this PipMap is empty
   */
  isEmpty = () => this.symbolMap.size === 0;

  *[Symbol.iterator](): Iterator<[string, HCCardSymbol]> {
    for (const [symbol, pip] of this.symbolMap.entries()) {
      yield [symbol, pip];
    }
  }
  *keys(): IterableIterator<string> {
    for (const symbol of this.symbolMap.keys()) {
      yield symbol;
    }
  }
  *values(): IterableIterator<HCCardSymbol> {
    for (const pip of this.symbolMap.values()) {
      yield pip;
    }
  }
  *entries(): IterableIterator<[string, HCCardSymbol]> {
    for (const [symbol, pip] of this.symbolMap.entries()) {
      yield [symbol, pip];
    }
  }
  /**
   * Returns an array of the pips in the PipMap. This is symbolentical to `Array.from(PipMap.values())`
   */
  pips(): HCCardSymbol[] {
    return Array.from(this.symbolMap.values());
  }
  /**
   * Returns an array of the symbols in the PipMap. This is symbolentical to `Array.from(PipMap.keys())`
   */
  symbols(): string[] {
    return Array.from(this.symbolMap.keys());
  }
  /**
   * @returns the number of pips in the PipMap.
   */
  get size(): number {
    return this.symbolMap.size;
  }
}
