import { textEquals, textContains } from './textHandling';

/**
 * Performs a logical XOR on two values after converting them to booleans
 * @param value1 the first value to compare
 * @param value2 the second value to compare
 * @returns Whether the boolean conversions of the values are different
 */
export const xor = (value1: any, value2: any) => !value1 != !value2;

/**
 * Checks whether two arbitrary values are exactly equal.
 * (basically a version of `===` that compares objects by value rather than by reference)
 * @template T the type of the values to compare
 * @param value1 the first value to compare
 * @param value2 the second value to compare
 * @param ignoreOrder set to true if order should be ignored when comparing lists
 */
export const arbAreEqual = <T>(value1: T, value2: T, ignoreOrder?: boolean): boolean => {
  if (typeof value1 != typeof value2) {
    return false;
  }
  if (typeof value1 == 'number') {
    return value1 == value2;
  }
  if (typeof value1 != 'object' || typeof value2 != 'object') {
    return value1 === value2;
  }
  if (value1 == null || value2 == null) {
    // this is necessary because `typeof null === 'object'` due to a historical bug
    // (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#typeof_null)
    return value1 === value2;
  }
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return listsAreEqual(value1, value2, ignoreOrder);
  }
  for (const [prop, value] of Object.entries(value1)) {
    if (!arbAreEqual(value, value2[prop as keyof T])) {
      return false;
    }
  }
  for (const [prop, value] of Object.entries(value2)) {
    if (!arbAreEqual(value, value1[prop as keyof T])) {
      return false;
    }
  }
  return true;
};
const arbAreEqualIgnoreOrder = <T>(value1: T, value2: T) => arbAreEqual(value1, value2, true);
const arbAreEqualGenerator =
  (ignoreOrder?: boolean) =>
  <T>(value1: T, value2: T) =>
    arbAreEqual(value1, value2, ignoreOrder);

/**
 * A function that compares two values to see if they are equal
 * @template T the type of the values to compare
 */
export type equalityFunction<T> = (value1: T, value2: T) => boolean | undefined;

/**
 * Checks whether two lists are equal
 * @template T the type of the elements of the lists
 * @param value1 first list to check
 * @param value2 second list to check
 * @param ignoreOrder whether to ignore the order of the items
 * @param equals {@link equalityFunction | equality function} to use; defaults to {@linkcode arbAreEqual}
 */
export const listsAreEqual = <T>(
  value1?: T[],
  value2?: T[],
  ignoreOrder?: boolean,
  equals: equalityFunction<T> = arbAreEqualGenerator(ignoreOrder)
): boolean => {
  if (value1 == undefined || value2 == undefined) {
    return false;
  }
  if (value1.length != value2.length) {
    return false;
  }
  if (!ignoreOrder) {
    return value1.every((value, i) => equals(value, value2[i]));
  }
  const set1 = [...value1];
  const set2 = [...value2];
  for (let i = 0; i < set2.length; i++) {
    const index = set1.findIndex(value => equals(value, set2[i]));
    if (index == -1) {
      return false;
    }
    set1.splice(index, 1);
  }
  return true;
  // if (value1?.length != value2?.length || value1 == undefined || value2 == undefined) {
  //   return false;
  // }
  // return value1.every((value, i) => equals(value, value2[i]));
};

/**
 * Checks whether two lists are loosely equal (ignoring order). Equivalent to {@linkcode listsAreEqual} with `ignoreOrder: true`
 * @template T the type of the elements of the lists
 * @param value1 first list to check
 * @param value2 second list to check
 * @param equals {@link equalityFunction | equality function} to use; defaults to {@linkcode arbAreEqual} with `ignoreOrder: true`
 */
export const listsAreLooselyEqual = <T>(
  value1?: T[],
  value2?: T[],
  equals: equalityFunction<T> = arbAreEqualIgnoreOrder
): boolean => listsAreEqual(value1, value2, true, equals);
/**
 * Checks whether two lists are exactly equal (not ignoring order). Equivalent to {@linkcode listsAreEqual} with `ignoreOrder: false`
 * @template T the type of the elements of the lists
 * @param value1 first list to check
 * @param value2 second list to check
 * @param equals {@link equalityFunction | equality function} to use; defaults to {@linkcode arbAreEqual} with `ignoreOrder: false`
 */
export const listsAreExactlyEqual = <T>(
  value1?: T[],
  value2?: T[],
  equals: equalityFunction<T> = arbAreEqualIgnoreOrder
): boolean => listsAreEqual(value1, value2, false, equals);

