import { HCEntry } from '../types';

export const sortFunction = (sortRule: 'Alpha' | 'CMC' | 'Color') => (a: HCEntry, b: HCEntry) => {
  switch (sortRule) {
    case 'CMC': {
      if (a.CMC > b.CMC) {
        return 1;
      }
      break;
    }
    case 'Color': {
      const aString = getSortString(a);
      const bString = getSortString(b);

      if (aString > bString) {
        return 1;
      }
      break;
    }

    case 'Alpha': {
      if (a.Name > b.Name) {
        return 1;
      }
      break;
    }
  }

  return -1;
};

const getSortString = (card: HCEntry) => {
  const cardColors = (card['Color(s)'] || '').split(';') as Colors[];

  return (
    cardColors
      .reduce((curr, next) => curr + (colorSortValue[next] || 10_000_000), 0)
      .toString()
      .padStart(8, '0') +
    (card['CMC'] || 0).toString().padStart(3) +
    card.Name
  );
};

const colorSortValue: Record<Colors, number> = {
  White: 1,
  Blue: 10,
  Black: 100,
  Red: 1000,
  Green: 10_000,
  Purple: 100_000,
  '': 1_000_000,
  //   Pickle: 7, // 1000000
  //   Piss: 8,
};

// No bullshit colors
type Colors = 'Red' | 'Blue' | 'White' | '' | 'Green' | 'Black' | 'Purple';
