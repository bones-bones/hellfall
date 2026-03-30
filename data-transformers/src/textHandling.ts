/**
 * Preps text for equality checks that ignore formatting
 * @param text text to remove formatting from
 * @returns clean text
 */
export const textPrep = (text: string) => {
  return text
    .toLowerCase()
    .replaceAll(/\\[n*]/g, '')
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
