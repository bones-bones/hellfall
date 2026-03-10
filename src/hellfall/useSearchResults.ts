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
  // searchColorNumberComparisonAtom,
  searchColorNumberAtom,
  searchColorIdentityComparisonAtom,
  searchColorIdentitiesAtom,
  // searchColorIdentityNumberComparisonAtom,
  searchColorIdentityNumberAtom,
  useHybridIdentityAtom,
  searchSetAtom,
  sortAtom,
  typeSearchAtom,
  isCommanderAtom,
  powerAtom,
  toughnessAtom,
  loyaltyAtom,
  defenseAtom,
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
  const sortRule = useAtomValue(sortAtom);
  const dirRule = useAtomValue(dirAtom);
  const creators = useAtomValue(creatorsAtom);
  const searchColors = useAtomValue(searchColorsAtom);
  const colorComparison = useAtomValue(searchColorComparisonAtom);
  const searchColorNumber = useAtomValue(searchColorNumberAtom);
  // const colorNumberComparison = useAtomValue(searchColorNumberComparisonAtom);
  const searchColorIdentities = useAtomValue(searchColorIdentitiesAtom);
  const colorIdentityComparison = useAtomValue(searchColorIdentityComparisonAtom);
  const searchColorIdentityNumber = useAtomValue(searchColorIdentityNumberAtom);
  // const colorIdentityNumberComparison = useAtomValue(searchColorIdentityNumberComparisonAtom);
  const useHybrid = useAtomValue(useHybridIdentityAtom);
  const activeCard = useAtomValue(activeCardAtom);
  const isCommander = useAtomValue(isCommanderAtom);
  const [page, setPageAtom] = useAtom(offsetAtom);
  const power = useAtomValue(powerAtom);
  const toughness = useAtomValue(toughnessAtom);
  const loyalty = useAtomValue(loyaltyAtom);
  const defense = useAtomValue(defenseAtom);
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
    //   searchColorIdentities,
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

        if (searchCmc) {
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
        if (loyalty) {
          switch (loyalty.operator) {
            case '=': {
              if (parseInt(entry.toFaces()[0].loyalty + '') !== loyalty.value) {
                return false;
              }
              break;
            }
            case '<': {
              if (
                !entry.toFaces()[0].loyalty ||
                !(
                  (Number.isNaN(parseInt(entry.toFaces()[0].loyalty + ''))
                    ? 0
                    : parseInt(entry.toFaces()[0].loyalty + '')) < loyalty.value
                )
              ) {
                return false;
              }
              break;
            }
            case '>': {
              if (
                !entry.toFaces()[0].loyalty ||
                !(
                  (Number.isNaN(parseInt(entry.toFaces()[0].loyalty + ''))
                    ? 0
                    : parseInt(entry.toFaces()[0].loyalty + '')) > loyalty.value
                )
              ) {
                return false;
              }
              break;
            }
          }
        }
        if (defense) {
          switch (defense.operator) {
            case '=': {
              if (parseInt(entry.toFaces()[0].defense + '') !== defense.value) {
                return false;
              }
              break;
            }
            case '<': {
              if (
                !entry.toFaces()[0].defense ||
                !(
                  (Number.isNaN(parseInt(entry.toFaces()[0].defense + ''))
                    ? 0
                    : parseInt(entry.toFaces()[0].defense + '')) < defense.value
                )
              ) {
                return false;
              }
              break;
            }
            case '>': {
              if (
                !entry.toFaces()[0].defense ||
                !(
                  (Number.isNaN(parseInt(entry.toFaces()[0].defense + ''))
                    ? 0
                    : parseInt(entry.toFaces()[0].defense + '')) > defense.value
                )
              ) {
                return false;
              }
              break;
            }
          }
        }

        if (searchColorNumber) {
          const cardColorNumber = !(entry.colors) || entry.colors.includes('C') ? 0 : entry.colors.length;

          switch (searchColorNumber.operator) {
            case '=': {
              if (cardColorNumber !== searchColorNumber.value) {
                return false;
              }
              break;
            }
            case '<': {
              if (cardColorNumber >= searchColorNumber.value) {
                return false;
              }
              break;
            }
            case '>': {
              if (cardColorNumber <= searchColorNumber.value) {
                return false;
              }
              break;
            }
          }
        }

        if (searchColorIdentityNumber) {
          const cardColorIdentityNumber = !(entry.color_identity) || entry.color_identity.includes('C') ? 0 : entry.color_identity.length;

          switch (searchColorIdentityNumber.operator) {
            case '=': {
              if (cardColorIdentityNumber !== searchColorIdentityNumber.value) {
                return false;
              }
              break;
            }
            case '<': {
              if (cardColorIdentityNumber >= searchColorIdentityNumber.value) {
                return false;
              }
              break;
            }
            case '>': {
              if (cardColorIdentityNumber <= searchColorIdentityNumber.value) {
                return false;
              }
              break;
            }
          }
        }


        // TODO: handle split cards/adventures/transforms/flips better
        if (searchColors.length > 0) {
          if (
            !(
              searchColors.includes('C') &&
              entry./**toFaces()[0].*/ colors.length == 1 &&
              entry./**toFaces()[0].*/ colors[0] == 'C'
            )
          ) {
            // const newSearchColors = searchColors.includes(MISC_BULLSHIT)
            //   ? [...searchColors, ...allMiscColors].filter(e => e != MISC_BULLSHIT)
            //   : searchColors;
            // const useMisc = searchColors.includes(MISC_BULLSHIT);
            if (searchColors.includes('C') && colorComparison != '>=') {
              if (!entry./**toFaces()[0].*/ colors.includes('C')) {
                return false;
              }
            } else {
              const newSearchColors = searchColors.filter(e => e != 'C');
              // if (!entry.colors) {
              //   debugger;
              // }
              const entryColorsSet: Set<string> = new Set(
                entry./**toFaces()[0].*/ colors.map(e => {
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

        if (searchColorIdentities.length > 0) {
          if (useHybrid) {
            // if (!('color_identity_hybrid' in entry)) {
            //   debugger;
            // }
            if (
              !entry.color_identity_hybrid.every(cardColorIdentityComponent => {
                // !getColorIdentity(entry).every(cardColorIdentityComponent => {
                const miscBullshitSearchColorIdentities = searchColorIdentities.includes(
                  MISC_BULLSHIT
                )
                  ? [...searchColorIdentities, ...miscColors].filter(e => e != MISC_BULLSHIT)
                  : searchColorIdentities;
                const colorTest = (e: string) =>
                  miscBullshitSearchColorIdentities.includes(e) || e == 'C';
                return cardColorIdentityComponent.some(e => colorTest(e));
                // TODO: make sure this works (see colorTest)
              })
            ) {
              return false;
            }
          } else {
            if (
              !(
                searchColorIdentities.includes('C') &&
                entry.color_identity.length == 1 &&
                entry.color_identity[0] == 'C'
              )
            ) {
              // const newSearchColorIdentities = searchColorIdentities.includes(MISC_BULLSHIT)
              //   ? [...searchColorIdentities, ...allMiscColors].filter(e => e != MISC_BULLSHIT)
              //   : searchColorIdentities;
              // const useMisc = searchColorIdentities.includes(MISC_BULLSHIT);
              if (searchColorIdentities.includes('C') && colorComparison != '>=') {
                if (!entry.color_identity.includes('C')) {
                  return false;
                }
              } else {
                const newSearchColorIdentities = searchColorIdentities.filter(e => e != 'C');
                // if (!entry.color_identity) {
                //   debugger;
                // }
                const entryColorIdentitySet: Set<string> = new Set(
                  entry.color_identity.map(e => {
                    if (e == null) {
                      console.log('Card id:', entry.id, 'had a null color identity.');
                      return 'C';
                    } else {
                      return miscColors.includes(e.toString()) ? MISC_BULLSHIT : e.toString();
                    }
                  })
                );
                entryColorIdentitySet.delete('C');
                const entryColorIdentity: string[] = Array.from(entryColorIdentitySet);

                switch (colorIdentityComparison) {
                  case '<=': {
                    if (
                      !entryColorIdentity.every(colorEntry =>
                        newSearchColorIdentities.includes(colorEntry)
                      )
                    ) {
                      return false;
                    }
                    break;
                  }
                  case '=': {
                    if (
                      !(
                        entryColorIdentity.every(colorEntry =>
                          newSearchColorIdentities.includes(colorEntry)
                        ) && entryColorIdentity.length == newSearchColorIdentities.length
                      )
                    ) {
                      return false;
                    }
                    break;
                  }
                  case '>=': {
                    if (
                      !newSearchColorIdentities.every(colorEntry =>
                        entryColorIdentity.includes(colorEntry)
                      )
                    ) {
                      return false;
                    }

                    break;
                  }
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
    if (searchColorIdentities.length > 0) {
      searchToSet.append('colorIdentity', searchColorIdentities.join(','));
    }
    if (searchColorNumber) {
      searchToSet.append('colorNumber', `${searchColorNumber.operator}${searchColorNumber.value}`);
    }
    if (searchColorIdentityNumber) {
      searchToSet.append('colorIdentityNumber', `${searchColorIdentityNumber.operator}${searchColorIdentityNumber.value}`);
    }
    if (useHybrid) {
      searchToSet.append('useHybrid', 'true');
    }
    if (searchCmc) {
      searchToSet.append('manaValue', `${searchCmc.operator}${searchCmc.value}`);
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
    if (colorIdentityComparison !== '<=') {
      searchToSet.append('colorIdentityComparison', colorIdentityComparison);
    }
    if (power) {
      searchToSet.append('p', `${power.operator}${power.value}`);
    }
    if (toughness) {
      searchToSet.append('t', `${toughness.operator}${toughness.value}`);
    }
    if (loyalty) {
      searchToSet.append('l', `${loyalty.operator}${loyalty.value}`);
    }
    if (defense) {
      searchToSet.append('d', `${defense.operator}${defense.value}`);
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
    searchColorIdentities,
    searchColorNumber,
    searchColorIdentityNumber,
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
    useHybrid,
    activeCard,
    page,
    colorComparison,
    colorIdentityComparison,
    // colorNumberComparison,
    // colorIdentityNumberComparison,
    isCommander,
    power,
    toughness,
    loyalty,
    defense,
  ]);

  return resultSet;
};
