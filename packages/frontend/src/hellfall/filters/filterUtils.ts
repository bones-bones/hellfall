import { cardFilter, looseOpType, opType, shorthandType } from './types';

const invertedOps: Record<looseOpType, looseOpType> = {
  '<': '>=',
  '<=': '>',
  '=': '!=',
  ':': '!:',
  '>=': '<',
  '>': '<=',
  '!=': '=',
  '!:': ':',
};

export const invertOp = (op: looseOpType) => {
  return invertedOps[op];
};

export const getActualOp = (operator: looseOpType, defaultOp: opType): opType => {
  if (operator == ':') {
    return defaultOp;
  }
  if (operator == '!:') {
    return invertOp(defaultOp) as opType;
  }
  return operator;
};
export const opIsNegative = (op: looseOpType) => ['<', '>', '!=', '!:'].includes(op);
export const opToNot = (op: looseOpType) => (opIsNegative(op) ? 'not' : '');
export const opToDont = (op: looseOpType) => (opIsNegative(op) ? "don't" : '');
export const opToIncludeSingularRecord: Record<opType, string> = {
  '<': 'excludes',
  '<=': 'excludes or equals',
  '=': 'equals',
  '>=': 'includes',
  '>': "includes but doesn't equal",
  '!=': "doesn't equal",
};
export const opToIncludeSingular = (op: opType, value: string, invert?: boolean) => {
  return `${opToIncludeSingularRecord[(invert ? invertOp(op) : op) as opType]} "${value}"`;
};
export const opToIncludePluralRecord: Record<opType, string> = {
  '<': 'exclude',
  '<=': 'exclude or include exactly',
  '=': 'include exactly',
  '>=': 'include',
  '>': 'include but not exactly',
  '!=': 'exclude exactly',
};
export const opToIncludePlural = (op: opType, value: string, invert?: boolean) => {
  return `${opToIncludePluralRecord[(invert ? invertOp(op) : op) as opType]} "${value}"`;
};
export const opToTaggedRecord: Record<opType, string> = {
  '<': 'not tagged',
  '<=': 'not tagged or tagged exactly',
  '=': 'tagged exactly',
  '>=': 'tagged',
  '>': 'tagged but not exactly',
  '!=': 'not tagged exactly',
};
export const opToTagged = (op: opType, value: string, invert?: boolean) => {
  return `${opToTaggedRecord[(invert ? invertOp(op) : op) as opType]} "${value}"`;
};

export const opToMRecord: Record<opType, string> = {
  '<': 'monocolored',
  '<=': 'any color',
  '=': 'multicolored',
  '>=': 'multicolored',
  '>': 'supermulticolored',
  '!=': 'monocolored',
};
export const opToCRecord: Record<opType, string> = {
  '<': 'negative color',
  '<=': 'colorless',
  '=': 'colorless',
  '>=': 'any color',
  '>': 'colored',
  '!=': 'colored',
};

export const opToShorthand = (op: opType, value: shorthandType) => {
  return value == 'c' ? opToCRecord[op] : opToMRecord[op];
};
/**
 * To use in filters when need to check a function with one value
 * @param op operation to use
 * @param func function
 * @param value the value to check
 * @returns
 */
export const funcOp = <T>(op: opType, func: (value: T) => boolean, value: T) => {
  switch (op) {
    case '<':
      return !func(value);
    case '<=':
      return func(value);
    case '=':
      return func(value);
    case '>=':
      return func(value);
    case '>':
      return !func(value);
    case '!=':
      return !func(value);
  }
};
/**
 * To use in filters when need to check a function with two values
 * @param op operation to use
 * @param func function
 * @param value1 the first value to check
 * @param value2 the second value to check
 * @returns
 */
export const funcOpTwo = <T, S>(
  op: opType,
  func: (value1: T, value2: S) => boolean,
  value1: T,
  value2: S
) => {
  switch (op) {
    case '<':
      return !func(value1, value2);
    case '<=':
      return func(value1, value2);
    case '=':
      return func(value1, value2);
    case '>=':
      return func(value1, value2);
    case '>':
      return !func(value1, value2);
    case '!=':
      return !func(value1, value2);
  }
};

/**
 * To use in filters when need to check an inclusion function and an equality function
 * @param op operation to use
 * @param includes inclusion function
 * @param equals equality function
 * @param value1 the first value to check
 * @param value2 the second value to check
 * @returns
 */
export const includeEqualsOp = <T, S>(
  op: opType,
  includes: (value1: T, value2: S) => boolean,
  equals: (value1: T, value2: S) => boolean,
  value1: T,
  value2: S
) => {
  switch (op) {
    case '<':
      return !includes(value1, value2) && !equals(value1, value2);
    case '<=':
      return !includes(value1, value2) || equals(value1, value2);
    case '=':
      return includes(value1, value2) && equals(value1, value2);
    case '>=':
      return includes(value1, value2) || equals(value1, value2);
    case '>':
      return includes(value1, value2) && !equals(value1, value2);
    case '!=':
      return !includes(value1, value2) || !equals(value1, value2);
  }
};
/**
 * To use in filters when need to check a containment function
 * @param op operation to use
 * @param includes inclusion function
 * @param equals equality function
 * @param value1 the first value to check
 * @param value2 the second value to check
 * @returns
 */
export const containsOp = <T>(
  op: opType,
  contains: (value1: T, value2: T) => boolean,
  value1: T,
  value2: T
) => {
  switch (op) {
    case '<': {
      return !contains(value1, value2) && contains(value2, value1);
    }
    case '<=': {
      return contains(value2, value1);
    }
    case '=': {
      return contains(value1, value2) && contains(value2, value1);
    }
    case '>=': {
      return contains(value1, value2);
    }
    case '>': {
      return contains(value1, value2) && !contains(value2, value1);
    }
    case '!=': {
      return !contains(value1, value2) || !contains(value2, value1);
    }
  }
};

const share = (value1: string | string[], value2: string | string[]) => {
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return value1.some(value => value2.includes(value));
  } else if (Array.isArray(value1) && typeof value2 == 'string') {
    return value1.includes(value2);
  } else if (Array.isArray(value2) && typeof value1 == 'string') {
    return value2.includes(value1);
  } else {
    return value1 == value2;
  }
};

/**
 * To use in filters when need to check if two lists share a value
 * @param op operation to use
 * @param value1 the first value to check
 * @param value2 the second value to check
 * @returns
 */
export const shareOp = (op: opType, value1: string | string[], value2: string | string[]) => {
  switch (op) {
    case '<':
      return !share(value1, value2);
    case '<=':
      return share(value1, value2);
    case '=':
      return share(value1, value2);
    case '>=':
      return share(value1, value2);
    case '>':
      return !share(value1, value2);
    case '!=':
      return !share(value1, value2);
  }
};

export const equals = <T = any>(value1: T | T[], value2: T | T[]) => {
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return (
      value1.every(value => value2.includes(value)) && value2.every(value => value1.includes(value))
    );
  } else if (Array.isArray(value1)) {
    return value1.every(value => value == value2);
  } else if (Array.isArray(value2)) {
    return value2.every(value => value == value1);
  } else {
    return value1 == value2;
  }
};
