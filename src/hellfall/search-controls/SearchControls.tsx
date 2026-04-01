import styled from '@emotion/styled';

import { CheckboxGroup, NamedCheckboxGroup /**ColorCheckboxGroup*/ } from '../inputs';
import { PillSearch } from '../inputs';
import { TextInput } from '@workday/canvas-kit-react/text-input';
import { FormField } from '@workday/canvas-kit-react/form-field';
import cardTypes from '../../data/types.json';
import creators_data from '../../data/creators.json';
import tags_data from '../../data/tags.json';
import { NumberSelector } from '../inputs';
import { SearchCheckbox } from './SearchCheckbox';

import { useAtom } from 'jotai';
import {
  nameSearchAtom,
  idSearchAtom,
  costSearchAtom,
  rulesSearchAtom,
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
} from '../atoms/searchAtoms';
import { StyledLabel } from '../StyledLabel';
import { CardLegalityControls } from './CardLegalityControls';
import { StyledComponentHolder } from '../StyledComponentHolder';
import { useDebounce } from '../../hooks/useDebounce';
import { useEffect, useState } from 'react';

// TODO: add or functionality (maybe just entirely switch over to how scryfall does it?)

export const SearchControls = () => {
  const [set, setSet] = useAtom(searchSetAtom);
  const [cardsOrTokens, setCardsOrTokens] = useAtom(searchTokenAtom);
  const [nameSearch, setNameSearch] = useAtom(nameSearchAtom);
  const [idSearch, setIdSearch] = useAtom(idSearchAtom);
  const [costSearch, setCostSearch] = useAtom(costSearchAtom);
  const [rulesSearch, setRulesSearch] = useAtom(rulesSearchAtom);
  const [searchCmc, setSearchCmc] = useAtom(searchCmcAtom);
  const [power, setPower] = useAtom(powerAtom);
  const [toughness, setToughness] = useAtom(toughnessAtom);
  const [loyalty, setLoyalty] = useAtom(loyaltyAtom);
  const [defense, setDefense] = useAtom(defenseAtom);
  const [typeSearch, setTypeSearch] = useAtom(typeSearchAtom);
  const [creators, setCreators] = useAtom(creatorsAtom);
  const [tags, setTags] = useAtom(tagsAtom);
  const [searchColors, setSearchColors] = useAtom(searchColorsAtom);
  const [colorComparison, setColorComparison] = useAtom(searchColorComparisonAtom);
  const [searchColorNumber, setSearchColorNumber] = useAtom(searchColorNumberAtom);
  const [searchColorIdentities, setSearchColorIdentitiesAtom] = useAtom(searchColorIdentitiesAtom);
  const [colorIdentityComparison, setColorIdentityComparison] = useAtom(
    searchColorIdentityComparisonAtom
  );
  const [useHybrid, setUseHybrid] = useAtom(useHybridIdentityAtom);
  const [searchColorIdentityNumber, setSearchColorIdentityNumber] = useAtom(
    searchColorIdentityNumberAtom
  );
  // debouncing
  const [localName, setLocalName] = useState(nameSearch);
  const [localId, setLocalId] = useState(idSearch);
  const debouncedName = useDebounce(localName, 300);
  const debouncedId = useDebounce(localId, 300);

  useEffect(() => {
    setLocalName(nameSearch);
  }, [nameSearch]);

  useEffect(() => {
    setLocalId(idSearch);
  }, [idSearch]);

  useEffect(() => {
    setNameSearch(debouncedName);
  }, [debouncedName, setNameSearch]);

  useEffect(() => {
    setIdSearch(debouncedId);
  }, [debouncedId, setIdSearch]);

  return (
    <SearchContainer>
      <SearchCriteriaSection>
        <FormField label="Name">
          <TextInput value={localName} onChange={event => setLocalName(event.target.value)} />
        </FormField>
        <FormField label="Id">
          <TextInput value={localId} onChange={event => setLocalId(event.target.value)} />
        </FormField>
        <PillSearch
          label={'Cost'}
          possibleValues={[]}
          values={costSearch}
          onChange={setCostSearch}
        />
        <PillSearch
          label={'Text'}
          possibleValues={[]}
          values={rulesSearch}
          onChange={setRulesSearch}
        />
        <PillSearch
          label={'Type'}
          possibleValues={cardTypes.data}
          values={typeSearch}
          onChange={setTypeSearch}
        />
        <PillSearch
          label={'Creator'}
          possibleValues={creators_data.data}
          values={creators}
          onChange={setCreators}
        />
        <PillSearch
          label={'Tags'}
          possibleValues={tags_data.data}
          values={tags}
          onChange={setTags}
        />
      </SearchCriteriaSection>
      <SearchCriteriaSection>
        <NamedCheckboxGroup
          label="Colors"
          values={
            /**Object.values(HCSearchColor)*/ ['W', 'U', 'B', 'R', 'G', 'P', 'C', 'Misc bullshit']
          }
          names={
            /**Object.keys(HCSearchColor)*/ [
              'White',
              'Blue',
              'Black',
              'Red',
              'Green',
              'Purple',
              'Colorless',
              'Misc bullshit',
            ]
          }
          value={searchColors}
          onChange={setSearchColors}
        >
          <StyledComponentHolder>
            <StyledLabel htmlFor="styledManaSelect">{'Color Comparison'}</StyledLabel>
            <StyledManaSelect
              id="styledManaSelect"
              defaultValue={colorComparison}
              value={colorComparison}
              onChange={event => {
                setColorComparison(event.target.value as any);
              }}
            >
              {['<', '<=', '=', '>=', '>'].map(entry => {
                return <option key={entry}>{entry}</option>;
              })}
            </StyledManaSelect>
          </StyledComponentHolder>
        </NamedCheckboxGroup>
        <NumberSelector
          label={'Color Number'}
          onChange={setSearchColorNumber}
          value={searchColorNumber}
        />
        <NamedCheckboxGroup
          label="Color Identity (Commander)"
          values={
            /**Object.values(HCSearchColor)*/ ['W', 'U', 'B', 'R', 'G', 'P', 'C', 'Misc bullshit']
          }
          names={
            /**Object.keys(HCSearchColor)*/ [
              'White',
              'Blue',
              'Black',
              'Red',
              'Green',
              'Purple',
              'Colorless',
              'Misc bullshit',
            ]
          }
          value={searchColorIdentities}
          onChange={setSearchColorIdentitiesAtom}
        >
          <StyledComponentHolder>
            <StyledLabel htmlFor="styledColorIdentityelect">
              {'Color Identity Comparison'}
            </StyledLabel>
            <StyledManaSelect
              id="styledColorIdentityelect"
              defaultValue={colorIdentityComparison}
              value={colorIdentityComparison}
              onChange={event => {
                setColorIdentityComparison(event.target.value as any);
              }}
            >
              {['<', '<=', '=', '>=', '>'].map(entry => {
                return <option key={entry}>{entry}</option>;
              })}
            </StyledManaSelect>
          </StyledComponentHolder>
          <StyledComponentHolder>
            <StyledLabel htmlFor="useHybrid">{'Use Alternate Hybrid Rule'}</StyledLabel>
            <SearchCheckbox
              id="useHybrid"
              type="checkbox"
              checked={useHybrid === true}
              onChange={event => {
                setUseHybrid(event.target.checked);
              }}
            />
          </StyledComponentHolder>
        </NamedCheckboxGroup>
        <NumberSelector
          label={'Color Identity Number'}
          onChange={setSearchColorIdentityNumber}
          value={searchColorIdentityNumber}
        />
      </SearchCriteriaSection>
      <SearchCriteriaSection>
        <CheckboxGroup
          value={set}
          label={'Set'}
          values={[
            'HLC',
            'HC2',
            'HC3',
            'HC4',
            'HCV',
            'HC6',
            'HCC',
            'HCP',
            'HC7',
            'HC7.0',
            'HC7.1',
            'HCK',
            'HC8',
            'HC8.0',
            'HC8.1',
            'HCJ',
            'HKL',
          ]}
          onChange={setSet}
        >
          <StyledComponentHolder>
            <StyledLabel htmlFor="cards or tokens">{'Cards/Tokens?'}</StyledLabel>
            <StyledManaSelect
              id="cards or tokens"
              defaultValue={cardsOrTokens}
              value={cardsOrTokens}
              onChange={event => {
                setCardsOrTokens(event.target.value as any);
              }}
            >
              {['Cards', 'Tokens', 'Both'].map(entry => {
                return <option key={entry}>{entry}</option>;
              })}
            </StyledManaSelect>
          </StyledComponentHolder>
        </CheckboxGroup>
        <CardLegalityControls />
        <NumberSelector label={'Mana value'} onChange={setSearchCmc} value={searchCmc} />
        <NumberSelector label={'Power'} onChange={setPower} value={power} />
        <NumberSelector label={'Toughness'} onChange={setToughness} value={toughness} />
        <NumberSelector label={'Loyalty'} onChange={setLoyalty} value={loyalty} />
        <NumberSelector label={'Defense'} onChange={setDefense} value={defense} />
      </SearchCriteriaSection>
    </SearchContainer>
  );
};
const SearchCriteriaSection = styled('div')({
  justifyContent: 'space-evenly',
  paddingLeft: '30px',
});
const SearchContainer = styled('div')({ display: 'flex', flexWrap: 'wrap' });
const StyledManaSelect = styled('select')({ width: '100px', height: '30px' });
