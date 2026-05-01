import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePaginationModel, getLastPage } from '@workday/canvas-kit-react/pagination';
import { HCCard, HCColor, HCColors } from '@hellfall/shared/types';
import { cardsAtom } from '../atoms/cardsAtom.ts';
import { useAtom, useAtomValue } from 'jotai';
import {
  nameSearchAtom,
  idSearchAtom,
  costSearchAtom,
  typeSearchAtom,
  rulesSearchAtom,
  flavorSearchAtom,
  creatorsAtom,
  tagsAtom,
  searchColorsAtom,
  colorComparisonAtom,
  colorNumberAtom,
  searchColorIdentitiesAtom,
  colorIdentityComparisonAtom,
  hybridIdentityRuleAtom,
  colorIdentityNumberAtom,
  searchSetAtom,
  includeExtraSetsAtom,
  extraSetsAtom,
  searchTokenAtom,
  standardLegalityAtom,
  fourcbLegalityAtom,
  commanderLegalityAtom,
  isCommanderAtom,
  collectorNumberAtom,
  manaValueAtom,
  powerAtom,
  toughnessAtom,
  loyaltyAtom,
  defenseAtom,
  sortAtom,
  dirAtom,
  pageAtom,
  activeCardAtom,
  // shouldPushHistoryAtom,
} from '../atoms/searchAtoms.ts';

import { sortFunction } from '../sortFunction';
import { canBeACommander } from '../canBeACommander.ts';
import { toNumber } from '../inputs/NumberSelector.tsx';
import {
  colorCompOp,
  colorMiscReduce,
  hybridColorCompOp,
  hybridIdentityMiscReduce,
  numCompOp,
} from '../opComps.ts';
import { textEquals, textSearchIncludes } from '@hellfall/shared/utils/textHandling.ts';
import { CHUNK_SIZE } from '../constants.ts';
import { extraSetList } from '@hellfall/shared/data/sets.ts';
import { filterSet } from '../filters/filterSet.ts';

