/* We're not using direct validation on this because we want to save overhead */
export type IsoDate = string;

const directDateRegex = /^20\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const convertibleDateRegex =
  /^(?<yyyy>20\d{2})-?(?<mm>1[0-2]|0?[1-9])?-?(?<dd>[12]\d|3[01]|0?[1-9])?$/;
/**
 * Converts user-inputted text into an iso date, or returns undefined if the text is invalid
 * @param text text to format
 */
export const toIsoDate = (text: string): IsoDate | undefined => {
  if (directDateRegex.test(text)) {
    return text;
  }
  const groups = text.match(convertibleDateRegex);
  const year = groups?.groups?.yyyy;
  if (!year) {
    return;
  }
  const month = groups?.groups?.mm;
  const day = groups?.groups?.dd;
  return `${year}${
    month ? `-${month.padStart(2, '0')}${day ? `-${day.padStart(2, '0')}` : ''}` : ''
  }`;
};

/**
 * Sorts two iso dates. Can handle incomplete dates.
 * @param date1 first date to sort
 * @param date2 second date to sort
 * @param dirMult whether to reverse the sort (if `-1`)
 */
export const sortDates = (date1: IsoDate, date2: IsoDate, dirMult: -1 | 1 = 1) => {
  if (date1.length == date2.length) {
    return date1.localeCompare(date2) * dirMult;
  }
  const len = Math.min(date1.length, date2.length);
  return date1.slice(0, len).localeCompare(date2.slice(0, len)) * dirMult;
};
