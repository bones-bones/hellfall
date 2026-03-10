import styled from '@emotion/styled';

import { CheckboxGroup, NamedCheckboxGroup /**ColorCheckboxGroup*/ } from './inputs';
import { PillSearch } from './inputs';
import { TextInput } from '@workday/canvas-kit-react/text-input';
import { FormField } from '@workday/canvas-kit-react/form-field';
import cardTypes from '../data/types.json';
import creators_data from '../data/creators.json';
import tags_data from '../data/tags.json';
import { NumberSelector } from './inputs';
import { SearchCheckbox } from './SearchCheckbox';

import { useAtom } from 'jotai';
import {
  nameSearchAtom,
  idSearchAtom,
  costSearchAtom,
  rulesSearchAtom,
  searchCmcAtom,
  searchSetAtom,
  creatorsAtom,
  typeSearchAtom,
  searchColorComparisonAtom,
  searchColorsAtom,
  // searchColorNumberComparisonAtom,
  searchColorNumberAtom,
  searchColorIdentityComparisonAtom,
  searchColorIdentitiesAtom,
  // searchColorIdentityNumberComparisonAtom,
  searchColorIdentityNumberAtom,
  useHybridIdentityAtom,
  powerAtom,
  toughnessAtom,
  loyaltyAtom,
  defenseAtom,
  tagsAtom,
} from './searchAtoms';
import { StyledLabel } from './StyledLabel';
import { CardLegalityControls } from './search-controls/CardLegalityControls';
import { StyledComponentHolder } from './StyledComponentHolder';
import { HCSearchColor } from '../api-types';

// TODO: add or functionality (maybe just entirely switch over to how scryfall does it?)
// TODO: figure out type inference issue for cmc

export const SearchControls = () => {
  const [set, setSet] = useAtom(searchSetAtom);
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
  // const [colorNumberComparison, setColorNumberComparison] = useAtom(searchColorNumberComparisonAtom);
  const [searchColorIdentities, setSearchColorIdentitiesAtom] = useAtom(searchColorIdentitiesAtom);
  const [colorIdentityComparison, setColorIdentityComparison] = useAtom(
    searchColorIdentityComparisonAtom
  );
  const [useHybrid, setUseHybrid] = useAtom(useHybridIdentityAtom);
  const [searchColorIdentityNumber, setSearchColorIdentityNumber] = useAtom(searchColorIdentityNumberAtom);
  // const [colorIdentityNumberComparison, setColorIdentityNumberComparison] = useAtom(
    // searchColorIdentityNumberComparisonAtom
  // );

  return (
    <SearchContainer>
      <SearchCriteriaSection>
        <FormField label="Name">
          <TextInput
            defaultValue={nameSearch}
            onKeyDown={event => {
              if (event.key == 'Enter') {
                setNameSearch((event.target as any).value);
              }
            }}
            onBlur={event => {
              setNameSearch(event.target.value);
            }}
          />
        </FormField>
        <FormField label="Id">
          <TextInput
            defaultValue={idSearch}
            onKeyDown={event => {
              if (event.key == 'Enter') {
                setIdSearch((event.target as any).value);
              }
            }}
            onBlur={event => {
              setIdSearch(event.target.value);
            }}
          />
        </FormField>
        <PillSearch
          label={'Cost'}
          possibleValues={[]}
          defaultValues={costSearch}
          onChange={setCostSearch}
        />
        <PillSearch
          label={'Text'}
          possibleValues={[]}
          defaultValues={rulesSearch}
          onChange={setRulesSearch}
        />
        <PillSearch
          label={'Type'}
          possibleValues={cardTypes.data}
          defaultValues={typeSearch}
          onChange={setTypeSearch}
        />
        <PillSearch
          label={'Creator'}
          possibleValues={creators_data.data}
          defaultValues={creators}
          onChange={setCreators}
        />
        <PillSearch
          label={'Tags'}
          possibleValues={tags_data.data}
          defaultValues={tags}
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
          initialValue={searchColors}
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
              {['<=', '=', '>='].map(entry => {
                return <option key={entry}>{entry}</option>;
              })}
            </StyledManaSelect>
          </StyledComponentHolder>
        </NamedCheckboxGroup>
        <NumberSelector label={'Color Number'} onChange={setSearchColorNumber} initialValue={searchColorNumber} />
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
          initialValue={searchColorIdentities}
          onChange={setSearchColorIdentitiesAtom}
        >
          <StyledComponentHolder>
            <StyledLabel htmlFor="styledManaSelect">{'Color Identity Comparison'}</StyledLabel>
            <StyledManaSelect
              id="styledManaSelect"
              defaultValue={colorIdentityComparison}
              value={colorIdentityComparison}
              onChange={event => {
                setColorIdentityComparison(event.target.value as any);
              }}
            >
              {['<=', '=', '>='].map(entry => {
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
        <NumberSelector label={'Color Identity Number'} onChange={setSearchColorIdentityNumber} initialValue={searchColorIdentityNumber} />
      </SearchCriteriaSection>
      <SearchCriteriaSection>
        <CheckboxGroup
          initialValue={set}
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
          ]}
          onChange={setSet}
        />
        <CardLegalityControls />
        <NumberSelector label={'Mana value'} onChange={setSearchCmc} initialValue={searchCmc} />
        <NumberSelector label={'Power'} onChange={setPower} initialValue={power} />
        <NumberSelector label={'Toughness'} onChange={setToughness} initialValue={toughness} />
        <NumberSelector label={'Loyalty'} onChange={setLoyalty} initialValue={loyalty} />
        <NumberSelector label={'Defense'} onChange={setDefense} initialValue={defense} />
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
