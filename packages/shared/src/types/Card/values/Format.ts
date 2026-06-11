export const formatList = ['standard', '4cb', 'commander'];
export type HCFormat = (typeof formatList)[number];

export const isFormat = (value: any): value is HCFormat => formatList.includes(value as HCFormat);
