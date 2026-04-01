// hooks/useUrlSync.ts
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSetAtom, useAtom } from 'jotai';
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
  isSyncingFromUrlAtom,
  LegalType,
} from '../atoms/searchAtoms';

export const useUrlSync = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get all setters

  const setNameSearch = useSetAtom(nameSearchAtom);
  const setIdSearch = useSetAtom(idSearchAtom);
  const setCostSearch = useSetAtom(costSearchAtom);
  const setTypeSearch = useSetAtom(typeSearchAtom);
  const setRulesSearch = useSetAtom(rulesSearchAtom);
  const setFlavorSearch = useSetAtom(flavorSearchAtom);
  const setCreators = useSetAtom(creatorsAtom);
  const setTags = useSetAtom(tagsAtom);
  const setSearchColors = useSetAtom(searchColorsAtom);
  const setColorComparison = useSetAtom(colorComparisonAtom);
  const setColorNumber = useSetAtom(colorNumberAtom);
  const setSearchColorIdentities = useSetAtom(searchColorIdentitiesAtom);
  const setColorIdentityComparison = useSetAtom(colorIdentityComparisonAtom);
  const setHybridIdentityRule = useSetAtom(hybridIdentityRuleAtom);
  const setColorIdentityNumber = useSetAtom(colorIdentityNumberAtom);
  const setSearchSet = useSetAtom(searchSetAtom);
  const setSearchToken = useSetAtom(searchTokenAtom);
  const setLegality = useSetAtom(legalityAtom);
  const setIsCommander = useSetAtom(isCommanderAtom);
  const setManaValue = useSetAtom(manaValueAtom);
  const setPower = useSetAtom(powerAtom);
  const setToughness = useSetAtom(toughnessAtom);
  const setLoyalty = useSetAtom(loyaltyAtom);
  const setDefense = useSetAtom(defenseAtom);
  const setSortRule = useSetAtom(sortAtom);
  const setDirRule = useSetAtom(dirAtom);
  const setPage = useSetAtom(pageAtom);
  const setActiveCard = useSetAtom(activeCardAtom);

  const [isSyncingFromUrl, setIsSyncingFromUrl] = useAtom(isSyncingFromUrlAtom);
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  const parseOperatorValue = (str: string | null) => {
    if (!str) return undefined;
    const match = str.match(/^([<>]=?|=)(.+)$/);
    if (!match) return undefined;
    return {
      operator: match[1] as '<' | '<=' | '=' | '>=' | '>',
      value: parseInt(match[2])
    };
  };
  // useEffect(() => {
  //   if (syncTimeoutRef.current) {
  //     clearTimeout(syncTimeoutRef.current);
  //   }
  //   // Set flag to prevent useSearchResults from updating URL
  //   setIsSyncingFromUrl(true);
    
  //   const params = new URLSearchParams(location.search);
  //   // ... sync all atoms ...
    
  //   // Use setTimeout to reset the flag after atoms have updated
  //   setTimeout(() => {
  //     setIsSyncingFromUrl(false);
  //   }, 0);
  // }, [location.search]);
  // // Sync URL params to state when URL changes (back/forward navigation)
  useEffect(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Set flag to prevent useSearchResults from updating URL
    setIsSyncingFromUrl(true);
    
    const params = new URLSearchParams(location.search);
    // Set search inputs
    setNameSearch(params.get('name') || '');
    setIdSearch(params.get('id') || '');
    setCostSearch(params.get('cost')?.split(',').filter(Boolean) || []);
    setTypeSearch(params.get('type')?.split(',').filter(Boolean) || []);
    setRulesSearch(params.get('rules')?.split(',').filter(Boolean) || []);
    setFlavorSearch(params.get('flavor')?.split(',').filter(Boolean) || []);
    setCreators(params.get('creators')?.split(',,').filter(Boolean) || []);
    setTags(params.get('tags')?.split(',').filter(Boolean) || []);
    
    // Set color filters
    setSearchColors(params.get('colors')?.split(',').filter(Boolean) || []);
    setColorComparison((params.get('colorComparison') as any) || '>=');
    setColorNumber(parseOperatorValue(params.get('colorNumber')));
    setSearchColorIdentities(params.get('colorIdentity')?.split(',').filter(Boolean) || []);
    setColorIdentityComparison((params.get('colorIdentityComparison') as any) || '<=');
    setHybridIdentityRule(params.get('useHybrid') === 'true');
    setColorIdentityNumber(parseOperatorValue(params.get('colorIdentityNumber')));

    // Set set/legality filters
    setSearchSet(params.get('set')?.split(',').filter(Boolean) || []);
    setSearchToken((params.get('token') as 'Cards' | 'Tokens' | 'Both') || 'Cards');
    setLegality(params.get('legality')?.split(',').filter(Boolean) as LegalType[] || []);
    setIsCommander(params.get('isCommander') === 'true');

    // Set numeric filters
    setManaValue(parseOperatorValue(params.get('manaValue')));
    setPower(parseOperatorValue(params.get('p')));
    setToughness(parseOperatorValue(params.get('t')));
    setLoyalty(parseOperatorValue(params.get('l')));
    setDefense(parseOperatorValue(params.get('d')));

    // Set sort
    setSortRule((params.get('order') as any) || 'Color');
    setDirRule((params.get('dir') as any) || 'Asc');

    // Set pagination and active card
    setPage(parseInt(params.get('page') || '0'));
    setActiveCard(params.get('activeCard') || '');
    
    // Reset flag after all updates are complete
    syncTimeoutRef.current = setTimeout(() => {
      setIsSyncingFromUrl(false);
    }, 100);
  }, [location.search]); // This triggers on back/forward navigation

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);
};