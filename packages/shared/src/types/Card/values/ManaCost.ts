/**
 * Empty cost, or one or more `{symbol}` tokens, optionally joined across faces with ` // `.
 * Matches catalog shapes like `{2}{B}{B}`, `{G/U}`, `{H/R}`, `{Pickle}`, and `{1}{G} // {1}{G}`.
 * Rejects bare text outside braces (e.g. `2{W}{B}{G}`).
 */
const MANA_COST_STRUCTURE = /^(\{[^{}]+\})*(\s*\/\/\s*(\{[^{}]+\})*)*$/;

/**
 * Checks whether a mana cost string is a valid series of brace-enclosed symbols.
 */
export const isManaCost = (value: unknown): value is string =>
  typeof value === 'string' && MANA_COST_STRUCTURE.test(value);
