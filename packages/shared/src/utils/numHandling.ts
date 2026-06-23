export const isInteger = (num: string) => {
  return num == parseInt(num).toString();
};
export const isNumber = (num: string) => {
  return isInteger(num) || num == parseFloat(num).toString();
};

export const toNumber = (numStr: string | undefined) => {
  const zeroEquivs = ['?', 'N', 'X', 'Y', 'Z', '*', ''];
  const specialCases: Record<string, number> = {
    '[7': 7,
    '7]': 7,
    '[3': 3,
    '4]': 4,
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
  if (!numStr) {
    return undefined;
  } else if (numStr in specialCases) {
    return specialCases[numStr];
  } else if (zeroEquivs.includes(numStr)) {
    return 0;
  } else if (numStr.includes('+')) {
    const nums = numStr.split('+');
    const num1 = zeroEquivs.includes(nums[0]) ? 0 : parseFloat(nums[0]);
    const num2 = zeroEquivs.includes(nums[1]) ? 0 : parseFloat(nums[1]);
    return !Number.isNaN(num1) && !Number.isNaN(num2) ? num1 + num2 : undefined;
  } else if (numStr.includes('-')) {
    const nums = numStr.split('-');
    const num1 = zeroEquivs.includes(nums[0]) ? 0 : parseFloat(nums[0]);
    const num2 = zeroEquivs.includes(nums[1]) ? 0 : parseFloat(nums[1]);
    return !Number.isNaN(num1) && !Number.isNaN(num2) ? num1 - num2 : undefined;
  } else {
    const num = parseFloat(numStr);
    return !Number.isNaN(num) ? num : undefined;
  }
};
