import { textEquals, textSearchIncludes } from './textHandling';

/**
 * Checks whether two values and/or lists share any values. They must have the same type but either one can be either a list or a value.
 * @param value1 First value/list to check
 * @param value2 Second value/list to check
 * @returns
 */
export const listShare = <T = any>(value1?: T | T[], value2?: T | T[]) => {
  if (value1 == undefined || value2 == undefined) {
    return undefined;
  } else if (Array.isArray(value1) && Array.isArray(value2)) {
    return value1.some(value => value2.includes(value));
  } else if (Array.isArray(value1)) {
    return value1.includes(value2 as T);
  } else if (Array.isArray(value2)) {
    return value2.includes(value1);
  } else {
    return value1 == value2;
  }
};

const listToLower = (list?: string[]) => list?.map(text => text.toLowerCase());

/**
 * Checks whether two values and/or lists share any values, converting to lowercase first.
 * @param value1 First value/list to check
 * @param value2 Second value/list to check
 * @returns
 */
export const listShareLower = (value1?: string | string[], value2?: string | string[]) => {
  if (value1 == undefined || value2 == undefined) {
    return undefined;
  } else if (Array.isArray(value1) && Array.isArray(value2)) {
    const val = listToLower(value2)!;
    return listToLower(value1)!.some(value => val.includes(value));
  } else if (Array.isArray(value1) && typeof value2 == 'string') {
    return listToLower(value1)!.includes(value2.toLowerCase());
  } else if (Array.isArray(value2) && typeof value1 == 'string') {
    return listToLower(value2)!.includes(value1.toLowerCase());
  } else {
    return value1 == value2;
  }
};

/**
 * Checks whether one list is equal to another list. Ignores order, but can handle duplicates
 * @param value1 First list to check
 * @param value2 Second list to check
 * @returns
 */
export const doubleListEquals = <T = any>(value1: T[], value2: T[]) => {
  if (value1.length != value2.length) {
    return false;
  }
  const set1 = [...value1];
  const set2 = [...value2];
  for (let i = 0; i < set2.length; i++) {
    const index = set1.indexOf(set2[i]);
    if (index == -1) {
      return false;
    }
    set1.splice(index, 1);
  }
  return true;
};
/**
 * Checks whether one list of lists is equal to another list of lists. Ignores order, but can handle duplicates
 * @param value1 First list of lists to check
 * @param value2 Second list of lists to check
 * @returns
 */
export const doubleListOfListsEqual = <T = any>(value1: T[][], value2: T[][]) => {
  if (value1.length != value2.length) {
    return false;
  }
  const set1 = [...value1];
  const set2 = [...value2];
  for (let i = 0; i < set2.length; i++) {
    const index = set1.findIndex(set => listEquals(set, set2[i]));
    if (index == -1) {
      return false;
    }
    set1.splice(index, 1);
  }
  return true;
};

export const listEquals = <T = any>(value1: T | T[], value2: T | T[]) => {
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return doubleListEquals(value1, value2);
  } else if (Array.isArray(value1)) {
    return value1.every(value => value == value2);
  } else if (Array.isArray(value2)) {
    return value2.every(value => value == value1);
  } else {
    return value1 == value2;
  }
};

/**
 * Remove shared elements from two lists
 * @param value1
 * @param value2
 * @returns
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
 * Checks whether one list contains another list. Ignores order, but can handle duplicates
 * @param value1 List to check whether it contains the other list
 * @param value2 List to check whether it is contained by the other list
 * @returns
 */
export const contains = <T = any>(value1: T[], value2: T[]): boolean => {
  const superset = [...value1];
  const subset = [...value2];
  for (let i = 0; i < subset.length; i++) {
    const index = superset.indexOf(subset[i]);
    if (index == -1) {
      return false;
    }
    superset.splice(index, 1);
  }
  return true;
};

/**
 * Checks whether one list can contain another list. Ignores order
 * @param value1 List to check whether it contains the other list
 * @param value2 List to check whether it is contained by the other list
 * @returns
 */
export const canContain = <T = any>(value1: T[][] | T[], value2: T[][] | T[]) => {
  if (Array.isArray(value1[0]) && Array.isArray(value2[0])) {
    return doubleListOfListsEqual(value1 as T[][], value2 as T[][]);
  }
  if (Array.isArray(value1[0])) {
    // if value1 is hybrid, then return true if every member of value2 is in some member of value1
    return (value2 as T[]).every(c => value1.some(set => (set as T[]).includes(c)));
  }
  if (Array.isArray(value2[0])) {
    // if value1 is not hybrid, then return true if every member of value2 shares a member with value1
    // return (value2 as T[][]).every(set => set.some(c => (value1 as T[]).includes(c)));
    return (value2 as T[][]).every(set => listShare(set, value1 as T[]));
  }
  return contains(value1 as string[], value2 as string[]);
};

/**
 * Checks whether one list contains another list as a strict subset (i.e. doesn't equal it). Ignores order, but can handle duplicates
 * @param value1 List to check whether it contains the other list
 * @param value2 List to check whether it is contained by the other list
 * @returns
 */
export const containsAsSubset = <T = any>(value1: T[], value2: T[]): boolean => {
  const superset = [...value1];
  const subset = [...value2];
  for (let i = 0; i < subset.length; i++) {
    const index = superset.indexOf(subset[i]);
    if (index == -1) {
      return false;
    }
    superset.splice(index, 1);
  }
  return Boolean(superset.length);
};

/**
 * Checks whether a list contains some list from a list of lists.
 * @param value1 List to check whether it contains some list
 * @param value2 List of lists to check whether it has a member that is contained by the list
 * @returns
 */
export const containsSome = <T = any>(value1: T[], value2: T[][]): boolean =>
  value2.some(value => contains(value1, value));

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

export const textListIncludes = (value1: string[] | undefined, value2: string): boolean =>
  Boolean(value1?.some(text => textSearchIncludes(text, value2)));
export const textListIncludesEvery = (value1: string[] | undefined, value2: string[]): boolean =>
  value2.every(value => value1?.some(text => textSearchIncludes(text, value)));
export const textListEquals = (value1: string[], value2: string) =>
  value1.some(text => textEquals(text, value2));
export const textListShares = (
  value1: string[] | undefined,
  value2: string[] | undefined
): boolean => Boolean(value1?.some(text1 => value2?.some(text2 => textEquals(text1, text2))));

export const listsExactlyEqual = <T = any>(
  value1: T[],
  value2: T[],
  equals: (mem1: T, mem2: T) => boolean = (mem1, mem2) => mem1 === mem2
): boolean => {
  if (value1?.length != value2?.length || value1 == undefined || value2 == undefined) {
    return false;
  }
  return value1.every((value, i) => equals(value, value2[i]));
};

/**
 * Checks whether two arbitrary values are exactly equal.
 */
export const arbAreEqual = <T = any>(value1: T, value2: T): boolean => {
  if (typeof value1 != typeof value2) {
    return false;
  }
  if (typeof value1 != 'object' || typeof value2 != 'object') {
    return value1 === value2;
  }
  if (value1 == null || value2 == null) {
    return value1 === value2;
  }
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return listsExactlyEqual(value1, value2, arbAreEqual);
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
