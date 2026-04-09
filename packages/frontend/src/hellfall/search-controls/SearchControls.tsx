import styled from '@emotion/styled';

import {
  CheckboxGroup,
  NamedCheckboxGroup,
  BoxlessCheckboxGroup,
  SingleCheckbox,
  NamedHiddenCheckboxGroup /**ColorCheckboxGroup*/,
  PillSearch,
  NumberSelector
} from '../inputs';
import { TextInput, FormField } from '@workday/canvas-kit-react';
import cardTypes from '@hellfall/shared/data/tags.json';
import creators_data from '@hellfall/shared/data/creators.json';
import tags_data from '@hellfall/shared/data/tags.json';

import { useAtom } from 'jotai';
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
  legalityAtom,
  manaValueAtom,
  powerAtom,
  toughnessAtom,
  loyaltyAtom,
  defenseAtom,
  // shouldPushHistoryAtom
} from '../atoms/searchAtoms.ts';
import { StyledLabel, StyledLegend } from '../StyledLabel.tsx';
import { StyledComponentHolder } from '../StyledComponentHolder.tsx';
import { useDebounce, useKeyPress } from '../../hooks';
import { act, useEffect, useState } from 'react';

// TODO: add or functionality (maybe just entirely switch over to how scryfall does it?)

export const SearchControls = () => {
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
  const [open, setOpen] = useState(
    includeExtraSets || extraSets.length > 0 || searchToken != 'Cards'
  );
  const [legality, setLegality] = useAtom(legalityAtom);
  const [manaValue, setManaValue] = useAtom(manaValueAtom);
  const [power, setPower] = useAtom(powerAtom);
  const [toughness, setToughness] = useAtom(toughnessAtom);
  const [loyalty, setLoyalty] = useAtom(loyaltyAtom);
  const [defense, setDefense] = useAtom(defenseAtom);

  // debouncing
  const [localName, setLocalName] = useState(nameSearch);
  const [localId, setLocalId] = useState(idSearch);

  const [activeBox, setActiveBox] = useState<'name' | 'id' | null>(null);

  const enterPressed = useKeyPress('Enter');

  const [debouncedName, flushName] = useDebounce(localName, 300);
  const [debouncedId, flushId] = useDebounce(localId, 300);

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

  const handleNameFocus = () => {
    if (activeBox !== 'name') {
      setActiveBox('name');
    }
  };

  const handleIdFocus = () => {
    if (activeBox !== 'id') {
      setActiveBox('id');
    }
  };

  const handleNameBlur = () => {
    flushName();
    if (activeBox == 'name') {
      setActiveBox(null);
    }
  };

  const handleIdBlur = () => {
    flushId();
    if (activeBox == 'id') {
      setActiveBox(null);
    }
  };

  useEffect(() => {
    if (enterPressed && activeBox) {
      switch (activeBox) {
        case 'name':
          flushName();
          break;
        case 'id':
          flushId();
          break;
      }
    }
  }, [enterPressed, setNameSearch, setIdSearch, flushName, flushId]);

  return (
    <SearchContainer>
      <SearchCriteriaSection>
        <FormField label="Name">
          <TextInput
            value={localName}
            onChange={event => setLocalName(event.target.value)}
            onFocus={handleNameFocus}
            onBlur={handleNameBlur}
          />
        </FormField>
        <FormField label="Id">
          <TextInput
            value={localId}
            onChange={event => setLocalId(event.target.value)}
            onFocus={handleIdFocus}
            onBlur={handleIdBlur}
          />
        </FormField>
        <PillSearch
          label={'Cost'}
          possibleValues={[]}
          values={costSearch}
          onChange={setCostSearch}
        />
        <PillSearch
          label={'Type'}
          possibleValues={cardTypes.data}
          values={typeSearch}
          onChange={setTypeSearch}
        />
        <PillSearch
          label={'Text'}
          possibleValues={[]}
          values={rulesSearch}
          onChange={setRulesSearch}
        />
        <PillSearch
          label={'Flavor'}
          possibleValues={[]}
          values={flavorSearch}
          onChange={setFlavorSearch}
        />
        <PillSearch
          label={'Creator(s)'}
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
            <StyledLabel htmlFor="StyledDropdownSelect">{'Color Comparison'}</StyledLabel>
            <StyledDropdownSelect
              id="StyledDropdownSelect"
              defaultValue={colorComparison}
              value={colorComparison}
              onChange={event => {
                setColorComparison(event.target.value as any);
              }}
            >
              {['<', '<=', '=', '>=', '>'].map(entry => {
                return <option key={entry}>{entry}</option>;
              })}
            </StyledDropdownSelect>
          </StyledComponentHolder>
        </NamedCheckboxGroup>
        <NumberSelector label={'Color Number'} onChange={setColorNumber} value={colorNumber} />
      </SearchCriteriaSection>
      <SearchCriteriaSection>
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
          onChange={setSearchColorIdentities}
        >
          <StyledComponentHolder>
            <StyledLabel htmlFor="styledColorIdentityelect">
              {'Color Identity Comparison'}
            </StyledLabel>
            <StyledDropdownSelect
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
            </StyledDropdownSelect>
          </StyledComponentHolder>
          <StyledComponentHolder>
            <SingleCheckbox
              label={'Use Alternate Hybrid Rule'}
              onChange={setHybridIdentityRule}
              value={hybridIdentityRule}
            />
          </StyledComponentHolder>
        </NamedCheckboxGroup>
        <NumberSelector
          label={'Color Identity Number'}
          onChange={setColorIdentityNumber}
          value={colorIdentityNumber}
        />
      </SearchCriteriaSection>
      <SearchCriteriaSection>
        <CheckboxGroup
          value={searchSet}
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
          onChange={setSearchSet}
        />
      </SearchCriteriaSection>
      <SearchCriteriaSection>
        <fieldset>
          <StyledLegend>{'Extras'}</StyledLegend>
          {open ? (
            <>
              {/* <StyledComponentHolder> */}
              <SingleCheckbox
                label={'Include Extra Sets'}
                onChange={setIncludeExtraSets}
                value={includeExtraSets}
              />
              {/* </StyledComponentHolder> */}
              <StyledComponentHolder>
                <BoxlessCheckboxGroup
                  value={extraSets}
                  label={'Extra Sets'}
                  values={['HCV.1', 'HCV.2', 'HCV.3', 'HCV.4', 'C', 'HCT', 'SFT']}
                  onChange={setExtraSets}
                />
              </StyledComponentHolder>
              <StyledComponentHolder>
                <StyledLabel htmlFor="cards or tokens">{'Cards/Tokens?'}</StyledLabel>
                <StyledDropdownSelect
                  id="cards or tokens"
                  defaultValue={searchToken}
                  value={searchToken}
                  onChange={event => {
                    setSearchToken(event.target.value as any);
                  }}
                >
                  {['Cards', 'Tokens', 'Both'].map(entry => {
                    return <option key={entry}>{entry}</option>;
                  })}
                </StyledDropdownSelect>
              </StyledComponentHolder>
              <br />
              <button
                onClick={() => {
                  setOpen(false);
                }}
              >
                show less
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setOpen(true);
              }}
            >
              show more
            </button>
          )}
        </fieldset>
        <NamedHiddenCheckboxGroup
          label="Constructed Legality"
          values={['constructedLegal', '4cbLegal', 'hellsmanderLegal', 'isCommander']}
          names={[
            'Standard Legal',
            '4 Card Blind Legal',
            'Hellsmander Legal',
            'Can Be Your Commander',
          ]}
          value={legality}
          onChange={setLegality}
        />
        {/* </SearchCriteriaSection>
      <SearchCriteriaSection> */}
        <NumberSelector label={'Mana value'} onChange={setManaValue} value={manaValue} />
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
const StyledDropdownSelect = styled('select')({ width: '100px', height: '30px' });
