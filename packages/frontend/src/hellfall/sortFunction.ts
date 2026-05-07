import { allSetsList } from '@hellfall/shared/data/sets';
import { HCCard, HCColor, HCColors } from '@hellfall/shared/types';
// TODO: make it possible to sort by color, then alpha, rather than color, then MV
// bucketers (ones that can give equality): set, color, mana value
// individuals: name, id, number (requires set)
// options: []

export const sortFunction =
  (sortRule: 'Name' | 'Id' | 'Set/Number' | 'Color' | 'Mana Value', dirRule: 'Asc' | 'Desc') =>
  (a: HCCard.Any, b: HCCard.Any) => {
    const dirMult = dirRule == 'Desc' ? -1 : 1;
    switch (sortRule) {
      case 'Mana Value': {
        if (a.mana_value > b.mana_value) {
          return dirMult;
        }
        break;
      }
      case 'Color': {
        const aString = getSortString(a);
        const bString = getSortString(b);

        if (aString > bString) {
          return dirMult;
        }
        break;
      }

      case 'Name': {
        if (a.name == b.name) {
          if (a.isActualToken && b.isActualToken) {
            if (
              (parseInt(a.id.match(/\d+$/)?.[0] || '') || 0) >
              (parseInt(b.id.match(/\d+$/)?.[0] || '') || 0)
            ) {
              return dirMult;
            }
          } else if (a.isActualToken != b.isActualToken) {
            if (a.isActualToken) {
              return dirMult;
            }
          } else {
            if (parseInt(a.id) == parseInt(b.id)) {
              if (a.id > b.id) {
                return dirMult;
              }
            } else if (parseInt(a.id) > parseInt(b.id)) {
              return dirMult;
            }
          }
          return dirMult;
        } else if (a.name > b.name) {
          return dirMult;
        }
        break;
      }

      case 'Id': {
        if (parseInt(a.id) == parseInt(b.id)) {
          return (a.id.charCodeAt(-1) - b.id.charCodeAt(-1)) * dirMult;
        }
        return (parseInt(a.id) - parseInt(b.id)) * dirMult;
      }
      case 'Set/Number': {
        if (a.set == b.set) {
          if (!a.collector_number && !b.collector_number) {
            if (parseInt(a.id) == parseInt(b.id)) {
              return (a.id.charCodeAt(-1) - b.id.charCodeAt(-1)) * dirMult;
            }
            return (parseInt(a.id) - parseInt(b.id)) * dirMult;
          }
          if ('collector_number' in a != 'collector_number' in b) {
            return 'collector_number' in a ? -dirMult : dirMult;
          }
          if (parseInt(a.id) == parseInt(b.id)) {
            return (a.id.charCodeAt(-1) - b.id.charCodeAt(-1)) * dirMult;
          }
          return (parseInt(a.collector_number!) - parseInt(b.collector_number!)) * dirMult;
        }
        return (allSetsList.indexOf(a.set) - allSetsList.indexOf(b.set)) * dirMult;
      }
    }

    return dirRule == 'Desc' ? 1 : -1;
  };

const getSortString = (card: HCCard.Any) => {
  const cardColors = card.toFaces()[0]?.colors || [];
  return (
    (cardColors.length == 0
      ? 1_000_000
      : cardColors.reduce((curr, next) => curr + (colorSortValue[next] || 10_000_000), 0)
    )
      .toString()
      .padStart(8, '0') +
    (card.mana_value || 0).toString().padStart(3) +
    card.name
  );
};

const colorSortValue: Record<HCColor, number> = {
  W: 1,
  U: 10,
  B: 100,
  R: 1000,
  G: 10_000,
  P: 100_000,
  C: 1_000_000,
  Yellow: 10_000_000,
  Brown: 10_000_000,
  Pink: 10_000_000,
  Teal: 10_000_000,
  Orange: 10_000_000,
  TEMU: 10_000_000,
  Cyan: 10_000_000,
  Gold: 10_000_000,
  Beige: 10_000_000,
  Grey: 10_000_000,
};
