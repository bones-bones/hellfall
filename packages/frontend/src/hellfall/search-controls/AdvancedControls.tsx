import styled from '@emotion/styled';

import {
  CheckboxGroup,
  NamedCheckboxGroup,
  BoxlessCheckboxGroup,
  SingleCheckbox,
  NamedHiddenCheckboxGroup /**ColorCheckboxGroup*/,
  PillSearch,
  NumberSelector,
} from '../inputs';
import { TextInput, FormField } from '@workday/canvas-kit-react';
import cardTypes from '@hellfall/shared/data/types.json';
import creators_data from '@hellfall/shared/data/creators.json';
import tags_data from '@hellfall/shared/data/tags.json';
import pips from '@hellfall/shared/data/pips.json';

import { useAtom } from 'jotai';
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
  // legalityAtom,
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
  // shouldPushHistoryAtom
} from '../atoms/searchAtoms.ts';
import { StyledLabel, StyledLegend } from '../StyledLabel.tsx';
import { StyledComponentHolder } from '../StyledComponentHolder.tsx';
import { useDebounce, useKeyPress } from '../../hooks';
import { useEffect, useState } from 'react';
import { extraSetList } from '@hellfall/shared/data/sets.ts';
import { HCSearchColors } from '@hellfall/shared/types';
import { looseOpList, looseOpType } from '../filters/types.ts';

// TODO: add or functionality (maybe just entirely switch over to how scryfall does it?)

