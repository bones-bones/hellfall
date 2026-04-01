// useResetSearch.ts
import { useSetAtom } from 'jotai';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {
  activeCardAtom,
  offsetAtom,
  nameSearchAtom,
  idSearchAtom,
  costSearchAtom,
  rulesSearchAtom,
  flavorSearchAtom,
  searchCmcAtom,
  searchSetAtom,
  searchTokenAtom,
  creatorsAtom,
  typeSearchAtom,
  searchColorComparisonAtom,
  searchColorsAtom,
  searchColorNumberAtom,
  searchColorIdentityComparisonAtom,
  searchColorIdentitiesAtom,
  searchColorIdentityNumberAtom,
  useHybridIdentityAtom,
  powerAtom,
  toughnessAtom,
  loyaltyAtom,
  defenseAtom,
  tagsAtom,
  sortAtom,
  dirAtom,
  legalityAtom,
  isCommanderAtom,
  extraFiltersAtom,
} from './atoms/searchAtoms';

export const useResetSearch = () => {
  const location = useLocation();

  // All the setters
  const setOffset = useSetAtom(offsetAtom);
  const setActiveCard = useSetAtom(activeCardAtom);
  const setNameSearch = useSetAtom(nameSearchAtom);
  const setIdSearch = useSetAtom(idSearchAtom);
  const setCostSearch = useSetAtom(costSearchAtom);
  const setCreators = useSetAtom(creatorsAtom);
  const setRulesSearch = useSetAtom(rulesSearchAtom);
  const setFlavorSearch = useSetAtom(flavorSearchAtom);
  const setSearchCmc = useSetAtom(searchCmcAtom);
  const setSearchSet = useSetAtom(searchSetAtom);
  const setSearchToken = useSetAtom(searchTokenAtom);
  const setTypeSearch = useSetAtom(typeSearchAtom);
  const setColorComparison = useSetAtom(searchColorComparisonAtom);
  const setSearchColors = useSetAtom(searchColorsAtom);
  const setSearchColorNumber = useSetAtom(searchColorNumberAtom);
  const setColorIdentityComparison = useSetAtom(searchColorIdentityComparisonAtom);
  const setSearchColorIdentities = useSetAtom(searchColorIdentitiesAtom);
  const setSearchColorIdentityNumber = useSetAtom(searchColorIdentityNumberAtom);
  const setUseHybrid = useSetAtom(useHybridIdentityAtom);
  const setPower = useSetAtom(powerAtom);
  const setToughness = useSetAtom(toughnessAtom);
  const setLoyalty = useSetAtom(loyaltyAtom);
  const setDefense = useSetAtom(defenseAtom);
  const setTags = useSetAtom(tagsAtom);
  const setSort = useSetAtom(sortAtom);
  const setDir = useSetAtom(dirAtom);
  const setLegality = useSetAtom(legalityAtom);
  const setIsCommander = useSetAtom(isCommanderAtom);
  const setExtraFilters = useSetAtom(extraFiltersAtom);

  useEffect(() => {
    if (location.state?.reset) {
      debugger;
      // Reset pagination and active card
      setOffset(0);
      setActiveCard('');

      // Reset search inputs
      setNameSearch('');
      setIdSearch('');
      setCostSearch([]);
      setTypeSearch([]);
      setRulesSearch([]);
      setFlavorSearch([]);
      setCreators([]);
      setTags([]);

      // Reset set filters
      setSearchSet([]);
      setSearchToken('Cards');

      // Reset color filters
      setSearchColors([]);
      setColorComparison('>=');
      setSearchColorNumber(undefined);
      setSearchColorIdentities([]);
      setColorIdentityComparison('<=');
      setSearchColorIdentityNumber(undefined);
      setUseHybrid(false);

      // Reset numeric filters
      setSearchCmc(undefined);
      setPower(undefined);
      setToughness(undefined);
      setLoyalty(undefined);
      setDefense(undefined);

      // Reset sort and other filters
      setSort('Color');
      setDir('Asc');
      setLegality([]);
      setIsCommander(false);
      setExtraFilters([]);
    }
  }, [
    location.state,
    setOffset,
    setActiveCard,
    setNameSearch,
    setIdSearch,
    setCostSearch,
    setTypeSearch,
    setRulesSearch,
    setFlavorSearch,
    setCreators,
    setTags,
    setSearchSet,
    setSearchToken,
    setSearchColors,
    setColorComparison,
    setSearchColorNumber,
    setSearchColorIdentities,
    setColorIdentityComparison,
    setSearchColorIdentityNumber,
    setUseHybrid,
    setSearchCmc,
    setPower,
    setToughness,
    setLoyalty,
    setDefense,
    setSort,
    setDir,
    setLegality,
    setIsCommander,
    setExtraFilters,
  ]);
};
