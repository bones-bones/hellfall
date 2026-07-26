import { pipMap } from '@hellfall/shared/utils';
import { isSafePattern } from 'redos-detector';

const ptEquivs = ['\\?', 'N', 'X', 'Y', 'Z', '\\*', '∞'].join('|');
const numPattern = '\\d*\\.?\\d+';
const anyValue = `(${ptEquivs}|${numPattern})`;
const ptRegex = new RegExp(`${anyValue}/${anyValue}`);
const ppRegex = new RegExp(`\\+${anyValue}/\\+${anyValue}`);
const mmRegex = new RegExp(`\\-${anyValue}/\\-${anyValue}`);

const customEscapeList = [
  '\\sm',
  '\\sc',
  '\\ss',
  '\\smr',
  '\\smh',
  '\\smp',
  '\\smg',
  '\\sml',
  '\\spt',
  '\\spp',
  '\\smm',
] as const;
type customEscape = (typeof customEscapeList)[number];

const isCustomEscape = (value: any): value is customEscape => customEscapeList.includes(value);

const customRegexes: Record<customEscape, RegExp> = {
  '\\sm': pipMap.manaSymbolRegex,
  '\\sc': pipMap.coloredSymbolRegex,
  '\\ss': pipMap.anySymbolRegex,
  '\\smr': pipMap.repeatedSymbolRegex,
  '\\smh': pipMap.hybridSymbolRegex,
  '\\smp': pipMap.phyrexianSymbolRegex,
  '\\smg': pipMap.genericSymbolRegex,
  '\\sml': pipMap.colorlessSymbolRegex,
  '\\spt': ptRegex,
  '\\spp': ppRegex,
  '\\smm': mmRegex,
};

const validEscapes = '^$.|?*+-()[]{}\\bBnsSdDwW';
const unicodeTest = /[0-9A-F]{4}/i;
/**
 * Replaces custom regexes and also validates escape sequences
 * @param text text to use
 * @returns undefined if there are invalid escape sequences and a string for the regex otherwise
 */
const replaceCustomRegexes = (text: string): string | undefined => {
  const textArr = text.split('');
  // the number of replacements made; used for whether to use the original string and for the groups
  let replaceNum = 0;
  for (let i = 0; i < textArr.length; i++) {
    // If the character isn't the start of an escape sequence, just skip it
    if (textArr[i] != '\\') continue;
    // Look at the next 4 characters and see if they are an escape sequence
    const esc4 = text.slice(i, i + 4);
    if (isCustomEscape(esc4)) {
      replaceNum++;
      if (esc4 == '\\smr') {
        // If the custom escape matches two in a row, use a named group to match it
        textArr[i] = `(?<rep_${replaceNum}>${customRegexes[esc4].source})\\k<rep_${replaceNum}>`;
      } else {
        // otherwise just pull the source directly
        textArr[i] = customRegexes[esc4].source;
      }
      // blank out the other characters of the escape to preserve order for slicing
      textArr[i + 1] = '';
      textArr[i + 2] = '';
      // If `esc4.length == 3`, it's still fine to do this, since that only happens when
      // `i + 3 == textArr.length`, so it just inserts an extra empty string at the end of the array
      textArr[i + 3] = '';
      continue;
    }
    // Look at the next 3 characters and see if they are an escape sequence
    const esc3 = text.slice(i, i + 3);
    if (isCustomEscape(esc3)) {
      replaceNum++;
      // pull the source directly
      textArr[i] = customRegexes[esc3].source;
      // blank out the other characters of the escape to preserve order for slicing
      textArr[i + 1] = '';
      textArr[i + 2] = '';
      continue;
    }
    const first = textArr[i + 1];
    // if the next character is `u`, make sure that it's a valid unicode escape
    if (first == 'u' && unicodeTest.test(text.slice(i + 2, i + 6))) continue;
    // if the escape is at the end of the string or if the escape is invalid, return undefined
    if (first == undefined || !validEscapes.includes(first)) {
      return undefined;
    }
    i++;
  }
  // if nothing got replaced, just return the original text
  return replaceNum ? textArr.join('') : text;
};

/**
 * Gets the error message for a string for a regex
 * @param text text to use
 * @returns `string` of the error message if the value leads to an error; `undefined` otherwise
 */
export const regexErrorMessage = (text: string) => {
  try {
    const expanded = replaceCustomRegexes(text.slice(1, -1));
    /**
     * Since `new RegExp` doesn't throw an error on invalid escapes,
     * {@linkcode replaceCustomRegexes} handles that instead.
     */
    if (expanded == undefined) {
      return 'invalid escape \\ sequence';
    }
    const test = new RegExp(expanded);

    const { safe, score } = isSafePattern(text, {
      maxScore: 1000,
      timeout: 3000,
      multiLine: true,
      caseInsensitive: true,
    });
    if (!safe) {
      console.warn(`Regex flagged as potentially unsafe (score: ${score})`);
      return 'Your regex appears to be unsafe. If this is incorrect, please report it on the discord';
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return error.message;
    }
    return 'Unknown error';
  }
};

/**
 * Creates a regex based on a user's search
 * @param text text to use
 */
export const searchToRegex = (text: string) =>
  new RegExp(replaceCustomRegexes(text.slice(1, -1)) ?? '', 'im');
