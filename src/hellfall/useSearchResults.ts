import { useState, useEffect } from 'react';
import { HCCard } from '../api-types';
import { HCColor, HCSearchColor, HCColors } from '../api-types';
import { cardsAtom } from './atoms/cardsAtom';
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
  searchColorNumberAtom,
  searchColorIdentityComparisonAtom,
  searchColorIdentitiesAtom,
  searchColorIdentityNumberAtom,
  useHybridIdentityAtom,
  searchSetAtom,
  searchTokenAtom,
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
} from './atoms/searchAtoms';
import { sortFunction } from './sortFunction';
import { canBeACommander } from './canBeACommander';
import { debug } from 'console';
import { toNumber } from './inputs/NumberSelector';
import {
  colorCompOp,
  colorMiscReduce,
  hybridColorCompOp,
  hybridIdentityMiscReduce,
} from './colorComps';
import { textEquals, textSearchIncludes } from './textHandling';

const isSetInResults = (set: string, setOptions: string[]) => {
  return Boolean(setOptions.find(e => set.includes(e)));
};
// export const textPrep = (text:string) => {
//   return text.toLowerCase().replaceAll(/\\[n*]/g, '').replaceAll('\\(','(').replaceAll('\\)',')')
// }
// /**
//  * Checks whether search text is in text from a card
//  * @param cardText text from the card
//  * @param searchText text to search for
//  * @returns whether there is a match
//  */
// export const textSearchIncludes = (cardText: string, searchText: string) => {
//   return cardText.toLowerCase().includes(searchText.toLowerCase()) || textPrep(cardText).includes(textPrep(searchText));
// };
// /**
//  * Checks whether search text equals text from a card
//  * @param cardText text from the card
//  * @param searchText text to search for
//  * @returns whether they are equal
//  */
// export const textEquals = (cardText: string, searchText: string) => {
//   return cardText.toLowerCase() == searchText.toLowerCase() || textPrep(cardText) == textPrep(searchText);
// };

