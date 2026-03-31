/**
 * Preps text for equality checks that ignore formatting
 * @param text text to remove formatting from
 * @returns clean text
 */
// export const textPrep = (text: string) => {
//   return text
//     .toLowerCase()
//     .replaceAll('\\n', '')
//     .replaceAll('\\(', '(')
//     .replaceAll('\\)', ')');
// };
/**
 * Convert markdown text to plaintext by stripping formatting characters
 * Handles **bold**, *italic*, ~~strikethrough~~, and respects escaped characters
 * @param text - The markdown text to convert to plaintext
 * @returns Plaintext version with formatting removed
 */
export const textPrep = (text: string): string => {
  if (!text) return '';

  let result = '';
  let i = 0;
  const len = text.length;

  while (i < len) {
    // Check for escaped characters
    if (text[i] === '\\' && i + 1 < len && '[*_~]'.includes(text[i + 1])) {
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

    // Check for bold (__text__)
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

  return result;
};
/**
 * Checks whether search text is in text from a card
 * @param cardText text from the card
 * @param searchText text to search for
 * @returns whether there is a match
 */
export const textSearchIncludes = (cardText: string, searchText: string) => {
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
  return (
    cardText.toLowerCase() == searchText.toLowerCase() || textPrep(cardText) == textPrep(searchText)
  );
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