/**
 * Checks whether one list contains another list
 * @template T the type of the elements of the lists
 * @param value1 list to check whether it contains the other list
 * @param value2 list to check whether it is contained by the other list
 * @param equals {@link equalityFunction | equality function} to use; defaults to {@linkcode arbAreEqual} with `ignoreOrder: true`
 */
export const listContainsList = <T>(
  value1: T[],
  value2: T[],
  equals: equalityFunction<T> = arbAreEqualIgnoreOrder
) => {
  const superset = [...value1];
  const subset = [...value2];
  for (let i = 0; i < subset.length; i++) {
    const index = superset.findIndex(value => equals(value, subset[i]));
    if (index == -1) {
      return false;
    }
    superset.splice(index, 1);
  }
  return true;
};
/**
 * Checks whether one list contains another list as a strict subset (i.e. doesn't equal it)
 * @template T the type of the elements of the lists
 * @param value1 list to check whether it contains the other list
 * @param value2 list to check whether it is contained by the other list
 * @param equals {@link equalityFunction | equality function} to use; defaults to {@linkcode arbAreEqual} with `ignoreOrder: true`
 * @returns
 */
export const listContainsListAsSubset = <T>(
  value1: T[],
  value2: T[],
  equals: equalityFunction<T> = arbAreEqualIgnoreOrder
) => listContainsList(value1, value2, equals) && !arbAreEqualIgnoreOrder(value1, value2);

/**
 * Checks whether a list contains some list from a list of lists
 * @template T the type of the elements of the lists
 * @param value1 list to check whether it contains some list
 * @param value2 list of lists to check whether it has a member that is contained by the list
 * @param equals {@link equalityFunction | equality function} to use; defaults to {@linkcode arbAreEqual} with `ignoreOrder: true`
 * @returns
 */
export const listContainsSomeList = <T>(
  value1: T[],
  value2: T[][],
  equals: equalityFunction<T> = arbAreEqualIgnoreOrder
): boolean => value2.some(value => listContainsList(value1, value, equals));

/**
 * Checks whether a list includes a value
 * @template T the type of the elements of the list and of the value
 * @param list list to check
 * @param value value to check
 * @param equals {@link equalityFunction | equality function} to use; defaults to {@linkcode arbAreEqual} with `ignoreOrder: true`
 * @returns
 */
export const listIncludesValue = <T>(
  list?: T[],
  value?: T,
  equals: equalityFunction<T> = arbAreEqualIgnoreOrder
) => value != undefined && list?.some(v => equals(v, value));

/**
 * Checks whether two lists share any values
 * @template T the type of the elements of the lists
 * @param value1 first list to check
 * @param value2 second list to check
 * @param equals {@link equalityFunction | equality function} to use; defaults to {@linkcode arbAreEqual} with `ignoreOrder: true`
 * @returns
 */
export const listsShare = <T>(
  value1?: T[],
  value2?: T[],
  equals: equalityFunction<T> = arbAreEqualIgnoreOrder
) => (value1 ?? []).some(value => listIncludesValue(value2 ?? [], value, equals));

/**
 * Calculates the maximum depth of a list (if value isn't a list, returns 0)
 * @param value value to calculate the depth of
 */
const depth = (value: any): number => {
  if (!Array.isArray(value)) {
    return 0;
  }
  const depths = value.map(e => depth(e));
  return Math.max(...depths) + 1;
};

/**
 * Checks whether one list can contain another list
 * @template T the type of the elements of the lists
 * @param value1 list to check whether it contains the other list
 * @param value2 list to check whether it is contained by the other list
 * @param equals {@link equalityFunction | equality function} to use; defaults to {@linkcode arbAreEqual} with `ignoreOrder: true`
 * @returns
 */
export const listCanContainList = <T>(
  value1: T[][] | T[],
  value2: T[][] | T[],
  equals: equalityFunction<T> = arbAreEqualIgnoreOrder
): boolean => {
  const depth1 = depth(value1);
  const depth2 = depth(value2);
  if (depth1 == 1 && depth2 == 1) {
    return listContainsList(value1 as T[], value2 as T[], equals);
  }
  if (depth1 > 1) {
    // if value1 is hybrid, then return true if every member of value2 is in some member of value1
    return (value2 as T[]).every(c => value1.some(set => listIncludesValue(set as T[], c, equals)));
  }
  if (depth2 > 1) {
    // if value1 is not hybrid, then return true if every member of value2 shares a member with value1
    return (value2 as T[][]).every(set => listsShare(set, value1 as T[], equals));
  }
  return arbAreEqual(value1, value2, true);
};

