import { HCCard } from '../api-types';
import { HCColor, HCColors } from '../api-types';
// TODO: make it possible to sort by color, then alpha, rather than color, then MV
// how they can combine: Alpha and ID are mutually exclusive, but none of the others are

export const sortFunction =
  (sortRule: 'Alpha' | 'Mana Value' | 'Color' | 'Id', dirRule: 'Asc' | 'Desc') =>
  (a: HCCard.Any, b: HCCard.Any) => {
    switch (sortRule) {
      case 'Mana Value': {
        if (a.mana_value > b.mana_value) {
          return dirRule == 'Desc' ? -1 : 1;
        }
        break;
      }
      case 'Color': {
        const aString = getSortString(a);
        const bString = getSortString(b);

        if (aString > bString) {
          return dirRule == 'Desc' ? -1 : 1;
        }
        break;
      }

      case 'Alpha': {
        if (a.name == b.name) {
          if (a.isActualToken && b.isActualToken) {
            if (
              (parseInt(a.id.match(/\d+$/)?.[0] || '') || 0) >
              (parseInt(b.id.match(/\d+$/)?.[0] || '') || 0)
            ) {
              return dirRule == 'Desc' ? -1 : 1;
            }
          } else if (a.isActualToken != b.isActualToken) {
            if (a.isActualToken) {
              return dirRule == 'Desc' ? -1 : 1;
            }
          } else {
            if (parseInt(a.id) == parseInt(b.id)) {
              if (a.id > b.id) {
                return dirRule == 'Desc' ? -1 : 1;
              }
            } else if (parseInt(a.id) > parseInt(b.id)) {
              return dirRule == 'Desc' ? -1 : 1;
            }
          }
          return dirRule == 'Desc' ? -1 : 1;
        } else if (a.name > b.name) {
          return dirRule == 'Desc' ? -1 : 1;
        }
        break;
      }

      case 'Id': {
        if (parseInt(a.id) == parseInt(b.id)) {
          if (a.id > b.id) {
            return dirRule == 'Desc' ? -1 : 1;
          }
        } else if (parseInt(a.id) > parseInt(b.id)) {
          return dirRule == 'Desc' ? -1 : 1;
        }
        break;
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
  Pickle: 10_000_000,
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
