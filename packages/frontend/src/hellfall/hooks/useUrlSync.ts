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
  includeExtraSetsAtom,
  extraSetsAtom,
  searchTokenAtom,
  // legalityAtom,
  standardLegalityAtom,
  fourcbLegalityAtom,
  commanderLegalityAtom,
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
  // LegalType,
} from '../atoms/searchAtoms.ts';

export const useUrlSync = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get all setters

  const [nameSearch, setNameSearch] = useAtom(nameSearchAtom);
  const [idSearch, setIdSearch] = useAtom(idSearchAtom);
  const [costSearch, setCostSearch] = useAtom(costSearchAtom);
  const [typeSearch, setTypeSearch] = useAtom(typeSearchAtom);
  const [rulesSearch, setRulesSearch] = useAtom(rulesSearchAtom);
  const [flavorSearch, setFlavorSearch] = useAtom(flavorSearchAtom);
  const [creators, setCreators] = useAtom(creatorsAtom);
  const [tags, setTags] = useAtom(tagsAtom);
  const [searchColors, setSearchColors] = useAtom(searchColorsAtom);
  const [colorComparison, setColorComparison] = useAtom(colorComparisonAtom);
  const [colorNumber, setColorNumber] = useAtom(colorNumberAtom);
  const [searchColorIdentities, setSearchColorIdentities] = useAtom(searchColorIdentitiesAtom);
  const [colorIdentityComparison, setColorIdentityComparison] = useAtom(
    colorIdentityComparisonAtom
  );
  const [hybridIdentityRule, setHybridIdentityRule] = useAtom(hybridIdentityRuleAtom);
  const [colorIdentityNumber, setColorIdentityNumber] = useAtom(colorIdentityNumberAtom);
  const [searchSet, setSearchSet] = useAtom(searchSetAtom);
  const [includeExtraSets, setIncludeExtraSets] = useAtom(includeExtraSetsAtom);
  const [extraSets, setExtraSets] = useAtom(extraSetsAtom);
  const [searchToken, setSearchToken] = useAtom(searchTokenAtom);
  // const [legality, setLegality] = useAtom(legalityAtom);
  const [standardLegality, setStandardLegality] = useAtom(standardLegalityAtom);
  const [fourcbLegality, set4cbLegality] = useAtom(fourcbLegalityAtom);
  const [commanderLegality, setCommanderLegality] = useAtom(commanderLegalityAtom);
  const [isCommander, setIsCommander] = useAtom(isCommanderAtom);
  const [manaValue, setManaValue] = useAtom(manaValueAtom);
  const [power, setPower] = useAtom(powerAtom);
  const [toughness, setToughness] = useAtom(toughnessAtom);
  const [loyalty, setLoyalty] = useAtom(loyaltyAtom);
  const [defense, setDefense] = useAtom(defenseAtom);
  const [sortRule, setSortRule] = useAtom(sortAtom);
  const [dirRule, setDirRule] = useAtom(dirAtom);
  const [page, setPage] = useAtom(pageAtom);
  const [activeCard, setActiveCard] = useAtom(activeCardAtom);

  const parseOperatorValue = (str: string | null) => {
    if (!str) return undefined;
    const match = str.match(/^([<>]=?|=)(.+)$/);
    if (!match) return undefined;
    return {
      operator: match[1] as '<' | '<=' | '=' | '>=' | '>',
      value: parseInt(match[2]),
    };
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    // Set search inputs
    if (nameSearch != (params.get('name') || '')) {
      setNameSearch(params.get('name') || '');
    }
    if (idSearch != (params.get('id') || '')) {
      setIdSearch(params.get('id') || '');
    }
    if (costSearch != (params.get('cost')?.split(',').filter(Boolean) || [])) {
      setCostSearch(params.get('cost')?.split(',').filter(Boolean) || []);
    }
    if (typeSearch != (params.get('type')?.split(',').filter(Boolean) || [])) {
      setTypeSearch(params.get('type')?.split(',').filter(Boolean) || []);
    }
    if (rulesSearch != (params.get('rules')?.split(',').filter(Boolean) || [])) {
      setRulesSearch(params.get('rules')?.split(',').filter(Boolean) || []);
    }
    if (flavorSearch != (params.get('flavor')?.split(',').filter(Boolean) || [])) {
      setFlavorSearch(params.get('flavor')?.split(',').filter(Boolean) || []);
    }
    if (creators != (params.get('creators')?.split(',').filter(Boolean) || [])) {
      setCreators(params.get('creators')?.split(',').filter(Boolean) || []);
    }
    if (tags != (params.get('tags')?.split(',').filter(Boolean) || [])) {
      setTags(params.get('tags')?.split(',').filter(Boolean) || []);
    }

    // Set color filters
    if (searchColors != (params.get('colors')?.split(',').filter(Boolean) || [])) {
      setSearchColors(params.get('colors')?.split(',').filter(Boolean) || []);
    }
    if (colorComparison != ((params.get('colorComparison') as any) || '>=')) {
      setColorComparison((params.get('colorComparison') as any) || '>=');
    }
    if (colorNumber != parseOperatorValue(params.get('colorNumber'))) {
      setColorNumber(parseOperatorValue(params.get('colorNumber')));
    }
    if (searchColorIdentities != (params.get('colorIdentity')?.split(',').filter(Boolean) || [])) {
      setSearchColorIdentities(params.get('colorIdentity')?.split(',').filter(Boolean) || []);
    }
    if (colorIdentityComparison != ((params.get('colorIdentityComparison') as any) || '<=')) {
      setColorIdentityComparison((params.get('colorIdentityComparison') as any) || '<=');
    }
    if (hybridIdentityRule != (params.get('hybridIdentityRule') === 'true')) {
      setHybridIdentityRule(params.get('hybridIdentityRule') === 'true');
    }
    if (colorIdentityNumber != parseOperatorValue(params.get('colorIdentityNumber'))) {
      setColorIdentityNumber(parseOperatorValue(params.get('colorIdentityNumber')));
    }

    // Set set/legality filters
    if (searchSet != (params.get('set')?.split(',').filter(Boolean) || [])) {
      setSearchSet(params.get('set')?.split(',').filter(Boolean) || []);
    }
    if (includeExtraSets != (params.get('includeExtraSets') === 'true')) {
      setIncludeExtraSets(params.get('includeExtraSets') === 'true');
    }
    if (extraSets != (params.get('extraSets')?.split(',').filter(Boolean) || [])) {
      setExtraSets(params.get('extraSets')?.split(',').filter(Boolean) || []);
    }
    if (searchToken != ((params.get('token') as 'Cards' | 'Tokens' | 'Both') || 'Cards')) {
      setSearchToken((params.get('token') as 'Cards' | 'Tokens' | 'Both') || 'Cards');
    }
    if (
      standardLegality != ((params.get('standard') as '' | 'legal' | 'not_legal' | 'banned') || '')
    ) {
      setStandardLegality((params.get('standard') as '' | 'legal' | 'not_legal' | 'banned') || '');
    }
    if (fourcbLegality != ((params.get('4cb') as '' | 'legal' | 'not_legal' | 'banned') || '')) {
      set4cbLegality((params.get('4cb') as '' | 'legal' | 'not_legal' | 'banned') || '');
    }
    if (
      commanderLegality !=
      ((params.get('commander') as '' | 'legal' | 'not_legal' | 'banned') || '')
    ) {
      setCommanderLegality(
        (params.get('commander') as '' | 'legal' | 'not_legal' | 'banned') || ''
      );
    }
    if (isCommander != (params.get('isCommander') === 'true')) {
      setIsCommander(params.get('isCommander') === 'true');
    }
    // if (
    //   legality !=
    //   ((params.get('legality')?.split(',').filter(Boolean) as (
    //     | 'legal'
    //     | 'banned'
    //     | '4cbLegal'
    //     | 'hellsmanderLegal'
    //     | 'isCommander'
    //   )[]) || [])
    // ) {
    //   setLegality(
    //     (params.get('legality')?.split(',').filter(Boolean) as (
    //       | 'legal'
    //       | 'banned'
    //       | '4cbLegal'
    //       | 'hellsmanderLegal'
    //       | 'isCommander'
    //     )[]) || []
    //   );
    // }

    // Set numeric filters
    if (manaValue != parseOperatorValue(params.get('manaValue'))) {
      setManaValue(parseOperatorValue(params.get('manaValue')));
    }
    if (power != parseOperatorValue(params.get('p'))) {
      setPower(parseOperatorValue(params.get('p')));
    }
    if (toughness != parseOperatorValue(params.get('t'))) {
      setToughness(parseOperatorValue(params.get('t')));
    }
    if (loyalty != parseOperatorValue(params.get('l'))) {
      setLoyalty(parseOperatorValue(params.get('l')));
    }
    if (defense != parseOperatorValue(params.get('d'))) {
      setDefense(parseOperatorValue(params.get('d')));
    }

    // Set sort
    if (sortRule != ((params.get('order') as any) || 'Color')) {
      setSortRule((params.get('order') as any) || 'Color');
    }
    if (dirRule != ((params.get('dir') as any) || 'Asc')) {
      setDirRule((params.get('dir') as any) || 'Asc');
    }

    // Set pagination and active card
    if (page != parseInt(params.get('page') || '0')) {
      setPage(parseInt(params.get('page') || '0'));
    }
    if (activeCard != (params.get('activeCard') || '')) {
      setActiveCard(params.get('activeCard') || '');
    }

    // setIsCommander(params.get('isCommander') === 'true');
  }, [location.search]); // This triggers on back/forward navigation
};
