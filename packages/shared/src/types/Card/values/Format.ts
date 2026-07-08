export const formatList = ['standard', '4cb', 'commander'] as const;
/**
 * The formats that exist
 */
export type HCFormat = (typeof formatList)[number];

/**
 * Checks if a value is a {@linkcode HCFormat}
 * @param value the value to check
 */
export const isFormat = (value: any): value is HCFormat => formatList.includes(value);
