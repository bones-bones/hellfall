/**
 * Checks whether a string is an integer
 * @param num string to check
 */
export const isInteger = (num: string) => {
  return num == parseInt(num).toString();
};
/**
 * Checks whether a string is a number
 * @param num string to check
 */
export const isNumber = (num: string) => {
  return isInteger(num) || num == parseFloat(num).toString();
};

/**
 * Converts a number, string, or undefined into a number.
 * Correctly handles all values that have appeared in p/t boxes on hellscube cards.
 * @param num number to convert
 * @returns undefined if `num == undefined`, num if `typeof num == 'number'`,
 * or the conversion of num into a number otherwise
 */
export const toNumber = (num: number | string | undefined): number | undefined => {
  const zeroEquivs = ['?', 'N', 'X', 'Y', 'Z', '*', ''];
  const specialCases: Record<string, number> = {
    '∞': 1e25,
    '2σ': 0,
    '3*X': 0,
    '3*Y+1': 1,
    '-Your life total': 0,
    '⌊2^n⌋': 1,
    '⌊2^n-1⌋': 0,
    '2.23E-308': 2.23e-308,
    '5/1': 1,
    '+4/+4': 2,
    '0[+1]{+2}': 3,
    '0[+1]{+7}': 8,
    "6'": 6,
    '1"': 1,
  };
  if (num == undefined || typeof num === 'number') {
    return num;
  } else if (num.startsWith('[')) {
    return toNumber(num.slice(1));
  } else if (num.endsWith(']')) {
    return toNumber(num.slice(0, -1));
  } else if (num in specialCases) {
    return specialCases[num];
  } else if (zeroEquivs.includes(num)) {
    return 0;
  } else if (num.includes('+')) {
    const nums = num.split('+');
    const num1 = zeroEquivs.includes(nums[0]) ? 0 : parseFloat(nums[0]);
    const num2 = zeroEquivs.includes(nums[1]) ? 0 : parseFloat(nums[1]);
    return !Number.isNaN(num1) && !Number.isNaN(num2) ? num1 + num2 : undefined;
  } else if (num.includes('-')) {
    const nums = num.split('-');
    const num1 = zeroEquivs.includes(nums[0]) ? 0 : parseFloat(nums[0]);
    const num2 = zeroEquivs.includes(nums[1]) ? 0 : parseFloat(nums[1]);
    return !Number.isNaN(num1) && !Number.isNaN(num2) ? num1 - num2 : undefined;
  } else {
    const num0 = parseFloat(num);
    return !Number.isNaN(num0) ? num0 : undefined;
  }
};