/**
 * Checks whether two values and/or lists share any values. They must have the same type but either one can be either a list or a value.
 * @template T the type of the elements of the lists or of the values
 * @param value1 first value/list to check
 * @param value2 second value/list to check
 * @param equals {@link equalityFunction | equality function} to use; defaults to {@linkcode arbAreEqual} with `ignoreOrder: true`
 */
export const listsOrValuesShare = <T>(
  value1: T | T[],
  value2: T | T[],
  equals: equalityFunction<T> = arbAreEqualIgnoreOrder
) => {
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return (
      listsShare(value1, value2, equals) ||
      listIncludesValue(value1, value2 as T, equals) ||
      listIncludesValue(value2, value1 as T, equals) ||
      arbAreEqual(value1, value2, true)
    );
  }
  if (Array.isArray(value1)) {
    return listIncludesValue(value1, value2 as T, equals);
  }
  if (Array.isArray(value2)) {
    return listIncludesValue(value2, value1, equals);
  }
  return arbAreEqual(value1, value2, true);
};

const listLowerEquality: equalityFunction<string> = (value1: string, value2: string) =>
  value1.toLowerCase() === value2.toLowerCase();

/**
 * Checks whether a list includes a value; lowercases strings before comparing them
 * @param list list to check
 * @param value value to check
 */
export const listIncludesValueLower = (list?: string[], value?: string) =>
  value != undefined && listIncludesValue(list ?? [], value, listLowerEquality);
/**
 * Checks whether a list includes all of a list of values; lowercases strings before comparing them
 * @param value1 list to check
 * @param value2 list of strings to check
 */
export const listIncludesValueLowerEvery = (value1?: string[], value2?: string[]) =>
  value2?.every(value => listIncludesValueLower(value1, value));

/**
 * Checks whether two lists share any values; lowercases strings before comparing them
 * @param value1 first list to check
 * @param value2 second list to check
 */
export const listsShareLower = (value1?: string[], value2?: string[]) =>
  listsShare(value1, value2, listLowerEquality);
/**
 * Checks whether two values and/or lists share any values, converting to lowercase first.
 * @param value1 First value/list to check
 * @param value2 Second value/list to check
 */
export const listsOrValuesShareLower = (value1: string | string[], value2: string | string[]) =>
  listsOrValuesShare(value1, value2, listLowerEquality);

/**
 * Checks whether a text list contains a string
 * (i.e. whether the list includes a string that {@link textContains contains} the string to check)
 * @param value1 list to check
 * @param value2 string to check
 */
export const textListContains = (value1?: string[], value2?: string) =>
  listIncludesValue(value1, value2, textContains);

/**
 * Checks whether a text list contains all members of a list of strings
 * (i.e. whether the list includes a string that {@link textContains contains} the string to check)
 * @param value1 list to check
 * @param value2 list of strings to check
 */
export const textListContainsEvery = (value1?: string[], value2?: string[]) =>
  value2?.every(value => textListContains(value1, value));

/**
 * Checks whether a text list includes a string (using {@linkcode textEquals})
 * @param value1 list to check
 * @param value2 string to check
 */
export const textListIncludes = (value1?: string[], value2?: string) =>
  listIncludesValue(value1, value2, textEquals);
/**
 * Checks whether a text list includes all members of a list of strings (using {@linkcode textEquals})
 * @param value1 list to check
 * @param value2 list of strings to check
 */
export const textListIncludesEvery = (value1?: string[], value2?: string[]) =>
  value2?.every(value => textListIncludes(value1, value));

/**
 * Checks whether two text lists share any values, using {@linkcode textEquals}
 * @param value1 first list to check
 * @param value2 second list to check
 */
export const textListsShare = (value1?: string[], value2?: string[]) =>
  listsShare(value1, value2, textEquals);

/**
 * Remove shared elements from two lists (does not modify the original lists)
 * @param value1 first list to remove elements from
 * @param value2 fecond list to remove elements form
 * @returns versions of both lists with their intersections removed
 */
export const removeIntersection = <T>(value1: T[], value2: T[]): { set1: T[]; set2: T[] } => {
  const set1 = [...value1];
  const set2 = [...value2];
  for (let i = value2.length; i >= 0; i--) {
    const index = set1.indexOf(value2[i]);
    if (index == -1) {
      continue;
    }
    set1.splice(index, 1);
    set2.splice(i, 1);
  }
  return { set1, set2 };
};

/**
 * Gets the union of two lists
 * @param value1 first list to get the union of
 * @param value2 second list to get the union of
 * @returns a list of all values that are in both lists
 */