export const SearchControls = () => {
  const [idSearch, setIdSearch] = useState('');
  const [nameSearch, setNameSearch] = useState<string[]>([]);
  const [costSearch, setCostSearch] = useState<string[]>([]);
  const [typeSearch, setTypeSearch] = useState<string[]>([]);
  const [rulesSearch, setRulesSearch] = useState<string[]>([]);
  const [flavorSearch, setFlavorSearch] = useState<string[]>([]);
  const [creators, setCreators] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [searchColors, setSearchColors] = useState<string[]>([]);
  const [colorComparison, setColorComparison] = useState<looseOpType>(':');
  const [colorNumber, setColorNumber] = useState<[number | undefined, looseOpType]>([
    undefined,
    ':',
  ]);
  const [searchColorIdentities, setSearchColorIdentities] = useState<string[]>([]);
  const [colorIdentityComparison, setColorIdentityComparison] = useState<looseOpType>(':');
  const [hybridIdentityRule, setHybridIdentityRule] = useState(false);
  const [colorIdentityNumber, setColorIdentityNumber] = useState<[number | undefined, looseOpType]>(
    [undefined, ':']
  );
  const [searchSet, setSearchSet] = useState<string[]>([]);
  const [includeExtraSets, setIncludeExtraSets] = useState(false);
  const [extraSets, setExtraSets] = useState<string[]>([]);
  const [searchToken, setSearchToken] = useState<'Cards' | 'Tokens' | 'Both'>('Cards');
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [standardLegality, setStandardLegality] = useState<'' | 'legal' | 'not_legal' | 'banned'>(
    ''
  );
  const [fourcbLegality, set4cbLegality] = useState<'' | 'legal' | 'not_legal' | 'banned'>('');
  const [commanderLegality, setCommanderLegality] = useState<'' | 'legal' | 'not_legal' | 'banned'>(
    ''
  );
  const [isCommander, setIsCommander] = useState(false);
  const [legalityOpen, setLegalityOpen] = useState(false);
  const [collectorNumber, setCollectorNumber] = useState<[number | undefined, looseOpType]>([
    undefined,
    ':',
  ]);
  const [manaValue, setManaValue] = useState<[number | undefined, looseOpType]>([undefined, ':']);
  const [power, setPower] = useState<[number | undefined, looseOpType]>([undefined, ':']);
  const [toughness, setToughness] = useState<[number | undefined, looseOpType]>([undefined, ':']);
  const [loyalty, setLoyalty] = useState<[number | undefined, looseOpType]>([undefined, ':']);
  const [defense, setDefense] = useState<[number | undefined, looseOpType]>([undefined, ':']);

  const textToOps: Record<string, looseOpType> = {
    '!': '!:',
    '?': '=',
    '!?': '!=',
    '?!': '!=',
  };
  const toOpAndValue = (text: string): string => {
    if (text.slice(0, 2) in textToOps) {
      return `${textToOps[text.slice(0, 2)]}"${text.slice(2)}"`;
    }
    if (text.slice(0, 1) in textToOps) {
      return `${textToOps[text.slice(0, 1)]}"${text.slice(1)}"`;
    }
    return `:"${text}"`;
  };

  const toQueryString = () => {
    const filters: string[] = [];
    const sets = searchSet.concat(extraSets);
    if (sets.length) {
      switch (searchToken) {
        case 'Cards': {
          if (sets.length == 1) {
            filters.push(`set:${sets[0]}`);
          } else {
            filters.push(`(${sets.map(set => `set:${set}`).join(' or ')})`);
          }
          break;
        }
        case 'Tokens': {
          if (sets.length == 1) {
            filters.push(`tokenset:${sets[0]}`);
          } else {
            filters.push(`(${sets.map(set => `tokenset:${set}`).join(' or ')})`);
          }
          break;
        }
        case 'Both': {
          if (sets.length == 1) {
            filters.push(`block:${sets[0]}`);
          } else {
            filters.push(`(${sets.map(set => `block:${set}`).join(' or ')})`);
          }
          break;
        }
      }
    }
    const orFilters: string[] = [];
    const addHandlingOr = (searchKeyword: string, searchTerm: string) => {
      if (searchTerm.startsWith('~')) {
        orFilters.push(searchKeyword + toOpAndValue(searchTerm.slice(1)));
      } else {
        filters.push(searchKeyword + toOpAndValue(searchTerm.slice(1)));
      }
    };
    const addAllHandlingOr = (searchKeyword: string, searchTerm: string[]) => {
      searchTerm.forEach(term => addHandlingOr(searchKeyword, term));
    };
    if (nameSearch.length) {
      addAllHandlingOr('name', nameSearch);
    }
    if (costSearch.length) {
      addAllHandlingOr('mana', costSearch);
    }
    if (typeSearch.length) {
      addAllHandlingOr('type', typeSearch);
    }
    if (rulesSearch.length) {
      addAllHandlingOr('oracle', rulesSearch);
    }
    if (flavorSearch.length) {
      addAllHandlingOr('flavor', flavorSearch);
    }
    if (creators.length) {
      addAllHandlingOr('creator', creators);
    }
    if (artists.length) {
      addAllHandlingOr('artist', artists);
    }
    if (tags.length) {
      addAllHandlingOr('tag', tags);
    }
    if (nameSearch.length) {
      addAllHandlingOr('name', nameSearch);
    }
    if (nameSearch.length) {
      addAllHandlingOr('name', nameSearch);
    }
    if (isCommander) {
      filters.push('is:commander');
    }
    if (standardLegality) {
      filters.push(`${standardLegality.replace('_', '')}:standard`);
    }
    if (fourcbLegality) {
      filters.push(`${fourcbLegality.replace('_', '')}:4cb`);
    }
    if (commanderLegality) {
      filters.push(`${commanderLegality.replace('_', '')}:commander`);
    }
    if (collectorNumber[0] != undefined) {
      filters.push(`number${collectorNumber[1]}${collectorNumber[0]}`);
    }
    if (manaValue[0] != undefined) {
      filters.push(`manavalue${manaValue[1]}${manaValue[0]}`);
    }
    if (power[0] != undefined) {
      filters.push(`power${power[1]}${power[0]}`);
    }
    if (toughness[0] != undefined) {
      filters.push(`toughness${toughness[1]}${toughness[0]}`);
    }
    if (loyalty[0] != undefined) {
      filters.push(`${loyalty[1]}${loyalty[0]}`);
    }
    if (defense[0] != undefined) {
      filters.push(`${defense[1]}${defense[0]}`);
    }
    if (colorNumber[0] != undefined) {
      filters.push(`color${colorNumber[1]}${colorNumber[0]}`);
    }
    if (colorIdentityNumber[0] != undefined) {
      filters.push(`identity${colorIdentityNumber[1]}${colorIdentityNumber[0]}`);
    }
    if (searchColors.length) {
      filters.push(`color${colorComparison}${searchColors.join('')}`);
    }
    if (searchColorIdentities.length) {
      filters.push(
        hybridIdentityRule
          ? `hybrid${colorIdentityComparison}${searchColorIdentities.join('')}`
          : `identity${colorIdentityComparison}${searchColorIdentities.join('')}`
      );
    }
    if (orFilters.length) {
      if (orFilters.length == 1) {
        filters.push(orFilters[0]);
      } else {
        filters.push(`(${orFilters.join(' or ')})`);
      }
    }
    return filters.join(' ');
  };
  const excludeFiles = ['symbols/emoji/', 'colorIndicators/'];
  const pipList = pips.data
    .filter(pip => !excludeFiles.some(file => pip.filename.includes(file)))
    .map(pip => '{' + pip.symbol + '}');

  return (
    <SearchContainer>
      <SearchCriteriaSection>
        <FormField label="Id">
          <TextInput value={idSearch} onChange={event => setIdSearch(event.target.value)} />
        </FormField>
        <PillSearch
          label={'Name'}
          possibleValues={[]}
          values={nameSearch}
          onChange={setNameSearch}
        />
        <PillSearch
          label={'Cost'}
          possibleValues={pipList}
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
          label={'Artist(s)'}
          possibleValues={[]}
          values={artists}
          onChange={setArtists}
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
          values={HCSearchColors}
          names={['White', 'Blue', 'Black', 'Red', 'Green', 'Purple', 'Colorless', 'Misc']}
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
              {looseOpList.map(entry => {
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
          values={HCSearchColors}
          names={['White', 'Blue', 'Black', 'Red', 'Green', 'Purple', 'Colorless', 'Misc']}
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
              {looseOpList.map(entry => {
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
          {extrasOpen ? (
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
                  values={extraSetList}
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
                    setSearchToken(event.target.value as 'Cards' | 'Tokens' | 'Both');
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
                  setExtrasOpen(false);
                }}
              >
                show less
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setExtrasOpen(true);
              }}
            >
              show more
            </button>
          )}
        </fieldset>
        <fieldset>
          <StyledLegend>{'Constructed Legality'}</StyledLegend>
          {legalityOpen ? (
            <>
              <StyledComponentHolder>
                <StyledLabel htmlFor="standard">{'Standard'}</StyledLabel>
                <StyledDropdownSelect
                  id="standard"
                  defaultValue={standardLegality}
                  value={standardLegality}
                  onChange={event => {
                    setStandardLegality(event.target.value as any);
                  }}
                >
                  {['', 'legal', 'not_legal', 'banned'].map(entry => {
                    return <option key={entry}>{entry}</option>;
                  })}
                </StyledDropdownSelect>
              </StyledComponentHolder>
              <StyledComponentHolder>
                <StyledLabel htmlFor="4cb">{'4 Card Blind'}</StyledLabel>
                <StyledDropdownSelect
                  id="4cb"
                  defaultValue={fourcbLegality}
                  value={fourcbLegality}
                  onChange={event => {
                    set4cbLegality(event.target.value as any);
                  }}
                >
                  {['', 'legal', 'not_legal', 'banned'].map(entry => {
                    return <option key={entry}>{entry}</option>;
                  })}
                </StyledDropdownSelect>
              </StyledComponentHolder>
              <StyledComponentHolder>
                <StyledLabel htmlFor="commander">{'Hellsmander'}</StyledLabel>
                <StyledDropdownSelect
                  id="commander"
                  defaultValue={commanderLegality}
                  value={commanderLegality}
                  onChange={event => {
                    setCommanderLegality(event.target.value as any);
                  }}
                >
                  {['', 'legal', 'not_legal', 'banned'].map(entry => {
                    return <option key={entry}>{entry}</option>;
                  })}
                </StyledDropdownSelect>
              </StyledComponentHolder>
              <SingleCheckbox
                label={'Can Be Your Commander'}
                onChange={setIsCommander}
                value={isCommander}
              />
              <br />
              <button
                onClick={() => {
                  setLegalityOpen(false);
                }}
              >
                show less
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setLegalityOpen(true);
              }}
            >
              show more
            </button>
          )}
        </fieldset>
      </SearchCriteriaSection>
      <SearchCriteriaSection>
        <NumberSelector
          label={'Collector number'}
          onChange={setCollectorNumber}
          value={collectorNumber}
        />
        <NumberSelector label={'Mana value'} onChange={setManaValue} value={manaValue} />
        <NumberSelector label={'Power'} onChange={setPower} value={power} />
        <NumberSelector label={'Toughness'} onChange={setToughness} value={toughness} />
        <NumberSelector label={'Loyalty'} onChange={setLoyalty} value={loyalty} />
        <NumberSelector label={'Defense'} onChange={setDefense} value={defense} />
        {/* TODO: Add other controls and add button to start search */}
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
