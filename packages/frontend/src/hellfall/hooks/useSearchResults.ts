import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePaginationModel, getLastPage } from '@workday/canvas-kit-react/pagination';
import { HCCard, HCColor, HCColors } from '@hellfall/shared/types';
import { cardsAtom } from '../atoms/cardsAtom.ts';
import { useAtom, useAtomValue } from 'jotai';
import {
  idSearchAtom,
  nameSearchAtom,
  costSearchAtom,
  typeSearchAtom,
  rulesSearchAtom,
  flavorSearchAtom,
  creatorsAtom,
  artistsAtom,
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
import {
  filterColorIdentityMisc,
  filterColorsMisc,
  filterHybridIdentityMisc,
} from '../filters/filterColors.ts';
import { textEquals, textSearchIncludes } from '@hellfall/shared/utils/textHandling.ts';
import { CHUNK_SIZE } from '../constants.ts';
import { filterSetBoth, filterSetCard, filterSetToken } from '../filters/filterSet.ts';
import { filterTag, filterText, filterTextList } from '../filters/filterText.ts';
import { looseOpType, opType } from '../filters/types.ts';
import { getAllNames } from '../getNames.ts';
import { filterNumber, filterNumberString } from '../filters/filterNumber.ts';

export const useSearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [resultSet, setResultSet] = useState<HCCard.Any[]>([]);
  const cards = useAtomValue(cardsAtom).filter(
    e => !e.tags?.includes('offensive') && e.set != 'NotMagic'
  );
  const idSearch = useAtomValue(idSearchAtom);
  const nameSearch = useAtomValue(nameSearchAtom);
  const costSearch = useAtomValue(costSearchAtom);
  const typeSearch = useAtomValue(typeSearchAtom);
  const rulesSearch = useAtomValue(rulesSearchAtom);
  const flavorSearch = useAtomValue(flavorSearchAtom);
  const creators = useAtomValue(creatorsAtom);
  const artists = useAtomValue(artistsAtom);
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

  const textToOps: Record<string, opType> = {
    '!': '<',
    '?': '=',
    '!?': '!=',
    '?!': '!=',
  };
  const splitOp = (text: string): [looseOpType, string] => {
    if (text.slice(0, 2) in textToOps) {
      return [textToOps[text.slice(0, 2)], text.slice(2)];
    }
    if (text.slice(0, 1) in textToOps) {
      return [textToOps[text.slice(0, 1)], text.slice(1)];
    }
    return [':', text];
  };
  useEffect(() => {
    const tempResults = cards
      // getFilteredSet(cards, searchSet, extraSets, includeExtraSets, searchToken)
      .filter(entry => {
        switch (searchToken) {
          case 'Cards': {
            if (!filterSetCard(searchSet.concat(extraSets), '=', entry, includeExtraSets)) {
              return false;
            }
            break;
          }
          case 'Tokens': {
            if (!filterSetToken(searchSet.concat(extraSets), '=', entry, includeExtraSets)) {
              return false;
            }
            break;
          }
          case 'Both': {
            if (!filterSetBoth(searchSet.concat(extraSets), '=', entry, includeExtraSets)) {
              return false;
            }
            break;
          }
        }
        let usingOr = false;
        let matchesSomeOr = false;
        const filterTextListAllowingOr = (combined: string[], searchTerm: string) => {
          if (searchTerm.startsWith('~')) {
            if (!usingOr) {
              usingOr = true;
            }
            const split = splitOp(searchTerm.slice(1));
            if (filterTextList(combined, split[0], split[1])) {
              matchesSomeOr = true;
            }
            return true;
          } else {
            const split = splitOp(searchTerm);
            return filterTextList(combined, split[0], split[1]);
          }
        };
        // const tagMatches = (searchTerm: string) => {
        //   if (searchTerm.startsWith('~')) {
        //     if (!usingOr) {
        //       usingOr = true;
        //     }
        //     const split = splitOp(searchTerm.slice(1));
        //     if (filterTextList(combined, split[0], split[1])) {
        //       matchesSomeOr = true;
        //     }
        //     return true;
        //   } else {
        //     const split = splitOp(searchTerm);
        //     return filterTextList(combined, split[0], split[1]);
        //   }
        // };
        const everySearchTermMatchesListAllowingOr = (
          combined: string[],
          searchTerms: string[]
        ) => {
          return searchTerms.every(searchTerm => filterTextListAllowingOr(combined, searchTerm));
        };
        const filterTagListAllowingOr = (tags: string[], searchTerm: string,tag_notes:Record<string,string>|undefined) => {
          if (searchTerm.startsWith('~')) {
            if (!usingOr) {
              usingOr = true;
            }
            const split = splitOp(searchTerm.slice(1));
            if (filterTag(tags, split[0], split[1],tag_notes)) {
              matchesSomeOr = true;
            }
            return true;
          } else {
            const split = splitOp(searchTerm);
            return filterTag(tags, split[0], split[1],tag_notes);
          }
        };
        const everyTagMatches = (
          tags: string[],
          searchTerms: string[],
          tag_notes:Record<string,string>|undefined
        ) => {
          return searchTerms.every(searchTerm => filterTagListAllowingOr(tags, searchTerm,tag_notes));
        };
        // TODO: decide if this should use <= instead of =
        if (idSearch !== '' && !filterText(entry.id, '=', idSearch)) {
          return false;
        }

        if (nameSearch.length) {
          const combined = getAllNames(entry);
          if (!everySearchTermMatchesListAllowingOr(combined, nameSearch)) {
            return false;
          }
        }

        if (costSearch.length) {
          const combined = entry.toFaces().map(e => e.mana_cost);
          if (!everySearchTermMatchesListAllowingOr(combined, costSearch)) {
            return false;
          }
        }

        if (typeSearch.length) {
          const combined = [
            ...entry.toFaces().flatMap(e => e.supertypes || []),
            ...entry.toFaces().flatMap(e => e.types || []),
            ...entry.toFaces().flatMap(e => e.subtypes || []),
            ...entry.toFaces().map(e => e.type_line),
          ];
          if (!everySearchTermMatchesListAllowingOr(combined, typeSearch)) {
            return false;
          }
        }

        if (rulesSearch.length) {
          const combined = entry.toFaces().map(e => e.oracle_text);
          if (!everySearchTermMatchesListAllowingOr(combined, rulesSearch)) {
            return false;
          }
        }

        if (flavorSearch.length) {
          const combined = entry.toFaces().flatMap(e => e.flavor_text ?? []);
          if (!everySearchTermMatchesListAllowingOr(combined, flavorSearch)) {
            return false;
          }
        }

        if (creators.length) {
          const combined = entry.creators ?? [];
          if (!everySearchTermMatchesListAllowingOr(combined, creators)) {
            return false;
          }
        }

        if (artists.length) {
          const combined = entry.artists ?? [];
          if (!everySearchTermMatchesListAllowingOr(combined, artists)) {
            return false;
          }
        }

        if (tags) {
          if (!everyTagMatches(entry.tags ?? [],tags,entry.tag_notes)) {
            return false;
          }
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
          if (!filterNumberString(entry.collector_number, collectorNumber[1], collectorNumber[0])) {
            return false;
          }
        }
        if (manaValue) {
          if (!filterNumberString(entry.mana_value, manaValue[1], manaValue[0])) {
            return false;
          }
        }
        if (power) {
          if (!filterNumberString(entry.toFaces()[0].power, power[1], power[0])) {
            return false;
          }
        }
        if (toughness) {
          if (!filterNumberString(entry.toFaces()[0].toughness, toughness[1], toughness[0])) {
            return false;
          }
        }
        if (loyalty) {
          if (!filterNumberString(entry.toFaces()[0].loyalty, loyalty[1], loyalty[0])) {
            return false;
          }
        }
        if (defense) {
          if (!filterNumberString(entry.toFaces()[0].defense, defense[1], defense[0])) {
            return false;
          }
        }

        if (colorNumber) {
          if (!filterNumber(entry.colors.length, colorNumber[1], colorNumber[0])) {
            return false;
          }
        }
        if (colorIdentityNumber) {
          if (
            !filterNumber(
              entry.color_identity.length,
              colorIdentityNumber[1],
              colorIdentityNumber[0]
            )
          ) {
            return false;
          }
        }

        // TODO: handle split cards/adventures/transforms/flips better
        if (searchColors.length) {
          if (!filterColorsMisc(entry.colors, colorComparison, searchColors)) {
            return false;
          }
        }

        if (searchColorIdentities.length) {
          if (hybridIdentityRule) {
            if (
              !filterHybridIdentityMisc(
                entry.color_identity_hybrid,
                colorIdentityComparison,
                searchColorIdentities
              )
            ) {
              return false;
            }
          } else {
            if (
              !filterColorIdentityMisc(
                entry.color_identity,
                colorIdentityComparison,
                searchColorIdentities
              )
            ) {
              return false;
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

    if (idSearch != '') {
      searchToSet.append('id', idSearch);
    }
    nameSearch.forEach(entry => searchToSet.append('name', entry));

    costSearch.forEach(entry => searchToSet.append('cost', entry));

    typeSearch.forEach(entry => searchToSet.append('type', entry));

    rulesSearch.forEach(entry => searchToSet.append('rules', entry));

    flavorSearch.forEach(entry => searchToSet.append('flavor', entry));

    creators.forEach(entry => searchToSet.append('creator', entry));

    artists.forEach(entry => searchToSet.append('artist', entry));

    tags.forEach(entry => searchToSet.append('tag', entry));

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
    idSearch,
    nameSearch,
    costSearch,
    typeSearch,
    rulesSearch,
    flavorSearch,
    creators,
    artists,
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