export const toUnion = <T>(value1: T[], value2: T[]) => {
  const union = [...value1];
  value2.forEach(value => {
    if (!union.includes(value)) {
      union.push(value);
    }
  });
  return union;
};

/**
 * Correctly deals with pushing a value to an optional property by creating the value of the prop first if necessary
 * @template T the type of the object to push to
 * @param ob object that has the prop
 * @param prop prop to push to
 * @param value value to push
 */
export const pushProp = <T>(ob: T, prop: keyof T, value: any) => {
  if (ob[prop] == undefined) {
    (ob as any)[prop] = [value];
  } else if (Array.isArray(ob[prop])) {
    ob[prop].push(value);
  }
};

/**
 * Correctly deals with popping a value from an optional property
 * @template T the type of the object to pop from
 * @param ob object that has the prop
 * @param prop prop to pop from
 * @param value value to pop
 */
export const popProp = <T>(ob: T, prop: keyof T, value: any) => {
  if (ob[prop] == undefined) {
    return false;
  } else if (Array.isArray(ob[prop])) {
    const loc = ob[prop].indexOf(value);
    if (loc == undefined || loc == -1) return false;
    ob[prop].splice(loc, 1);
    return true;
  }
};

/**
 * Correctly deals with adding a value to an optional property that's a `Record<string,string>`
 * by creating the value of the prop first if necessary
 * @template T the type of the object to add to
 * @param ob object that has the prop
 * @param prop prop to add to
 * @param key key to add
 * @param value value to add
 */
export const addPropToRecord = <T>(ob: T, prop: keyof T, key: string, value: string) => {
  if (ob[prop] == undefined) {
    (ob as any)[prop] = {};
  }
  const record = ob[prop] as Record<string, string>;
  record[key] = value;
};
/**
 * Correctly deals with pushing a value to an optional property that's a `Record<string,string[]>`
 * by creating the value of the prop first if necessary
 * @template T the type of the object to push to
 * @param ob object that has the prop
 * @param prop prop to push to
 * @param key key to push to
 * @param value value to push
 */
export const pushPropToRecord = <T>(ob: T, prop: keyof T, key: string, value: string) => {
  if (ob[prop] == undefined) {
    (ob as any)[prop] = {};
  }
  const record = ob[prop] as Record<string, string[]>;
  if (key in record) {
    record[key].push(value);
  } else {
    record[key] = [value];
  }
};

/**
 * Correctly deals with deleting a value from an optional property that's a `Record<string,string>`
 * @template T the type of the object to delete from
 * @param ob object that has the prop
 * @param prop prop to delete from
 * @param key key to delete
 */
export const deletePropFromRecord = <T>(ob: T, prop: keyof T, key: string) => {
  if (ob[prop] == undefined) {
    return false;
  }
  const record = ob[prop] as Record<string, string>;
  if (record[key] != undefined) {
    delete record[key];
    return true;
  }
  return false;
};

/**
 * Correctly deals with popping a value from an optional property that's a `Record<string,string[]>`
 * @template T the type of the object to delete from
 * @param ob object that has the prop
 * @param prop prop to delete from
 * @param key key to pop from
 * @param value value to pop
 */
export const popPropFromRecord = <T>(ob: T, prop: keyof T, key: string, value: string) => {
  if (ob[prop] == undefined) {
    return false;
  }
  const record = ob[prop] as Record<string, string[]>;
  if (key in record) {
    const index = record[key].indexOf(value);
    if (index == -1 || index == undefined) return false;
    record[key].splice(index, 1);
    return true;
  }
  return false;
};

/**
 * Correctly deals with pushing a value to a `Record<string,string[]>` by creating the value of the prop first if necessary
 * @param record record
 * @param key key to push to
 * @param value value to push
 */
export const pushToRecord = (record: Record<string, string[]>, key: string, value: string) => {
  if (key in record) {
    if (!record[key].includes(value)) {
      record[key].push(value);
    }
  } else {
    record[key] = [value];
  }
};

/**
 * Ensures that a value is an array or undefined. If it's not an array or undefined, wraps value in an array before returning it
 * @template T The type of the value
 * @param value the value to ensure is an array
 */
export const wrapArray = <T>(value: T | T[] | undefined): T[] | undefined =>
  !Array.isArray(value) && value != undefined ? [value] : (value as T[] | undefined);

/**
 * Ensures that a value is an array. If it's not an array or undefined, wraps value in an array before returning it;
 * if it's undefined, returns an empty array
 * @template T The type of the value
 * @param value the value to ensure is an array
 */
export const ensureArray = <T>(value: T | T[] | undefined): T[] =>
  value == undefined ? [] : !Array.isArray(value) ? [value] : value;
