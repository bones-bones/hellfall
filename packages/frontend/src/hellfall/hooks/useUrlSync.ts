import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSetAtom, useAtom } from 'jotai';
import {
  // idSearchAtom,
  // nameSearchAtom,
  // costSearchAtom,
  // typeSearchAtom,
  // rulesSearchAtom,
  // flavorSearchAtom,
  // creatorsAtom,
  // artistsAtom,
  // tagsAtom,
  // searchColorsAtom,
  // colorComparisonAtom,
  // colorNumberAtom,
  // searchColorIdentitiesAtom,
  // colorIdentityComparisonAtom,
  // hybridIdentityRuleAtom,
  // colorIdentityNumberAtom,
  // searchSetAtom,
  // includeExtraSetsAtom,
  // extraSetsAtom,
  // searchTokenAtom,
  // standardLegalityAtom,
  // fourcbLegalityAtom,
  // commanderLegalityAtom,
  // isCommanderAtom,
  // collectorNumberAtom,
  // manaValueAtom,
  // powerAtom,
  // toughnessAtom,
  // loyaltyAtom,
  // defenseAtom,
  queryAtom,
  inputSortAtom,
  // sortAtom,
  // dirAtom,
  pageAtom,
  activeCardAtom,
  // parseOperatorValue,
} from '../atoms/searchAtoms.ts';

const listsAreEqual = (value1: string[], value2: string[]): boolean => {
  if (value1.length != value2.length) {
    return false;
  }
  value1.forEach((value, i) => {
    if (value != value2[i]) {
      return false;
    }
  });
  return true;
};

export const useUrlSync = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get all setters

  // const [idSearch, setIdSearch] = useAtom(idSearchAtom);
  // const [nameSearch, setNameSearch] = useAtom(nameSearchAtom);
  // const [costSearch, setCostSearch] = useAtom(costSearchAtom);
  // const [typeSearch, setTypeSearch] = useAtom(typeSearchAtom);
  // const [rulesSearch, setRulesSearch] = useAtom(rulesSearchAtom);
  // const [flavorSearch, setFlavorSearch] = useAtom(flavorSearchAtom);
  // const [creators, setCreators] = useAtom(creatorsAtom);
  // const [artists, setArtists] = useAtom(artistsAtom);
  // const [tags, setTags] = useAtom(tagsAtom);
  // const [searchColors, setSearchColors] = useAtom(searchColorsAtom);
  // const [colorComparison, setColorComparison] = useAtom(colorComparisonAtom);
  // const [colorNumber, setColorNumber] = useAtom(colorNumberAtom);
  // const [searchColorIdentities, setSearchColorIdentities] = useAtom(searchColorIdentitiesAtom);
  // const [colorIdentityComparison, setColorIdentityComparison] = useAtom(
  //   colorIdentityComparisonAtom
  // );
  // const [hybridIdentityRule, setHybridIdentityRule] = useAtom(hybridIdentityRuleAtom);
  // const [colorIdentityNumber, setColorIdentityNumber] = useAtom(colorIdentityNumberAtom);
  // const [searchSet, setSearchSet] = useAtom(searchSetAtom);
  // const [includeExtraSets, setIncludeExtraSets] = useAtom(includeExtraSetsAtom);
  // const [extraSets, setExtraSets] = useAtom(extraSetsAtom);
  // const [searchToken, setSearchToken] = useAtom(searchTokenAtom);
  // const [standardLegality, setStandardLegality] = useAtom(standardLegalityAtom);
  // const [fourcbLegality, set4cbLegality] = useAtom(fourcbLegalityAtom);
  // const [commanderLegality, setCommanderLegality] = useAtom(commanderLegalityAtom);
  // const [isCommander, setIsCommander] = useAtom(isCommanderAtom);
  // const [collectorNumber, setCollectorNumber] = useAtom(collectorNumberAtom);
  // const [manaValue, setManaValue] = useAtom(manaValueAtom);
  // const [power, setPower] = useAtom(powerAtom);
  // const [toughness, setToughness] = useAtom(toughnessAtom);
  // const [loyalty, setLoyalty] = useAtom(loyaltyAtom);
  // const [defense, setDefense] = useAtom(defenseAtom);
  const [query, setQuery] = useAtom(queryAtom);
  const [inputSorts, setInputSorts] = useAtom(inputSortAtom);
  // const [dirRule, setDirRule] = useAtom(dirAtom);
  const [page, setPage] = useAtom(pageAtom);
  const [activeCard, setActiveCard] = useAtom(activeCardAtom);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (query != (params.get('q') || '')) {
      setQuery(params.get('q') || '');
    }

    // Set sort
    if (!listsAreEqual(inputSorts, params.getAll('order'))) {
      setInputSorts(params.getAll('order'));
    }
    // Set pagination and active card
    if (page != parseInt(params.get('page') || '0')) {
      setPage(parseInt(params.get('page') || '0'));
    }
    if (activeCard != (params.get('activeCard') || '')) {
      setActiveCard(params.get('activeCard') || '');
    }
  }, [location.search]); // This triggers on back/forward navigation
};
