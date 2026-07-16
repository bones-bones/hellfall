import { allSetsList } from '@hellfall/shared/types';

/**
 * Normalize text (remove accents and replace smart quotes with normal quotes)
 * @param text text to normalize
 */
export const normalizeText = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll(/[‘’]/g, "'")
    .replaceAll(/[“”]/g, '"')
    .replaceAll(/ {2,}/g, ' ');

/**
 * Format smart quotes
 * @param text - The markdown text to convert to plaintext
 * @returns Text with smart quotes inserted
 */
export const formatQuotes = (text: string): string => {
  const result: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const prevChar = result.at(-1) ?? '';
    const nextChar = text[i + 1] ?? '';
    if (char === '"') {
      const isOpening =
        i === 0 || /[\s([{ “‘]/.test(prevChar) || (prevChar == 'n' && result.at(-2) == '\\');
      if (isOpening) {
        result.push('“');
      } else {
        result.push('”');
      }
    } else if (char === "'") {
      const isOpening =
        i === 0 || /[\s([{ “‘]/.test(prevChar) || (prevChar == 'n' && result.at(-2) == '\\');
      if (isOpening) {
        result.push('‘');
      } else {
        result.push('’');
      }
    } else if (char === '-') {
      const isMinus =
        i === 0 ||
        /[/([{ ]/.test(prevChar) ||
        (prevChar == 'n' && result.at(-2) == '\\') ||
        (/[0-9]/.test(prevChar) && /[0-9]/.test(nextChar));
      if (isMinus) {
        result.push('–');
      } else {
        result.push(char);
      }
    } else {
      result.push(char);
    }
  }
  return result.join('');
};

/**
 * Convert markdown text to plaintext by stripping formatting characters
 * Handles **bold**, *italic*, ~~strikethrough~~, and respects escaped characters
 * @param text - The markdown text to convert to plaintext
 * @returns Plaintext version with formatting removed
 */
export const textPrep = (text: string, preserveCaps: boolean = false): string => {
  if (!text) return '';
  const result: string[] = [];
  let i = 0;
  const len = text.length;
  while (i < len) {
    // Check for escaped characters
    if (text[i] === '\\' && i + 1 < len && '[*_~()]'.includes(text[i + 1])) {
      // Remove the backslash and keep the next character as literal
      result.push(text[i + 1]);
      i += 2;
      continue;
    }

    // Check for bold (**text**)
    if (text[i] === '*' && text[i + 1] === '*' && i + 2 < len) {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        // Check if the opening is escaped
        let isEscaped = false;
        let backslashCount = 0;
        let pos = i - 1;
        while (pos >= 0 && text[pos] === '\\') {
          backslashCount++;
          pos--;
        }
        isEscaped = backslashCount % 2 === 1;

        if (!isEscaped) {
          // Extract the content between ** and **
          const content = text.substring(i + 2, end);
          // Recursively process content for nested formatting
          result.push(textPrep(content));
          i = end + 2;
          continue;
        }
      }
    }

    // Check for underline (__text__)
    if (text[i] === '_' && text[i + 1] === '_' && i + 2 < len) {
      const end = text.indexOf('__', i + 2);
      if (end !== -1) {
        let isEscaped = false;
        let backslashCount = 0;
        let pos = i - 1;
        while (pos >= 0 && text[pos] === '\\') {
          backslashCount++;
          pos--;
        }
        isEscaped = backslashCount % 2 === 1;

        if (!isEscaped) {
          const content = text.substring(i + 2, end);
          result.push(textPrep(content));
          i = end + 2;
          continue;
        }
      }
    }

    // Check for strikethrough (~~text~~)
    if (text[i] === '~' && text[i + 1] === '~' && i + 2 < len) {
      const end = text.indexOf('~~', i + 2);
      if (end !== -1) {
        let isEscaped = false;
        let backslashCount = 0;
        let pos = i - 1;
        while (pos >= 0 && text[pos] === '\\') {
          backslashCount++;
          pos--;
        }
        isEscaped = backslashCount % 2 === 1;

        if (!isEscaped) {
          const content = text.substring(i + 2, end);
          result.push(textPrep(content));
          i = end + 2;
          continue;
        }
      }
    }

    // Check for italic (*text*)
    if (text[i] === '*' && (i + 1 >= len || text[i + 1] !== '*')) {
      const end = text.indexOf('*', i + 1);
      if (end !== -1) {
        let isEscaped = false;
        let backslashCount = 0;
        let pos = i - 1;
        while (pos >= 0 && text[pos] === '\\') {
          backslashCount++;
          pos--;
        }
        isEscaped = backslashCount % 2 === 1;

        if (!isEscaped) {
          const content = text.substring(i + 1, end);
          result.push(textPrep(content));
          i = end + 1;
          continue;
        }
      }
    }

    // Check for italic (_text_)
    if (text[i] === '_' && (i + 1 >= len || text[i + 1] !== '_')) {
      const end = text.indexOf('_', i + 1);
      if (end !== -1) {
        let isEscaped = false;
        let backslashCount = 0;
        let pos = i - 1;
        while (pos >= 0 && text[pos] === '\\') {
          backslashCount++;
          pos--;
        }
        isEscaped = backslashCount % 2 === 1;

        if (!isEscaped) {
          const content = text.substring(i + 1, end);
          result.push(textPrep(content));
          i = end + 1;
          continue;
        }
      }
    }

    // Regular character
    result.push(text[i]);
    i++;
  }

  const normalized = normalizeText(result.join(''));
  if (preserveCaps) {
    return normalized;
  }
  return normalized.toLowerCase();
};
/**
 * Checks whether search text is contained in text from a card
 * @param cardText text from the card
 * @param searchText text to search for
 * @returns whether there is a match
 */
export const textContains = (cardText?: string, searchText?: string) => {
  if (!!cardText != !!searchText) {
    return false;
  }
  return Boolean(
    searchText &&
      cardText &&
      (cardText.toLowerCase().includes(searchText.toLowerCase()) ||
        textPrep(cardText).includes(textPrep(searchText)))
  );
};
/**
 * Checks whether search text equals text from a card
 * @param cardText text from the card
 * @param searchText text to search for
 * @returns whether they are equal
 */
export const textEquals = (cardText?: string, searchText?: string) => {
  if (!!cardText != !!searchText) {
    return false;
  }
  return (
    cardText?.toLowerCase() == searchText?.toLowerCase() ||
    textPrep(cardText ?? '') == textPrep(searchText ?? '')
  );
};

/**
 * Splits a string into a list of strings based on parentheses that alternate
 * between a chunk wrapped in parentheses and one that isn't. Will ignore \( and \).
 * Correctly handles nested parens.
 * @param text text to split
 */
export const splitParens = (text: string) => {
  const chunks: string[] = [];
  let parenLevel = 0;
  let chunkStart = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] == '(' && (i == 0 || text[i - 1] != '\\')) {
      if (parenLevel == 0 && i > 0) {
        chunks.push(text.slice(chunkStart, i));
        chunkStart = i;
      }
      parenLevel++;
    } else if (text[i] == ')' && parenLevel > 0 && text[i - 1] != '\\') {
      parenLevel--;
      if (parenLevel == 0) {
        chunks.push(text.slice(chunkStart, i + 1));
        chunkStart = i + 1;
      }
    }
  }
  if (chunkStart < text.length) {
    chunks.push(text.slice(chunkStart));
  }
  return chunks;
};

/**
 * formats text containing parens so that it can handle newlines
 * @param text text containing parens
 * @returns correctly formatted text
 */
export const formatParens = (text: string) => {
  return splitParens(formatQuotes(text))
    .map(parenText => {
      if (parenText.at(0) != '(' && parenText.at(-1) != ')') {
        return parenText;
      } else {
        return parenText
          .split('\\n')
          .map(line => '*' + line + '*')
          .join('\\n');
      }
    })
    .join('')
    .replaceAll('\\(', '(')
    .replaceAll('\\)', ')');
};

/**
 * Gets the non-masterpiece version of a masterpiece name.
 * @param name Name to strip
 * @returns stripped name
 */
export const stripMasterpiece = (name: string) => {
  const start = allSetsList.find(set => name.startsWith(`${set}: `));
  return start ? name.slice(start.length + 2) : name;
};
/**
 * Gets the masterpiece set code of a masterpiece name.
 * @param name Name to get masterpiece from
 * @returns masterpiece code
 */
export const getMasterpiece = (name: string) => {
  const start = allSetsList.find(set => name.startsWith(`${set}: `));
  return `${start}: `;
};

/**
 * Gets the bare version of a name that ends with a set code.
 * @param name Name to strip
 * @returns stripped name
 */
export const stripSetCode = (name: string) => {
  const ending = [...allSetsList, 'HC'].find(set => name.endsWith(` (${set})`));
  return ending ? name.slice(0, -ending.length - 3) : name;
};

/**
 * Gets the set code from a name that ends with a set code.
 * @param name Name to strip
 * @returns stripped name
 */
export const getSetCode = (name: string) => {
  const ending = [...allSetsList, 'HC'].find(set => name.endsWith(` (${set})`));
  return ending ? ` (${ending})` : undefined;
};

const hardCardNames: string[] = [
  'Crypt of u/Em9500',
  '1d6',
  'Avatar of BallsJr123',
  'Sekiro for the PS4',
  'Avatar of Discord v2',
  'That One Time in WW1',
  'Plagiarism by doomclaw9',
  'Carrion Feeder from MH8',
];

export const hardTokenIds: string[] = [
  'Clue© 19861',
  '+21',
  '+41',
  'AKKI-471',
  'Bolt M41',
  'Rock 191',
  "Baldur's Gate 31",
];

/**
 * Parses the name, count, and base for a related card
 * @param oldName name from the google sheet
 */
export const parseRelatedReferenceName = (
  oldName: string
): { name: string; count?: string; base: string; shouldUseBase: boolean } => {
  const match = oldName.match(/(?<name>.*)(?<count>\*(?:\d+|x))$/);
  const name = match?.groups?.name ?? oldName;
  const count = match?.groups?.count;
  const base = hardTokenIds.includes(name) ? name.slice(0, -1) : name.replace(/\d+$/, '');
  const shouldUseBase =
    hardTokenIds.includes(name) ||
    (/\d/.test(name.at(-1)!) &&
      !hardCardNames.includes(name) &&
      base.length > 0 &&
      ![' ', '-', '^', '.', '/', '+', ',', "'"].includes(base.at(-1)!));
  return { name, count, base, shouldUseBase };
};

/**
 * Preps a name for export to draftmancer/cockatrice
 * @param name name to prep
 * @returns prepped name
 */
export const toExportName = (name: string) => {
  const retName = name
    .replaceAll(/[[{]/g, '(')
    .replaceAll(/[\]}]/g, ')')
    .replaceAll(/\\/g, '')
    // .replaceAll(/[\\.]/g, '')
    .replaceAll(/\((\d+)\)/g, '$1');
  return retName.slice(0, 2) == '  ' ? retName.trimStart() : retName;
};

/**
 * Strips single slashes from text (for the purposes of exporting to draftmancer
 * so that it imports correctly into cockatrice)
 * @param text text to strip single slashes from
 */
export const stripSingleSlashes = (text: string) => {
  return text
    .replaceAll(/([^/])\/([^/])/g, '$1$2')
    .replaceAll('|', '')
    .trim();
};
/**
 * Converts mana from import from scryfall (switches notation for phyrexian mana)
 * @param text text to import
 * @returns imported text
 */
export const fromImportMana = (text: string) => {
  if (text.includes('/P}')) {
    return text
      .split(/({\w+(?:\/\w+)?\/P})/g)
      .map(subtext => (subtext.slice(-3) == '/P}' ? '{H/' + subtext.slice(1, -3) + '}' : subtext))
      .join('');
  } else {
    return text;
  }
};

const costSubstitutes: [RegExp | string, string][] = [
  ['?', '0'],
  ['9/3', '3'],
  ['-1', '0'],
  ['Orange/U', 'U'],
  ['Pickle', '0'],
  ['U/BB', 'U/B'],
  ['TEMU', '0'],
  ['G/Yellow/P', 'G'],
  ['W/C/G', 'G/W'],
  ['U/W', 'W/U'],
  [/^([WUBRGC])\1\/P$/, '$1}{$1'],
  [/^P\/([WUBRGC])\1$/, '$1}{$1'],
  ['G/R', 'R/G'],
  ['W/U/B/R/G', '1'],
  ['W/U/P/B/R/G', '1'],
  ['G/X', 'X'],
  ['W/Y', 'Y'],
  ['U/Z', 'Z'],
  ['B/W', 'W/B'],
  ['B/U', 'U/B'],
  ['27', '20}{7'],
  ['69', '20}{20}{20}{9'],
  ['orangeG', 'G'],
  ['brownG', 'G'],
  ['Cross', 'W'],
  ['G/G', 'G'],
  ['U/U', 'U'],
  ['P/W', 'W'],
  ['P/G', 'G'],
  ['UFO', '1'],
  ['HU', 'U'],
  ['HG', 'G'],
  ['HB', 'B'],
  ['antiU', '1'],
  ['Sacrifice a creature:', '0'],
  ['600000', 'G}{G}{G}{G}{G}{G'],
  [/^H\/([WUBRGC](?:\/[WUBRGC])?)$/, '$1/P'],
  [/^([WUBRGC]\/[WUBRGC])\/[WUBRGC]$/, '$1'],
  [/^H\/\w+$/, 'C/P'],
  [/^Chris|Lois|Stewie|Meg|Peter$/, '0'],
  ['Blood', '0'],
  ['Discard your hand/RR', 'R}{R'],
  [/^2\/(?![WUBRG]$)\w+$/, '2'],
  [/^[3458]\/([WUBRGC])$/, '$1'],
  [/^([0134])\/\w+$/, '$1'],
  ['5/∞', '5'],
  ['∞/U', 'U'],
  [/^Yellow|Brown|Orange|Pink$/, '1'],
];

/**
 * Preps text containing mana for export to draftmancer
 * @param text text to prep
 * @param isCost whether this is a mana cost or not
 * @returns prepped text
 */
export const toExportMana = (text: string, isCost: boolean = false) => {
  if (text.includes('{')) {
    return text
      .split(/({[\w -.?/]+})/g)
      .map(subtext => {
        if (!subtext.includes('{')) {
          return subtext;
        } else {
          for (const [rule, sub] of costSubstitutes) {
            if (typeof rule == 'string') {
              if (subtext.slice(1, -1) == rule) {
                return isCost ? '{' + sub + '}' : subtext; //.slice(1,-1)
              }
            } else {
              if (rule.test(subtext.slice(1, -1))) {
                return isCost || sub == '$1/P'
                  ? '{' + subtext.slice(1, -1).replace(rule, sub) + '}'
                  : subtext; //.slice(1,-1)
              }
            }
          }
          return subtext;
        }
      })
      .join('')
      .replaceAll(':[', ':(');
  } else {
    return text.replaceAll(':[', ':(');
  }
};
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/**
 * Checks whether a string is a valid v4 uuid
 * @param uuid string to check
 */
export const isValidV4UUID = (uuid: string): boolean => uuidRegex.test(uuid);

/**
 * Replaces the intrinsic {@linkcode unescape} function (which is deprecated)
 * @param text text to unescape
 */
export const unescapeBase64 = (text: string) =>
  text.replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));

/**
 * Checks if text is a quoted string (i.e. starts and ends with quotation marks)
 * @param text text to check
 */
export const textIsQuote = (text: string) =>
  text.length > 1 && text[0] == text.at(-1) && ['"', "'"].includes(text[0]) && text.at(-2) != '\\';

/**
 * Strips quotes from start and end of text if it's a quoted string (i.e. starts and ends with quotation marks)
 * @param text text to strip
 */
export const stripQuotes = (text: string) => (textIsQuote(text) ? text.slice(1, -1) : text);

/**
 * Unescapes and strips text so that it can be used in comparisons
 * @param text text to unescape
 * @param keepDashes whether to keep dashes (for correct handling of text fields)
 */
export const unescapeText = (text: string, keepDashes?: boolean) => {
  const strippedText = textIsQuote(text) || keepDashes ? text : text.replaceAll(/[_-]/g, '');
  return strippedText
    .toLowerCase()
    .replaceAll(/^['"]/g, '')
    .replaceAll(/(?<!\\)['"]/g, '')
    .replaceAll(/\\(['"])/g, '$1');
};

/**
 * Fixes a value by unescaping all text; can go inside arrays, but not other objects
 * @template T type of the value to fix
 * @param value value to fix
 * @param option how to fix the text; fix does unescape; keep keeps dashes;
 * others just do the corresponding text transformation
 */
export const fixValue = <T>(value: T, option: 'upper' | 'lower' | 'fix' | 'keep' = 'fix'): T => {
  if (typeof value == 'string') {
    switch (option) {
      case 'fix':
        return unescapeText(value) as T;
      case 'keep':
        return unescapeText(value, true) as T;
      case 'upper':
        return value.toUpperCase() as T;
      case 'lower':
        return value.toLowerCase() as T;
    }
  }
  if (Array.isArray(value)) {
    return value.map(e => fixValue(e, option)) as T;
  }
  return value;
};