export const useSearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [resultSet, setResultSet] = useState<HCCard.Any[]>([]);
  const cards = useAtomValue(cardsAtom).filter(
    e => !e.tags?.includes('offensive') && e.set != 'NotMagic'
  );
  const nameSearch = useAtomValue(nameSearchAtom);
  const idSearch = useAtomValue(idSearchAtom);
  const costSearch = useAtomValue(costSearchAtom);
  const typeSearch = useAtomValue(typeSearchAtom);
  const rulesSearch = useAtomValue(rulesSearchAtom);
  const flavorSearch = useAtomValue(flavorSearchAtom);
  const creators = useAtomValue(creatorsAtom);
  const tags = useAtomValue(tagsAtom);
  const searchColors = useAtomValue(searchColorsAtom);
  const colorComparison = useAtomValue(colorComparisonAtom);
  const colorNumber = useAtomValue(colorNumberAtom);
  const searchColorIdentities = useAtomValue(searchColorIdentitiesAtom);
  const colorIdentityComparison = useAtomValue(colorIdentityComparisonAtom);
  const hybridIdentityRule = useAtomValue(hybridIdentityRuleAtom);
  const colorIdentityNumber = useAtomValue(colorIdentityNumberAtom);
  const searchSet = useAtomValue(searchSetAtom);
  const includeExtraSets = useAtomValue(includeExtraSetsAtom);
  const extraSets = useAtomValue(extraSetsAtom);
  const searchToken = useAtomValue(searchTokenAtom);
  const standardLegality = useAtomValue(standardLegalityAtom);
  const fourcbLegality = useAtomValue(fourcbLegalityAtom);
  const commanderLegality = useAtomValue(commanderLegalityAtom);
  const isCommander = useAtomValue(isCommanderAtom);
  const collectorNumber = useAtomValue(collectorNumberAtom);
  const manaValue = useAtomValue(manaValueAtom);
  const power = useAtomValue(powerAtom);
  const toughness = useAtomValue(toughnessAtom);
  const loyalty = useAtomValue(loyaltyAtom);
  const defense = useAtomValue(defenseAtom);
  const sortRule = useAtomValue(sortAtom);
  const dirRule = useAtomValue(dirAtom);
  const [page, setPageAtom] = useAtom(pageAtom);
  const activeCard = useAtomValue(activeCardAtom);
  // const [shouldPushHistory, setShouldPushHistory] = useAtom(shouldPushHistoryAtom);

  const lastPage = getLastPage(CHUNK_SIZE, resultSet.length);

  const paginationModel = usePaginationModel({
    lastPage,
    onPageChange: (pageNumber: number) => {
      if (pageNumber < 1) return;
      const newPageIndex = (pageNumber - 1) * CHUNK_SIZE;
      setPageAtom(newPageIndex);
    },
  });

  useEffect(() => {
    const tempResults = filterSet(cards, searchSet, extraSets, includeExtraSets, searchToken)
      .filter(entry => {
        let usingOr = false;
        let matchesSomeOr = false;

        if (
          nameSearch !== '' &&
          !textSearchIncludes(entry.name, nameSearch) &&
          !textSearchIncludes(
            entry
              .toFaces()
              .map(e => e.name || '')
              .join(' // '),
            nameSearch
          ) &&
          !(entry.flavor_name && textSearchIncludes(entry.flavor_name, nameSearch)) &&
          !(
            'card_faces' in entry &&
            entry.card_faces.some(
              face => face.flavor_name && textSearchIncludes(face.flavor_name, nameSearch)
            )
          )
        ) {
          return false;
        }

        // TODO: decide if this should use includes instead of equals
        if (idSearch !== '' && !textEquals(entry.id, idSearch)) {
          return false;
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
            } else if (searchTerm.startsWith('~')) {
              if (!usingOr) {
                usingOr = true;
              }
              if (textSearchIncludes(combined, searchTerm.substring(1))) {
                matchesSomeOr = true;
              }
              return true;
            } else {
              return textSearchIncludes(combined, searchTerm);
            }
          })
        ) {
          return false;
        }

        if (
          typeSearch.length > 0 &&
          !typeSearch.every(searchTerm => {
            const combined = [
              ...entry.toFaces().map(e => e.supertypes || ''),
              ...entry.toFaces().map(e => e.types || ''),
              ...entry.toFaces().map(e => e.subtypes || ''),
              ...entry.toFaces().map(e => e.type_line),
            ].join(',');
            if (searchTerm.startsWith('!')) {
              return !textSearchIncludes(combined, searchTerm.substring(1));
            } else if (searchTerm.startsWith('~')) {
              if (!usingOr) {
                usingOr = true;
              }
              if (textSearchIncludes(combined, searchTerm.substring(1))) {
                matchesSomeOr = true;
              }
              return true;
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
            } else if (searchTerm.startsWith('~')) {
              if (!usingOr) {
                usingOr = true;
              }
              if (textSearchIncludes(combined, searchTerm.substring(1))) {
                matchesSomeOr = true;
              }
              return true;
            } else {
              return textSearchIncludes(combined, searchTerm);
            }
          })
        ) {
          return false;
        }

        if (
          flavorSearch.length > 0 &&
          !flavorSearch.every(searchTerm => {
            const combined = entry
              .toFaces()
              .map(e => e.flavor_text || '')
              .join();
            if (searchTerm.startsWith('!')) {
              return !textSearchIncludes(combined, searchTerm.substring(1));
            } else if (searchTerm.startsWith('~')) {
              if (!usingOr) {
                usingOr = true;
              }
              if (textSearchIncludes(combined, searchTerm.substring(1))) {
                matchesSomeOr = true;
              }
              return true;
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
            if (tag.startsWith('!')) {
              if (tag.endsWith('<')) {
                return !(entry.tag_notes && tag.slice(1, -1) in entry.tag_notes);
              }
              if (tag.endsWith('>') && tag.includes('<')) {
                const [subtag, note] = [tag.split('<')[0].slice(1), tag.split('<')[1].slice(0, -1)];
                return !(entry.tag_notes && textEquals(entry.tag_notes[subtag], note));
              }
              return !entry.tags?.includes(tag.slice(1));
            } else if (tag.startsWith('~')) {
              if (!usingOr) {
                usingOr = true;
              }
              if (tag.endsWith('<')) {
                if (entry.tag_notes && tag.slice(1, -1) in entry.tag_notes) {
                  matchesSomeOr = true;
                }
              } else if (tag.endsWith('>') && tag.includes('<')) {
                const [subtag, note] = [tag.split('<')[0].slice(1), tag.split('<')[1].slice(0, -1)];
                if (entry.tag_notes && textEquals(entry.tag_notes[subtag], note)) {
                  matchesSomeOr = true;
                }
              } else {
                if (entry.tags?.includes(tag.slice(1))) {
                  matchesSomeOr = true;
                }
              }
              return true;
            } else {
              if (tag.endsWith('<')) {
                return entry.tag_notes && tag.slice(0, -1) in entry.tag_notes;
              }
              if (tag.endsWith('>') && tag.includes('<')) {
                const [subtag, note] = [tag.split('<')[0], tag.split('<')[1].slice(0, -1)];
                return entry.tag_notes && textEquals(entry.tag_notes[subtag], note);
              }
              return entry.tags?.includes(tag);
            }
          })
        ) {
          return false;
        }

        if (
          creators.length > 0 &&
          !creators.every(creator => {
            if (creator.startsWith('!')) {
              return !entry.creators?.includes(creator.slice(1));
            } else if (creator.startsWith('~')) {
              if (!usingOr) {
                usingOr = true;
              }
              if (entry.creators?.includes(creator.slice(1))) {
                matchesSomeOr = true;
              }
              return true;
            } else {
              return entry.creators?.includes(creator);
            }
          })
        ) {
          return false;
        }

        if (isCommander) {
          if (!canBeACommander(entry)) {
            return false;
          }
        }
        if (standardLegality && entry.legalities.standard != standardLegality) {
          return false;
        }
        if (fourcbLegality && entry.legalities['4cb'] != fourcbLegality) {
          return false;
        }
        if (commanderLegality && entry.legalities.commander != commanderLegality) {
          return false;
        }
        if (collectorNumber) {
          if (!numCompOp(entry.collector_number, collectorNumber[1], collectorNumber[0])) {
            return false;
          }
        }
        if (manaValue) {
          if (!numCompOp(entry.mana_value, manaValue[1], manaValue[0])) {
            return false;
          }
        }
        if (power) {
          if (!numCompOp(entry.toFaces()[0].power, power[1], power[0])) {
            return false;
          }
        }
        if (toughness) {
          if (!numCompOp(entry.toFaces()[0].toughness, toughness[1], toughness[0])) {
            return false;
          }
        }
        if (loyalty) {
          if (!numCompOp(entry.toFaces()[0].loyalty, loyalty[1], loyalty[0])) {
            return false;
          }
        }
        if (defense) {
          if (!numCompOp(entry.toFaces()[0].defense, defense[1], defense[0])) {
            return false;
          }
        }

        if (colorNumber) {
          if (!numCompOp(entry.colors.length, colorNumber[1], colorNumber[0])) {
            return false;
          }
        }
        if (colorIdentityNumber) {
          if (
            !numCompOp(entry.color_identity.length, colorIdentityNumber[1], colorIdentityNumber[0])
          ) {
            return false;
          }
        }

        // TODO: handle split cards/adventures/transforms/flips better
        if (searchColors.length > 0) {
          if (!entry.colors) {
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
          if (hybridIdentityRule) {
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
        if (usingOr && !matchesSomeOr) {
          return false;
        }
        return true;
      })
      .sort(sortFunction(sortRule, dirRule));
    setResultSet(tempResults);

    const searchToSet = new URLSearchParams();

    const currentPageNumber = Math.floor(page / CHUNK_SIZE) + 1;

    if (paginationModel.state.currentPage !== currentPageNumber) {
      paginationModel.events.goTo(currentPageNumber);
    }

    if (nameSearch != '') {
      searchToSet.append('name', nameSearch);
    }
    if (idSearch != '') {
      searchToSet.append('id', idSearch);
    }
    if (costSearch.length > 0) {
      searchToSet.append('cost', costSearch.join(','));
    }
    if (typeSearch.length > 0) {
      searchToSet.append('type', typeSearch.join(','));
    }
    if (rulesSearch.length > 0) {
      searchToSet.append('rules', rulesSearch.join(','));
    }
    if (flavorSearch.length > 0) {
      searchToSet.append('flavor', flavorSearch.join(','));
    }
    if (creators.length > 0) {
      searchToSet.append('creators', creators.join(',,'));
    }
    if (tags.length > 0) {
      searchToSet.append('tags', tags.join(','));
    }
    if (searchColors.length > 0) {
      searchToSet.append('colors', searchColors.join(','));
    }
    if (colorComparison !== '>=') {
      searchToSet.append('colorComparison', colorComparison);
    }
    if (colorNumber) {
      searchToSet.append('colorNumber', `${colorNumber[1]}${colorNumber[0]}`);
    }
    if (searchColorIdentities.length > 0) {
      searchToSet.append('colorIdentity', searchColorIdentities.join(','));
    }
    if (colorIdentityComparison !== '<=') {
      searchToSet.append('colorIdentityComparison', colorIdentityComparison);
    }
    if (hybridIdentityRule) {
      searchToSet.append('hybridIdentityRule', 'true');
    }
    if (colorIdentityNumber) {
      searchToSet.append(
        'colorIdentityNumber',
        `${colorIdentityNumber[1]}${colorIdentityNumber[0]}`
      );
    }
    if (searchSet.length > 0) {
      searchToSet.append('set', searchSet.join(','));
    }
    if (includeExtraSets) {
      searchToSet.append('includeExtraSets', 'true');
    }
    if (extraSets.length > 0) {
      searchToSet.append('extraSets', extraSets.join(','));
    }
    if (searchToken != 'Cards') {
      searchToSet.append('token', searchToken);
    }
    if (standardLegality) {
      searchToSet.append('standard', standardLegality);
    }
    if (fourcbLegality) {
      searchToSet.append('4cb', fourcbLegality);
    }
    if (commanderLegality) {
      searchToSet.append('commander', commanderLegality);
    }
    if (isCommander) {
      searchToSet.append('isCommander', 'true');
    }
    if (collectorNumber) {
      searchToSet.append('cn', `${collectorNumber[1]}${collectorNumber[0]}`);
    }
    if (manaValue) {
      searchToSet.append('manaValue', `${manaValue[1]}${manaValue[0]}`);
    }
    if (power) {
      searchToSet.append('p', `${power[1]}${power[0]}`);
    }
    if (toughness) {
      searchToSet.append('t', `${toughness[1]}${toughness[0]}`);
    }
    if (loyalty) {
      searchToSet.append('l', `${loyalty[1]}${loyalty[0]}`);
    }
    if (defense) {
      searchToSet.append('d', `${defense[1]}${defense[0]}`);
    }
    if (sortRule != 'Color') {
      searchToSet.append('order', sortRule);
    }
    if (dirRule != 'Asc') {
      searchToSet.append('dir', dirRule);
    }
    if (tempResults.length < page && tempResults.length > 0) {
      paginationModel.events.goTo(1);
      setPageAtom(0);
    } else if (page > 0) {
      searchToSet.append('page', page.toString());
    }
    if (activeCard !== '') {
      searchToSet.append('activeCard', activeCard);
    }

    // history.pushState(
    //   undefined,
    //   '',
    //   location.origin + location.pathname + '?' + searchToSet.toString()
    // );
    const newUrl = `?${searchToSet.toString()}`;
    const currentUrl = location.search;

    if (newUrl != currentUrl && ![newUrl, currentUrl].every(url => ['', '?'].includes(url))) {
      // const getParamsWithoutTextFields = (url: string) => {
      //   const params = new URLSearchParams(url.substring(1));
      //   params.delete('name');
      //   params.delete('id');
      //   return params.toString();
      // };

      // const newWithoutText = getParamsWithoutTextFields(newUrl);
      // const currentWithoutText = getParamsWithoutTextFields(currentUrl);
      navigate(
        newUrl,
        {
          replace: false,
        } /**{ replace: newWithoutText==currentWithoutText || !shouldPushHistory }*/
      );
      // if (newWithoutText!=currentWithoutText && shouldPushHistory) {
      //   setShouldPushHistory(false);
      // }
    }
  }, [
    nameSearch,
    idSearch,
    costSearch,
    typeSearch,
    rulesSearch,
    flavorSearch,
    creators,
    tags,
    searchColors,
    colorComparison,
    colorNumber,
    searchColorIdentities,
    colorIdentityComparison,
    hybridIdentityRule,
    colorIdentityNumber,
    searchSet,
    includeExtraSets,
    extraSets,
    searchToken,
    standardLegality,
    fourcbLegality,
    commanderLegality,
    isCommander,
    collectorNumber,
    manaValue,
    power,
    toughness,
    loyalty,
    defense,
    sortRule,
    dirRule,
    page,
    activeCard,
    // shouldPushHistory,
    cards.length,
    // location.search,
  ]);

  return { resultSet, paginationModel };
};
