/**
 * Preps text for equality checks that ignore formatting
 * @param text text to remove formatting from
 * @returns clean text
 */
export const textPrep = (text: string) => {
  return text
    .toLowerCase()
    .replaceAll(/\\[n*_~]/g, '')
    .replaceAll('\\(', '(')
    .replaceAll('\\)', ')');
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
    .join('');
};
