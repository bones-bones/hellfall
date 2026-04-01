import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { HCCard } from '../../api-types';
import { HCColor, HCSearchColor, HCColors } from '../../api-types';
import { cardsAtom } from '../atoms/cardsAtom';
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
  searchTokenAtom,
  legalityAtom,
  isCommanderAtom,
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
  isSyncingFromUrlAtom
} from '../atoms/searchAtoms';

import { sortFunction } from '../sortFunction';
import { canBeACommander } from '../canBeACommander';
import { toNumber } from '../inputs/NumberSelector';
import {
  colorCompOp,
  colorMiscReduce,
  hybridColorCompOp,
  hybridIdentityMiscReduce,
} from '../colorComps';
import { textEquals, textSearchIncludes } from '../textHandling';

const isSetInResults = (set: string, setOptions: string[]) => {
  return Boolean(setOptions.find(e => set.includes(e)));
};
export const useSearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // const lastUrlRef = useRef<string>();

  const [resultSet, setResultSet] = useState<HCCard.Any[]>([]);
  const cards = useAtomValue(cardsAtom).filter(
    e => !['C', 'HC0'].includes(e.set) && !e.tags?.includes('offensive')
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
  const searchToken = useAtomValue(searchTokenAtom);
  const legality = useAtomValue(legalityAtom);
  const isCommander = useAtomValue(isCommanderAtom);
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
  const [isSyncingFromUrl, setIsSyncingFromUrl] = useAtom(isSyncingFromUrlAtom);

  useEffect(() => {
    const tempResults = cards
      .filter(entry => {
        switch (searchToken) {
          case 'Cards':
            if (searchSet.length > 0 && !isSetInResults(entry.set, searchSet)) {
              return false;
            }
            if (entry.isActualToken) {
              return false;
            }
            break;
          case 'Tokens':
            if (
              searchSet.length > 0 &&
              !(
                'all_parts' in entry &&
                entry.all_parts
                  ?.filter(e => ['token_maker', 'meld_part', 'draft_partner'].includes(e.component))
                  .some(part => isSetInResults(part.set, searchSet))
              )
            ) {
              return false;
            }
            if (searchSet.length == 0 && !entry.isActualToken) {
              return false;
            }
            break;
          case 'Both':
            if (searchSet.length > 0) {
              if (
                !isSetInResults(entry.set, searchSet) &&
                !(
                  'all_parts' in entry &&
                  entry.all_parts
                    ?.filter(e =>
                      ['token_maker', 'meld_part', 'draft_partner'].includes(e.component)
                    )
                    .some(part => isSetInResults(part.set, searchSet))
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
          flavorSearch.length > 0 &&
          !flavorSearch.every(searchTerm => {
            const combined = entry
              .toFaces()
              .map(e => e.flavor_text || '')
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

        if (manaValue) {
          switch (manaValue.operator) {
            case '<=': {
              if (!(entry.mana_value <= manaValue.value)) {
                return false;
              }
              break;
            }
            case '<': {
              if (!(entry.mana_value < manaValue.value)) {
                return false;
              }
              break;
            }
            case '=': {
              if (!(entry.mana_value == manaValue.value)) {
                return false;
              }
              break;
            }
            case '>': {
              if (!(entry.mana_value > manaValue.value)) {
                return false;
              }
              break;
            }
            case '>=': {
              if (!(entry.mana_value >= manaValue.value)) {
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

        if (colorNumber) {
          const cardColorNumber = entry.colors.length;

          switch (colorNumber.operator) {
            case '<': {
              if (!(cardColorNumber < colorNumber.value)) {
                return false;
              }
              break;
            }
            case '<=': {
              if (!(cardColorNumber <= colorNumber.value)) {
                return false;
              }
              break;
            }
            case '=': {
              if (cardColorNumber !== colorNumber.value) {
                return false;
              }
              break;
            }
            case '>=': {
              if (!(cardColorNumber >= colorNumber.value)) {
                return false;
              }
              break;
            }
            case '>': {
              if (!(cardColorNumber > colorNumber.value)) {
                return false;
              }
              break;
            }
          }
        }

        if (colorIdentityNumber) {
          const cardColorIdentityNumber = entry.color_identity.length;

          switch (colorIdentityNumber.operator) {
            case '<': {
              if (!(cardColorIdentityNumber < colorIdentityNumber.value)) {
                return false;
              }
              break;
            }
            case '<=': {
              if (!(cardColorIdentityNumber <= colorIdentityNumber.value)) {
                return false;
              }
              break;
            }
            case '=': {
              if (cardColorIdentityNumber !== colorIdentityNumber.value) {
                return false;
              }
              break;
            }
            case '>=': {
              if (!(cardColorIdentityNumber >= colorIdentityNumber.value)) {
                return false;
              }
              break;
            }
            case '>': {
              if (!(cardColorIdentityNumber > colorIdentityNumber.value)) {
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
      searchToSet.append('colorNumber', `${colorNumber.operator}${colorNumber.value}`);
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
        `${colorIdentityNumber.operator}${colorIdentityNumber.value}`
      );
    }
    if (searchSet.length > 0) {
      searchToSet.append('set', searchSet.join(','));
    }
    if (searchToken != 'Cards') {
      searchToSet.append('token', searchToken);
    }
    if (legality.length > 0) {
      searchToSet.append('legality', legality.join(','));
    }
    if (isCommander) {
      searchToSet.append('isCommander', 'true');
    }
    if (manaValue) {
      searchToSet.append('manaValue', `${manaValue.operator}${manaValue.value}`);
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

    if (newUrl !== currentUrl && !isSyncingFromUrl/**&& lastUrlRef.current !=newUrl */ ) {
      // lastUrlRef.current=newUrl;
      // const getParamsWithoutTextFields = (url: string) => {
      //   const params = new URLSearchParams(url.substring(1));
      //   params.delete('name');
      //   params.delete('id');
      //   return params.toString();
      // };
    
      // const newWithoutText = getParamsWithoutTextFields(newUrl);
      // const currentWithoutText = getParamsWithoutTextFields(currentUrl);
      navigate(newUrl, {replace:false} /**{ replace: newWithoutText==currentWithoutText || !shouldPushHistory }*/);
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
    searchToken,
    legality,
    isCommander,
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
    // isSyncingFromUrl,
    cards.length,
    // location.search,
  ]);

  return resultSet;
};
