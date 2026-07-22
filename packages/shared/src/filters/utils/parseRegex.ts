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
  '\\spt',
  '\\spp',
  '\\smm',
] as const;
type customEscape = (typeof customEscapeList)[number];

const customRegexes: Record<customEscape, RegExp> = {
  '\\sm': pipMap.manaSymbolRegex,
  '\\sc': pipMap.coloredSymbolRegex,
  '\\ss': pipMap.anySymbolRegex,
  '\\smr': pipMap.repeatedSymbolRegex,
  '\\smh': pipMap.hybridSymbolRegex,
  '\\smp': pipMap.phyrexianSymbolRegex,
  '\\spt': ptRegex,
  '\\spp': ppRegex,
  '\\smm': mmRegex,
};
const customEscapeRegex = new RegExp(customEscapeList.join('|'), 'g');

const searchToRegexText = (text: string): string =>
  text.replaceAll(customEscapeRegex, match => customRegexes[match as customEscape].source);

/**
 * Gets the error message for a string for a regex
 * @param text text to use
 * @returns `string` of the error message if the value leads to an error; `undefined` otherwise
 */
export const regexErrorMessage = (text: string) => {
  try {
    const expanded = searchToRegexText(text);
    new RegExp(expanded);
    const { safe, score } = isSafePattern(expanded, {
      maxScore: 1000,
      timeout: 3000,
      multiLine: true,
      caseInsensitive: true,
      downgradePattern: true,
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
export const searchToRegex = (text: string) => new RegExp(searchToRegexText(text), 'im');
