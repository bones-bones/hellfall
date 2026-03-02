import { useState, useEffect } from 'react';
import { HCCard } from '../api-types';
import { HCColor, HCSearchColor, HCColors } from '../api-types';
import { cardsAtom } from './cardsAtom';
import { useAtom, useAtomValue } from 'jotai';
import {
  activeCardAtom,
  creatorsAtom,
  legalityAtom,
  idSearchAtom,
  nameSearchAtom,
  offsetAtom,
  costSearchAtom,
  rulesSearchAtom,
  searchCmcAtom,
  searchColorComparisonAtom,
  searchColorsAtom,
  searchColorsIdentityAtom,
  useHybridIdentityAtom,
  searchSetAtom,
  sortAtom,
  typeSearchAtom,
  isCommanderAtom,
  powerAtom,
  toughnessAtom,
  tagsAtom,
  extraFiltersAtom,
  dirAtom,
} from './searchAtoms';
import { sortFunction } from './sortFunction';
import { getColorIdentity } from './getColorIdentity';
import { canBeACommander } from './canBeACommander';
import { debug } from 'console';

const isSetInResults = (set: string, setOptions: string[]) => {
  return Boolean(setOptions.find(e => set.includes(e)));
};

export const useSearchResults = () => {
  const [resultSet, setResultSet] = useState<HCCard.Any[]>([]);
  const cards = useAtomValue(cardsAtom).filter(e => e.set != 'C');
  const set = useAtomValue(searchSetAtom);
  const costSearch = useAtomValue(costSearchAtom);
  const rulesSearch = useAtomValue(rulesSearchAtom);
  const idSearch = useAtomValue(idSearchAtom);
  const nameSearch = useAtomValue(nameSearchAtom);
  const searchCmc = useAtomValue(searchCmcAtom);
  const legality = useAtomValue(legalityAtom);
  const typeSearch = useAtomValue(typeSearchAtom);
  const searchColors = useAtomValue(searchColorsAtom);
  const sortRule = useAtomValue(sortAtom);
  const dirRule = useAtomValue(dirAtom);
  const creators = useAtomValue(creatorsAtom);
  const colorIdentityCriteria = useAtomValue(searchColorsIdentityAtom);
  const useHybrid = useAtomValue(useHybridIdentityAtom);
  const activeCard = useAtomValue(activeCardAtom);
  const colorComparison = useAtomValue(searchColorComparisonAtom);
  const isCommander = useAtomValue(isCommanderAtom);
  const [page, setPageAtom] = useAtom(offsetAtom);
  const power = useAtomValue(powerAtom);
  const toughness = useAtomValue(toughnessAtom);
  const tags = useAtomValue(tagsAtom);
  const extraFilters = useAtomValue(extraFiltersAtom);
  const MISC_BULLSHIT = 'Misc bullshit';
  const miscColors = [
    'Pickle',
    'Yellow',
    'Brown',
    'Pink',
    'Teal',
    'Orange',
    'TEMU',
    'Gold',
    'Beige',
    'Grey',
  ]; //Object.values(HCMiscColor); /**as unknown as HCColor[] */

  useEffect(() => {
    // console.log('useSearchResults effect running', {
    //   searchColors,
    //   colorIdentityCriteria,
    //   // add others
    // });
    const tempResults = cards
      .filter(entry => {
        if (set.length > 0 && !isSetInResults(entry.set, set)) {
          return false;
        }
        if (!extraFilters.includes('isToken') && entry.isActualToken) {
          return false;
        }
        if (extraFilters.includes('isToken') && !entry.isActualToken) {
          return false;
        }

        if (
          costSearch.length > 0 &&
          !costSearch.every(searchTerm => {
            const combined = entry
              .toFaces()
              .map(e => e.mana_cost)
              .join()
              .toLowerCase();
            if (searchTerm.startsWith('!')) {
              return !combined.includes(searchTerm.substring(1).toLowerCase());
            } else {
              return combined.includes(searchTerm.toLowerCase());
            }
          })
        ) {
          return false;
        }

        if (
          rulesSearch.length > 0 &&
          !rulesSearch.every(searchTerm => {
            const combined = entry
              .toFaces()
              .map(e => e.oracle_text || '')
              .join()
              .toLowerCase();
            if (searchTerm.startsWith('!')) {
              return !combined.includes(searchTerm.substring(1).toLowerCase());
            } else {
              return combined.includes(searchTerm.toLowerCase());
            }
          })
        ) {
          return false;
        }

        if (
          tags.length > 0 &&
          !tags.every(tag => {
            return entry.tags?.includes(tag);
          })
        ) {
          return false;
        }

        if (
          nameSearch !== '' &&
          !entry
            .toFaces()
            .map(e => e.name || '')
            .join(' // ')
            .toLowerCase()
            .includes(nameSearch.toLowerCase()) &&
          !entry.name.toLowerCase().includes(nameSearch.toLowerCase())
        ) {
          return false;
        }

        if (idSearch !== '' && entry.id.toLowerCase() != idSearch.toLowerCase()) {
          return false;
        }

        if (searchCmc != undefined) {
          switch (searchCmc.operator) {
            case '<': {
              if (!(entry.cmc < searchCmc.value)) {
                return false;
              }
              break;
            }
            case '>': {
              if (!(entry.cmc > searchCmc.value)) {
                return false;
              }
              break;
            }
            case '=': {
              if (!(entry.cmc === searchCmc.value)) {
                return false;
              }
              break;
            }
          }
        }

        if (isCommander === true) {
          if (!canBeACommander(entry)) {
            return false;
          }
        }
        if (legality.length > 0) {
          if (legality.includes('legal') && entry.legalities.standard != 'legal') {
            return false;
          }
          if (legality.includes('4cbLegal') && entry.legalities['4cb'] != 'legal') {
            return false;
          }

          if (legality.includes('hellsmanderLegal') && entry.legalities.commander != 'legal') {
            return false;
          }
        }
        if (creators.length > 0 && !creators.includes(entry.creator)) {
          return false;
        }
        if (
          typeSearch.length > 0 &&
          !typeSearch.every(searchTerm => {
            const combined = [
              // ...(entry.supertypes || []),
              ...entry.toFaces().map(e => e.supertypes || ''),
              // ...(entry.types || []),
              ...entry.toFaces().map(e => e.types || ''),
              // ...(entry.subtypes || []),
              ...entry.toFaces().map(e => e.subtypes || ''),
            ]
              .join(',')
              .toLowerCase();
            if (searchTerm.startsWith('!')) {
              return !combined.includes(searchTerm.substring(1).toLowerCase());
            } else {
              return combined.includes(searchTerm.toLowerCase());
            }
          })
        ) {
          return false;
        }
        if (power) {
          switch (power.operator) {
            case '=': {
              if (parseInt(entry.toFaces()[0].power + '') !== power.value) {
                return false;
              }
              break;
            }
            case '<': {
              if (
                !entry.toFaces()[0].power ||
                !(
                  (Number.isNaN(parseInt(entry.toFaces()[0].power + ''))
                    ? 0
                    : parseInt(entry.toFaces()[0].power + '')) < power.value
                )
              ) {
                return false;
              }
              break;
            }
            case '>': {
              if (
                !entry.toFaces()[0].power ||
                !(
                  (Number.isNaN(parseInt(entry.toFaces()[0].power + ''))
                    ? 0
                    : parseInt(entry.toFaces()[0].power + '')) > power.value
                )
              ) {
                return false;
              }
              break;
            }
          }
        }
        if (toughness) {
          switch (toughness.operator) {
            case '=': {
              if (parseInt(entry.toFaces()[0].toughness + '') !== toughness.value) {
                return false;
              }
              break;
            }
            case '<': {
              if (
                !entry.toFaces()[0].toughness ||
                !(
                  (Number.isNaN(parseInt(entry.toFaces()[0].toughness + ''))
                    ? 0
                    : parseInt(entry.toFaces()[0].toughness + '')) < toughness.value
                )
              ) {
                return false;
              }
              break;
            }
            case '>': {
              if (
                !entry.toFaces()[0].toughness ||
                !(
                  (Number.isNaN(parseInt(entry.toFaces()[0].toughness + ''))
                    ? 0
                    : parseInt(entry.toFaces()[0].toughness + '')) > toughness.value
                )
              ) {
                return false;
              }
              break;
            }
          }
        }
        if (
          colorIdentityCriteria.length > 0 &&
          !getColorIdentity(entry).every(cardColorIdentityComponent => {
            debugger;
            const miscBullshitColorIdentityCriteria = (
              colorIdentityCriteria.includes(MISC_BULLSHIT)
                ? [...colorIdentityCriteria, ...miscColors].filter(e => e != MISC_BULLSHIT)
                : colorIdentityCriteria
            ) as HCColors;
            const colorTest = (e: HCColor) =>
              miscBullshitColorIdentityCriteria.includes(e) || e == 'C';
            return useHybrid
              ? cardColorIdentityComponent.some(e => colorTest(e as HCColor))
              : cardColorIdentityComponent.every(e => colorTest(e as HCColor));
            // TODO: make sure this works (see colorTest)
          })
        ) {
          return false;
        }

        // TODO: handle split cards/adventures/transforms better
        if (searchColors.length > 0) {
          if (
            !(
              searchColors.includes('C') &&
              entry.toFaces()[0].colors.length == 1 &&
              entry.toFaces()[0].colors[0] == 'C'
            )
          ) {
            // const newSearchColors = searchColors.includes(MISC_BULLSHIT)
            //   ? [...searchColors, ...allMiscColors].filter(e => e != MISC_BULLSHIT)
            //   : searchColors;
            // const useMisc = searchColors.includes(MISC_BULLSHIT);
            // debugger
            if (searchColors.includes('C') && colorComparison != '>=') {
              if (!entry.toFaces()[0].colors.includes('C')) {
                return false;
              }
            } else {
              const newSearchColors = searchColors.filter(e => e != 'C');
              const entryColorsSet: Set<string> = new Set(
                entry.toFaces()[0].colors.map(e => {
                  if (e == null) {
                    console.log('Card id:', entry.id, 'had a null color.');
                    return 'C';
                  } else {
                    return miscColors.includes(e.toString()) ? MISC_BULLSHIT : e.toString();
                  }
                })
              );
              entryColorsSet.delete('C');
              const entryColors: string[] = Array.from(entryColorsSet);

              switch (colorComparison) {
                case '<=': {
                  if (!entryColors.every(colorEntry => newSearchColors.includes(colorEntry))) {
                    return false;
                  }
                  break;
                }
                case '=': {
                  if (
                    !(
                      entryColors.every(colorEntry => newSearchColors.includes(colorEntry)) &&
                      entryColors.length == newSearchColors.length
                    )
                  ) {
                    return false;
                  }
                  break;
                }
                case '>=': {
                  if (!newSearchColors.every(colorEntry => entryColors.includes(colorEntry))) {
                    return false;
                  }

                  break;
                }
              }
            }
          }
        }

        return true;
      })
      .sort(sortFunction(sortRule, dirRule));

    setResultSet(tempResults);

    const searchToSet = new URLSearchParams();

    if (nameSearch != '') {
      searchToSet.append('name', nameSearch);
    }
    if (idSearch != '') {
      searchToSet.append('id', idSearch);
    }
    if (typeSearch.length > 0) {
      searchToSet.append('type', typeSearch.join(','));
    }
    if (costSearch.length > 0) {
      searchToSet.append('cost', costSearch.join(','));
    }
    if (rulesSearch.length > 0) {
      searchToSet.append('rules', rulesSearch.join(','));
    }
    if (set.length > 0) {
      searchToSet.append('set', set.join(','));
    }
    if (searchColors.length > 0) {
      searchToSet.append('colors', searchColors.join(','));
    }
    if (colorIdentityCriteria.length > 0) {
      searchToSet.append('colorIdentity', colorIdentityCriteria.join(','));
    }
    if (useHybrid) {
      searchToSet.append('useHybrid', 'true');
    }
    if (searchCmc !== undefined) {
      searchToSet.append('manaValue', JSON.stringify(searchCmc));
    }
    if (legality.length > 0) {
      searchToSet.append('legality', legality.join(','));
    }
    if (creators.length > 0) {
      searchToSet.append('creator', creators.join(',,'));
    }
    if (isCommander) {
      searchToSet.append('isCommander', 'true');
    }
    if (activeCard !== '') {
      searchToSet.append('activeCard', activeCard);
    }
    if (colorComparison !== '<=') {
      searchToSet.append('colorComparison', colorComparison);
    }
    if (power) {
      searchToSet.append('p', `${power.operator}${power.value}`);
    }
    if (toughness) {
      searchToSet.append('t', `${toughness.operator}${toughness.value}`);
    }
    if (tags.length > 0) {
      searchToSet.append('tags', tags.join(','));
    }
    if (sortRule != 'Color') {
      searchToSet.append('order', sortRule);
    }
    if (dirRule != 'Asc') {
      searchToSet.append('dir', dirRule);
    }
    if (tempResults.length < page && tempResults.length > 0) {
      searchToSet.append('page', '0');
      setPageAtom(0);
    } else if (page > 0) {
      searchToSet.append('page', page.toString());
    }

    history.pushState(
      undefined,
      '',
      location.origin + location.pathname + '?' + searchToSet.toString()
    );
  }, [
    costSearch,
    rulesSearch,
    set,
    searchColors,
    nameSearch,
    idSearch,
    sortRule,
    dirRule,
    typeSearch,
    searchCmc,
    tags,
    cards.length,
    legality,
    creators,
    colorIdentityCriteria,
    useHybrid,
    activeCard,
    page,
    colorComparison,
    isCommander,
    power,
    toughness,
  ]);

  return resultSet;
};
