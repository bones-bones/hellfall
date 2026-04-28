/**
 * Preps text for equality checks that ignore formatting
 * @param text text to remove formatting from
 * @returns clean text
 */
// export const textPrep = (text: string) => {
//   return text
//     .toLowerCase()
//     .replaceAll(/\\[n*_~]/g, '')
//     .replaceAll('\\(', '(')
//     .replaceAll('\\)', ')');
// };
/**
 * Convert markdown text to plaintext by stripping formatting characters
 * Handles **bold**, *italic*, ~~strikethrough~~, and respects escaped characters
 * @param text - The markdown text to convert to plaintext
 * @returns Plaintext version with formatting removed
 */
export const textPrep = (text: string, preserveCaps: boolean = false): string => {
  if (!text) return '';

  let result = '';
  let i = 0;
  const len = text.length;

  while (i < len) {
    // Check for escaped characters
    if (text[i] === '\\' && i + 1 < len && '[*_~()]'.includes(text[i + 1])) {
      // Remove the backslash and keep the next character as literal
      result += text[i + 1];
      i += 2;
      continue;
    }

    // Check for bold (**text**)
    if (text[i] === '*' && text[i + 1] === '*' && i + 2 < len) {
      let end = text.indexOf('**', i + 2);
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
          result += textPrep(content);
          i = end + 2;
          continue;
        }
      }
    }

    // Check for underline (__text__)
    if (text[i] === '_' && text[i + 1] === '_' && i + 2 < len) {
      let end = text.indexOf('__', i + 2);
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
          result += textPrep(content);
          i = end + 2;
          continue;
        }
      }
    }

    // Check for strikethrough (~~text~~)
    if (text[i] === '~' && text[i + 1] === '~' && i + 2 < len) {
      let end = text.indexOf('~~', i + 2);
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
          result += textPrep(content);
          i = end + 2;
          continue;
        }
      }
    }

    // Check for italic (*text*)
    if (text[i] === '*' && (i + 1 >= len || text[i + 1] !== '*')) {
      let end = text.indexOf('*', i + 1);
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
          result += textPrep(content);
          i = end + 1;
          continue;
        }
      }
    }

    // Check for italic (_text_)
    if (text[i] === '_' && (i + 1 >= len || text[i + 1] !== '_')) {
      let end = text.indexOf('_', i + 1);
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
          result += textPrep(content);
          i = end + 1;
          continue;
        }
      }
    }

    // Regular character
    result += text[i];
    i++;
  }

  const normalized = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (preserveCaps) {
    return normalized;
  }
  return normalized.toLowerCase();
};
/**
 * Checks whether search text is in text from a card
 * @param cardText text from the card
 * @param searchText text to search for
 * @returns whether there is a match
 */
export const textSearchIncludes = (cardText: string, searchText: string) => {
  if (!!cardText != !!searchText) {
    return false
  }
  return (
    cardText.toLowerCase().includes(searchText.toLowerCase()) ||
    textPrep(cardText).includes(textPrep(searchText))
  );
};
/**
 * Checks whether search text equals text from a card
 * @param cardText text from the card
 * @param searchText text to search for
 * @returns whether they are equal
 */
export const textEquals = (cardText: string, searchText: string) => {
  if (!!cardText != !!searchText) {
    return false
  }
  return (
    cardText.toLowerCase() == searchText.toLowerCase() || textPrep(cardText) == textPrep(searchText)
  );
};

/**
 * Splits a string into a list of strings based on parentheses that alternate between a chunk wrapped in parentheses and one that isn't. Will ignore \( and \). Correctly handles nested parens.
 * @param text
 * @returns
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
  return splitParens(text)
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
  if (
    ['HC6: ', 'HC7: ', 'HC8: ', 'HCK: ', 'HKL: ', 'HC9: ', 'CDC: ', 'HCJ: '].includes(
      name.slice(0, 5)
    )
  ) {
    return name.slice(5);
  } else {
    return name;
  }
};

/**
 * Preps a name for export to draftmancer/cockatrice
 * @param name name to prep
 * @returns prepped name
 */
export const toExportName = (name: string) => {
  return name.replaceAll(/[[{]/g, '(').replaceAll(/[\]}]/g, ')').replaceAll('\\', '');
};

/**
 * Converts mana from import from scryfall
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
  ['BB/P', 'B}{B'],
  ['UU/P', 'U}{U'],
  ['TEMU', '0'],
  ['G/Yellow/P', 'G'],
  ['W/C/G', 'G/W'],
  ['U/W', 'W/U'],
  ['G/R', 'R/G'],
  ['W/U/B/R/G', '1'],
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
  ['Sacrifice a creature:', '0'],
  ['600000', 'G}{G}{G}{G}{G}{G'],
  [/^H\/([WUBRGC](?:\/[WUBRGC])?)$/, '$1/P'],
  [/^([WUBRGC]\/[WUBRGC])\/[WUBRGC]$/, '$1'],
  [/^H\/\w+$/, 'C/P'],
  [/^Chris|Lois|Stewie|Meg|Peter$/, '0'],
  ['Blood', '0'],
  ['Discard your hand/RR', 'R}{R'],
  [/^2\/(?![WUBRG]$)\w+$/, '2'],
  [/^[34]\/([WUBRGC])$/, '$1'],
  [/^([0134])\/\w+$/, '$1'],
  ['5/∞', '5'],
  ['∞/U', 'U'],
  [/^Yellow|Brown|Orange|Pink$/, '1'],
];
/**
 * Preps text containing mana for export to draftmancer/cockatrice
 * @param text text to prep
 * @param isCost whether this is a mana cost or not
 * @returns prepped text
 */
export const toExportMana = (text: string, isCost: boolean = false) => {
  if (text.includes('{')) {
    return text
      .split(/({[\w -\.\?\/]+})/g)
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