export const useSearchResults = () => {
  const [resultSet, setResultSet] = useState<HCCard.Any[]>([]);
  const cards = useAtomValue(cardsAtom).filter(e => !['C', 'HC0'].includes(e.set) && !e.tags?.includes('offensive'));
  const set = useAtomValue(searchSetAtom);
  const cardsOrTokens = useAtomValue(searchTokenAtom);
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
  const searchColorIdentities = useAtomValue(searchColorIdentitiesAtom);
  const colorIdentityComparison = useAtomValue(searchColorIdentityComparisonAtom);
  const searchColorIdentityNumber = useAtomValue(searchColorIdentityNumberAtom);
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
    'Cyan',
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
        switch (cardsOrTokens) {
          case 'Cards':
            if (set.length > 0 && !isSetInResults(entry.set, set)) {
              return false;
            }
            if (entry.isActualToken) {
              return false;
            }
            break;
          case 'Tokens':
            if (
              set.length > 0 &&
              !(
                'all_parts' in entry &&
                entry.all_parts
                  ?.filter(e => ['token_maker', 'meld_part', 'draft_partner'].includes(e.component))
                  .some(part => isSetInResults(part.set, set))
              )
            ) {
              return false;
            }
            if (set.length == 0 && !entry.isActualToken) {
              return false;
            }
            break;
          case 'Both':
            if (set.length > 0) {
              if (
                !isSetInResults(entry.set, set) &&
                !(
                  'all_parts' in entry &&
                  entry.all_parts
                    ?.filter(e =>
                      ['token_maker', 'meld_part', 'draft_partner'].includes(e.component)
                    )
                    .some(part => isSetInResults(part.set, set))
                )
              ) {
                return false;
              }
            }
            break;
        }

        if (
          costSearch.length > 0 &&
          !costSearch.every(searchTerm => {
            const combined = entry
              .toFaces()
              .map(e => e.mana_cost)
              .join();
            if (searchTerm.startsWith('!')) {
              return !textSearchIncludes(combined, searchTerm.substring(1));
            } else {
              return textSearchIncludes(combined, searchTerm);
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
              .join();
            if (searchTerm.startsWith('!')) {
              return !textSearchIncludes(combined, searchTerm.substring(1));
            } else {
              return textSearchIncludes(combined, searchTerm);
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
          !textSearchIncludes(
            entry
              .toFaces()
              .map(e => e.name || '')
              .join(' // '),
            nameSearch
          ) &&
          !textSearchIncludes(entry.name, nameSearch)
        ) {
          return false;
        }
        // TODO: decide if this should use includes instead of equals
        if (idSearch !== '' && !textEquals(entry.id, idSearch)) {
          return false;
        }

        if (searchCmc) {
          switch (searchCmc.operator) {
            case '<=': {
              if (!(entry.cmc <= searchCmc.value)) {
                return false;
              }
              break;
            }
            case '<': {
              if (!(entry.cmc < searchCmc.value)) {
                return false;
              }
              break;
            }
            case '=': {
              if (!(entry.cmc == searchCmc.value)) {
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
            case '>=': {
              if (!(entry.cmc >= searchCmc.value)) {
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
        if (creators.length > 0 && !creators.some(creator => entry.creators.includes(creator))) {
          return false;
        }
        if (
          typeSearch.length > 0 &&
          !typeSearch.every(searchTerm => {
            const combined = [
              ...entry.toFaces().map(e => e.supertypes || ''),
              ...entry.toFaces().map(e => e.types || ''),
              ...entry.toFaces().map(e => e.subtypes || ''),
            ].join(',');
            if (searchTerm.startsWith('!')) {
              return !textSearchIncludes(combined, searchTerm.substring(1));
            } else {
              return textSearchIncludes(combined, searchTerm);
            }
          })
        ) {
          return false;
        }
        if (power) {
          switch (power.operator) {
            case '<': {
              if (
                !(
                  'power' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].power) ? 0 : toNumber(entry.toFaces()[0].power)!) <
                    power.value
                )
              ) {
                return false;
              }
              break;
            }
            case '<=': {
              if (
                !(
                  'power' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].power) ? 0 : toNumber(entry.toFaces()[0].power)!) <=
                    power.value
                )
              ) {
                return false;
              }
              break;
            }
            case '=': {
              if (toNumber(entry.toFaces()[0].power) !== power.value) {
                return false;
              }
              break;
            }
            case '>=': {
              if (
                !(
                  'power' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].power) ? 0 : toNumber(entry.toFaces()[0].power)!) >=
                    power.value
                )
              ) {
                return false;
              }
              break;
            }
            case '>': {
              if (
                !(
                  'power' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].power) ? 0 : toNumber(entry.toFaces()[0].power)!) >
                    power.value
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
            case '<': {
              if (
                !(
                  'toughness' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].toughness)
                    ? 0
                    : toNumber(entry.toFaces()[0].toughness)!) < toughness.value
                )
              ) {
                return false;
              }
              break;
            }
            case '<=': {
              if (
                !(
                  'toughness' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].toughness)
                    ? 0
                    : toNumber(entry.toFaces()[0].toughness)!) <= toughness.value
                )
              ) {
                return false;
              }
              break;
            }
            case '=': {
              if (toNumber(entry.toFaces()[0].toughness) !== toughness.value) {
                return false;
              }
              break;
            }
            case '>=': {
              if (
                !(
                  'toughness' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].toughness)
                    ? 0
                    : toNumber(entry.toFaces()[0].toughness)!) >= toughness.value
                )
              ) {
                return false;
              }
              break;
            }
            case '>': {
              if (
                !(
                  'toughness' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].toughness)
                    ? 0
                    : toNumber(entry.toFaces()[0].toughness)!) > toughness.value
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
            case '<': {
              if (
                !(
                  'loyalty' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].loyalty)
                    ? 0
                    : toNumber(entry.toFaces()[0].loyalty)!) < loyalty.value
                )
              ) {
                return false;
              }
              break;
            }
            case '<=': {
              if (
                !(
                  'loyalty' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].loyalty)
                    ? 0
                    : toNumber(entry.toFaces()[0].loyalty)!) <= loyalty.value
                )
              ) {
                return false;
              }
              break;
            }
            case '=': {
              if (toNumber(entry.toFaces()[0].loyalty) !== loyalty.value) {
                return false;
              }
              break;
            }
            case '>=': {
              if (
                !(
                  'loyalty' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].loyalty)
                    ? 0
                    : toNumber(entry.toFaces()[0].loyalty)!) >= loyalty.value
                )
              ) {
                return false;
              }
              break;
            }
            case '>': {
              if (
                !(
                  'loyalty' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].loyalty)
                    ? 0
                    : toNumber(entry.toFaces()[0].loyalty)!) > loyalty.value
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
            case '<': {
              if (
                !(
                  'defense' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].defense)
                    ? 0
                    : toNumber(entry.toFaces()[0].defense)!) < defense.value
                )
              ) {
                return false;
              }
              break;
            }
            case '<=': {
              if (
                !(
                  'defense' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].defense)
                    ? 0
                    : toNumber(entry.toFaces()[0].defense)!) <= defense.value
                )
              ) {
                return false;
              }
              break;
            }
            case '=': {
              if (toNumber(entry.toFaces()[0].defense) !== defense.value) {
                return false;
              }
              break;
            }
            case '>=': {
              if (
                !(
                  'defense' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].defense)
                    ? 0
                    : toNumber(entry.toFaces()[0].defense)!) >= defense.value
                )
              ) {
                return false;
              }
              break;
            }
            case '>': {
              if (
                !(
                  'defense' in entry.toFaces()[0] &&
                  (!toNumber(entry.toFaces()[0].defense)
                    ? 0
                    : toNumber(entry.toFaces()[0].defense)!) > defense.value
                )
              ) {
                return false;
              }
              break;
            }
          }
        }

        if (searchColorNumber) {
          const cardColorNumber = entry.colors.length;

          switch (searchColorNumber.operator) {
            case '<': {
              if (!(cardColorNumber < searchColorNumber.value)) {
                return false;
              }
              break;
            }
            case '<=': {
              if (!(cardColorNumber <= searchColorNumber.value)) {
                return false;
              }
              break;
            }
            case '=': {
              if (cardColorNumber !== searchColorNumber.value) {
                return false;
              }
              break;
            }
            case '>=': {
              if (!(cardColorNumber >= searchColorNumber.value)) {
                return false;
              }
              break;
            }
            case '>': {
              if (!(cardColorNumber > searchColorNumber.value)) {
                return false;
              }
              break;
            }
          }
        }

        if (searchColorIdentityNumber) {
          const cardColorIdentityNumber = entry.color_identity.length;

          switch (searchColorIdentityNumber.operator) {
            case '<': {
              if (!(cardColorIdentityNumber < searchColorIdentityNumber.value)) {
                return false;
              }
              break;
            }
            case '<=': {
              if (!(cardColorIdentityNumber <= searchColorIdentityNumber.value)) {
                return false;
              }
              break;
            }
            case '=': {
              if (cardColorIdentityNumber !== searchColorIdentityNumber.value) {
                return false;
              }
              break;
            }
            case '>=': {
              if (!(cardColorIdentityNumber >= searchColorIdentityNumber.value)) {
                return false;
              }
              break;
            }
            case '>': {
              if (!(cardColorIdentityNumber > searchColorIdentityNumber.value)) {
                return false;
              }
              break;
            }
          }
        }

        // TODO: handle split cards/adventures/transforms/flips better
        if (searchColors.length > 0) {
          if (!entry.colors) {
            // debugger;
            console.log('Card id:', entry.id, 'had a null color.');
            if (['=', '>=', '>'].includes(colorComparison)) {
              return false;
            }
          } else {
            if (!colorCompOp(colorMiscReduce(entry.colors), colorComparison, searchColors)) {
              return false;
            }
          }
        }

        if (searchColorIdentities.length > 0) {
          if (useHybrid) {
            if (
              !hybridColorCompOp(
                hybridIdentityMiscReduce(entry.color_identity_hybrid),
                colorIdentityComparison,
                searchColorIdentities
              )
            ) {
              return false;
            }
          } else {
            if (!entry.color_identity) {
              // debugger;
              console.log('Card id:', entry.id, 'had a null color identity.');
              if (['=', '>=', '>'].includes(colorIdentityComparison)) {
                return false;
              }
            } else {
              if (
                !colorCompOp(
                  colorMiscReduce(entry.color_identity),
                  colorIdentityComparison,
                  searchColorIdentities
                )
              ) {
                return false;
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
    if (cardsOrTokens != 'Cards') {
      searchToSet.append('token', cardsOrTokens);
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
      searchToSet.append(
        'colorIdentityNumber',
        `${searchColorIdentityNumber.operator}${searchColorIdentityNumber.value}`
      );
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
    if (colorComparison !== '>=') {
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
    cardsOrTokens,
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
    isCommander,
    power,
    toughness,
    loyalty,
    defense,
  ]);

  return resultSet;
};
