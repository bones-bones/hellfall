import { textEquals, textContains } from './textHandling';

/**
 * Checks whether two arbitrary values are exactly equal. (basically a version of `===` that compares objects by value rather than by reference)
 * @param value1 the first value to compare
 * @param value2 the second value to compare
 * @param ignoreOrder set to true if order should be ignored when comparing lists
 */
export const arbAreEqual = <T = any>(value1: T, value2: T, ignoreOrder?: boolean): boolean => {
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
    // this is necessary because `typeof null === 'object'` due to a historical bug (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#typeof_null)
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
const arbAreEqualIgnoreOrder = <T = any>(value1: T, value2: T) => arbAreEqual(value1, value2, true);
const arbAreEqualGenerator =
  (ignoreOrder?: boolean) =>
  <T = any>(value1: T, value2: T) =>
    arbAreEqual(value1, value2, ignoreOrder);

export type equalityFunction<T> = (value1: T, value2: T) => boolean | undefined;
/**
 * Checks whether one list is equal to another list.
 * @param value1 First list to check
 * @param value2 Second list to check
 * @param ignoreOrder whether to ignore the order of the items
 * @param equals equality function to use; defaults to {@link arbAreEqual}
 */
export const listsAreEqual = <T = any>(
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
  if (ignoreOrder) {
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
 * Checks whether one list is loosely equal to another list (ignoring order). Equivalent to {@link listsAreEqual} with `ignoreOrder: true`
 * @param value1 First list to check
 * @param value2 Second list to check
 * @param equals equality function to use; defaults to {@link arbAreEqual} with `ignoreOrder: true`
 */
export const listsAreLooselyEqual = <T = any>(
  value1?: T[],
  value2?: T[],
  equals: equalityFunction<T> = arbAreEqualIgnoreOrder
): boolean => listsAreEqual(value1, value2, true, equals);
/**
 * Checks whether one list is exactly equal to another list (not ignoring). Equivalent to {@link listsAreEqual} with `ignoreOrder: false`
 * @param value1 First list to check
 * @param value2 Second list to check
 * @param equals equality function to use; defaults to {@link arbAreEqual} with `ignoreOrder: false`
 */
export const listsAreExactlyEqual = <T = any>(
  value1?: T[],
  value2?: T[],
  equals: equalityFunction<T> = arbAreEqualIgnoreOrder
): boolean => listsAreEqual(value1, value2, false, equals);

/**
 * Checks whether one list contains another list.
 * @param value1 List to check whether it contains the other list
 * @param value2 List to check whether it is contained by the other list
 * @param equals equality function to use; defaults to {@link arbAreEqual} with `ignoreOrder: true`
 */
export const listContainsList = <T = any>(
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
 * Checks whether one list contains another list as a strict subset (i.e. doesn't equal it).
 * @param value1 List to check whether it contains the other list
 * @param value2 List to check whether it is contained by the other list
 * @param equals equality function to use; defaults to {@link arbAreEqual} with `ignoreOrder: true`
 * @returns
 */
export const listContainsListAsSubset = <T = any>(
  value1: T[],
  value2: T[],
  equals: equalityFunction<T> = arbAreEqualIgnoreOrder
) => listContainsList(value1, value2, equals) && !arbAreEqualIgnoreOrder(value1, value2);

/**
 * Checks whether a list contains some list from a list of lists.
 * @param value1 List to check whether it contains some list
 * @param value2 List of lists to check whether it has a member that is contained by the list
 * @param equals equality function to use; defaults to {@link arbAreEqual} with `ignoreOrder: true`
 * @returns
 */
export const listContainsSomeList = <T = any>(
  value1: T[],
  value2: T[][],
  equals: equalityFunction<T> = arbAreEqualIgnoreOrder
): boolean => value2.some(value => listContainsList(value1, value, equals));

const depth = (value: any): number => {
  if (!Array.isArray(value)) {
    return 0;
  }
  const depths = value.map(e => depth(e));
  return Math.max(...depths) + 1;
};

/**
 * Checks whether a list includes a value.
 * @param list List to check
 * @param value Value to check
 * @param equals equality function to use; defaults to {@link arbAreEqual} with `ignoreOrder: true`
 * @returns
 */
export const listIncludesValue = <T = any>(
  list?: T[],
  value?: T,
  equals: equalityFunction<T> = arbAreEqualIgnoreOrder
) => value && list?.some(v => equals(v, value));
/**
 * Checks whether one list shares any values with another list.
 * @param value1 First list to check
 * @param value2 Second list to check
 * @param equals equality function to use; defaults to {@link arbAreEqual} with `ignoreOrder: true`
 * @returns
 */
export const listsShare = <T = any>(
  value1?: T[],
  value2?: T[],
  equals: equalityFunction<T> = arbAreEqualIgnoreOrder
) => (value1 ?? []).some(value => listIncludesValue(value2 ?? [], value, equals));

/**
 * Checks whether one list can contain another list.
 * @param value1 List to check whether it contains the other list
 * @param value2 List to check whether it is contained by the other list
 * @param equals equality function to use; defaults to {@link arbAreEqual} with `ignoreOrder: true`
 * @returns
 */
export const listCanContainList = <T = any>(
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
 * @param value1 First value/list to check
 * @param value2 Second value/list to check
 * @param equals equality function to use; defaults to {@link arbAreEqual} with `ignoreOrder: true`
 */
export const listsOrValuesShare = <T = any>(
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
 * Checks whether a list includes a value when lowercase.
 * @param list List to check
 * @param value Value to check
 * @param equals equality function to use; defaults to {@link arbAreEqual} with `ignoreOrder: true`
 * @returns
 */
export const listIncludesValueLower = (list?: string[], value?: string) =>
  value && listIncludesValue(list ?? [], value, listLowerEquality);
/**
 * Checks whether a list includes all of a list of values when lowercase
 * @param value1 List to check
 * @param value2 List of strings to check
 */
export const listIncludesValueLowerEvery = (value1?: string[], value2?: string[]) =>
  value2?.every(value => listIncludesValueLower(value1, value));
/**
 * Checks whether one list shares any values with another list.
 * @param value1 First list to check
 * @param value2 Second list to check
 * @param equals equality function to use; defaults to {@link arbAreEqual} with `ignoreOrder: true`
 * @returns
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
 * @param value1 List to check
 * @param value2 String to check
 */
export const textListContains = (value1?: string[], value2?: string) =>
  listIncludesValue(value1, value2, textContains);
// Boolean(value1?.some(text => textSearchIncludes(text, value2)));

/**
 * Checks whether a text list contains all members of a list of strings
 * @param value1 List to check
 * @param value2 List of strings to check
 */
export const textListContainsEvery = (value1?: string[], value2?: string[]) =>
  value2?.every(value => textListContains(value1, value));
/**
 * Checks whether a text list includes a string
 * @param value1 List to check
 * @param value2 String to check
 */
export const textListIncludes = (value1?: string[], value2?: string) =>
  listIncludesValue(value1, value2, textEquals);
/**
 * Checks whether a text list includes all members of a list of strings
 * @param value1 List to check
 * @param value2 List of strings to check
 */
export const textListIncludesEvery = (value1?: string[], value2?: string[]) =>
  value2?.every(value => textListIncludes(value1, value));

export const textListsShare = (value1?: string[], value2?: string[]) =>
  listsShare(value1, value2, textEquals);

/**
 * Remove shared elements from two lists
 * @param value1 First list to remove elements from
 * @param value2 Second list to remove elements form
 */
export const removeIntersection = <T = any>(value1: T[], value2: T[]): { set1: T[]; set2: T[] } => {
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
 * @param value1 First list to get the union of
 * @param value2 Second list to get the union of
 */
export const toUnion = <T = any>(value1: T[], value2: T[]) => {
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
 * @param ob object that has the prop
 * @param prop prop to push to
 * @param value value to push
 */
export const pushProp = <T = any>(ob: T, prop: keyof T, value: any) => {
  if (ob[prop] == undefined) {
    (ob as any)[prop] = [value];
  } else if (Array.isArray(ob[prop])) {
    ob[prop].push(value);
  }
};
/**
 * Correctly deals with popping a value from an optional property
 * @param ob object that has the prop
 * @param prop prop to pop from
 * @param value value to pop
 */
export const popProp = <T = any>(ob: T, prop: keyof T, value: any) => {
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
 * Correctly deals with adding a value to an optional property that's a `Record<string,string>` by creating the value of the prop first if necessary
 * @param ob object that has the prop
 * @param prop prop to add to
 * @param key key to add
 * @param value value to add
 */
export const addPropToRecord = <T = any>(ob: T, prop: keyof T, key: string, value: string) => {
  if (ob[prop] == undefined) {
    (ob as any)[prop] = {};
  }
  const record = ob[prop] as Record<string, string>;
  record[key] = value;
};
/**
 * Correctly deals with pushing a value to an optional property that's a `Record<string,string[]>` by creating the value of the prop first if necessary
 * @param ob object that has the prop
 * @param prop prop to push to
 * @param key key to push to
 * @param value value to push
 */
export const pushPropToRecord = <T = any>(ob: T, prop: keyof T, key: string, value: string) => {
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
 * Correctly deals with deleting a value from an optional property that's a `Record<string,string>
 * @param ob object that has the prop
 * @param prop prop to delete from
 * @param key key to delete
 */
export const deletePropFromRecord = <T = any>(ob: T, prop: keyof T, key: string) => {
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
 * Correctly deals with popping a value from an optional property that's a `Record<string,string[]>
 * @param ob object that has the prop
 * @param prop prop to delete from
 * @param key key to pop from
 * @param value value to pop
 */
export const popPropFromRecord = <T = any>(ob: T, prop: keyof T, key: string, value: string) => {
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
 * Ensures that a value is an array. If it's not an array or undefined, wraps value in an array before returning it; if it's undefined, returns an empty array
 * @template T The type of the value
 * @param value the value to ensure is an array
 */
export const ensureArray = <T>(value: T | T[] | undefined): T[] =>
  value == undefined ? [] : !Array.isArray(value) ? [value] : value;
