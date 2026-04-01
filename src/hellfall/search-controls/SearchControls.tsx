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
  manaValueAtom,
  powerAtom,
  toughnessAtom,
  loyaltyAtom,
  defenseAtom,
  // shouldPushHistoryAtom
} from '../atoms/searchAtoms';
import { StyledLabel } from '../StyledLabel';
import { CardLegalityControls } from './CardLegalityControls';
import { StyledComponentHolder } from '../StyledComponentHolder';
import { useDebounce } from '../../hooks/useDebounce';
import { act, useEffect, useState } from 'react';
import { useKeyPress } from '../../hooks';

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
  const [colorIdentityComparison, setColorIdentityComparison] = useAtom(colorIdentityComparisonAtom);
  const [hybridIdentityRule, setHybridIdentityRule] = useAtom(hybridIdentityRuleAtom);
  const [colorIdentityNumber, setColorIdentityNumber] = useAtom(colorIdentityNumberAtom);
  const [searchSet, setSearchSet] = useAtom(searchSetAtom);
  const [searchToken, setSearchToken] = useAtom(searchTokenAtom);
  const [manaValue, setManaValue] = useAtom(manaValueAtom);
  const [power, setPower] = useAtom(powerAtom);
  const [toughness, setToughness] = useAtom(toughnessAtom);
  const [loyalty, setLoyalty] = useAtom(loyaltyAtom);
  const [defense, setDefense] = useAtom(defenseAtom);

  // debouncing
  const [localName, setLocalName] = useState(nameSearch);
  const [localId, setLocalId] = useState(idSearch);
 
  const [activeBox, setActiveBox] = useState<'name' | 'id' | null>(null);
  // const [isFirstInteraction, setIsFirstInteraction] = useState(true);

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

  // useEffect(() => {
  //   if (debouncedName !== nameSearch && activeBox === 'name') {
  //     setNameSearch(debouncedName);
  //     if (isFirstInteraction) {
  //       setIsFirstInteraction(false);
  //     }
  //   }
  // }, [debouncedName, nameSearch, activeBox, isFirstInteraction, setNameSearch]);

  // useEffect(() => {
  //   if (debouncedId !== idSearch && activeBox === 'id') {
  //     setIdSearch(debouncedId);
  //     if (isFirstInteraction) {
  //       setIsFirstInteraction(false);
  //     }
  //   }
  // }, [debouncedId, idSearch, activeBox, isFirstInteraction, setIdSearch]);

  const handleNameFocus = () => {
    if (activeBox !== 'name') {
      setActiveBox('name');
      // setIsFirstInteraction(true);
    }
  };

  const handleIdFocus = () => {
    if (activeBox !== 'id') {
      setActiveBox('id');
      // setIsFirstInteraction(true);
    }
  };

  const handleNameBlur = () => {
    flushName();
    // if (localName !== nameSearch) {
    //   // setShouldPushHistory(true);
    //   setNameSearch(localName);
    //   setIsFirstInteraction(true);
    // }
    if (activeBox == 'name') {
      setActiveBox(null);
    }
  };

  const handleIdBlur = () => {
    flushId();
    // if (localId !== idSearch) {
    //   // setShouldPushHistory(true);
    //   setIdSearch(localId);
    //   setIsFirstInteraction(true);
    // }
    if (activeBox == 'id') {
      setActiveBox(null);
    }
  };

  useEffect(() => {
    if (enterPressed && activeBox) {
      // setShouldPushHistory(true);
      // setIsFirstInteraction(true);
      switch (activeBox) {
        case 'name':
          flushName();
          // if (localName !== nameSearch) {
          //   setNameSearch(localName);
          // }
          break;
        case 'id':
          flushId();
          // if (localId !== idSearch) {
          //   setIdSearch(localId);
          // }
          break;
      }
    }
  }, [enterPressed, /**activeBox, localName, localId, nameSearch, idSearch,*/ setNameSearch, setIdSearch, flushName, flushId]); 

  return (
    <SearchContainer>
      <SearchCriteriaSection>
        <FormField label="Name">
          <TextInput value={localName} onChange={event => setLocalName(event.target.value)} onFocus={handleNameFocus} onBlur={handleNameBlur} />
        </FormField>
        <FormField label="Id">
          <TextInput value={localId} onChange={event => setLocalId(event.target.value)} onFocus={handleIdFocus} onBlur={handleIdBlur} />
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
          onChange={setColorNumber}
          value={colorNumber}
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
          onChange={setSearchColorIdentities}
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
              checked={hybridIdentityRule === true}
              onChange={event => {
                setHybridIdentityRule(event.target.checked);
              }}
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
        >
          <StyledComponentHolder>
            <StyledLabel htmlFor="cards or tokens">{'Cards/Tokens?'}</StyledLabel>
            <StyledManaSelect
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
            </StyledManaSelect>
          </StyledComponentHolder>
        </CheckboxGroup>
        <CardLegalityControls />
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
const StyledManaSelect = styled('select')({ width: '100px', height: '30px' });
